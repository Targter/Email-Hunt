import { Worker, Job } from "bullmq";
import { prisma } from "../lib/db";
import { redisConnection } from "../lib/redis";
import { getAuthenticatedGmail } from "@/src/lib/google-client";
import { composeRawEmail } from "../lib/email-composer";

export const outreachWorker = new Worker(
  "email-outreach",
  async (job: Job) => {
    const { emailId, userId } = job.data;

    // 1. Fetch Email and check status (Idempotency Guard)
    const email = await prisma.outboundEmail.findUnique({
      where: { id: emailId },
      include: { campaign: true }
    });

    if (!email || email.status === "sent" || email.status === "cancelled") return;
    if (email.campaign.status !== "active") return;

    // 2. Lock for processing
    await prisma.outboundEmail.update({
      where: { id: emailId },
      data: { status: "processing" }
    });

    try {
      // 3. Initialize Gmail with automatic token refresh
      const gmail = await getAuthenticatedGmail(userId);

      // 4. Send via Gmail API
      const raw = composeRawEmail({
        to: email.recipientEmail,
        subject: email.subject,
        body: email.generatedBody,
      });

      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      // 5. Success Logging
      await prisma.$transaction([
        prisma.outboundEmail.update({
          where: { id: emailId },
          data: {
            status: "sent",
            sentAt: new Date(),
            providerMessageId: res.data.id,
          },
        }),
        prisma.emailLog.create({
          data: {
            emailId,
            event: "delivered",
          },
        }),
      ]);

      console.log(`[SUCCESS] Email ${emailId} sent to ${email.recipientEmail}`);
    } catch (error: any) {
      const isRateLimit = error.code === 429;
      const retryCount = email.retryCount + 1;
      const shouldFail = retryCount >= 3 || error.code === 400; // 400 = Permanent Fail

      await prisma.outboundEmail.update({
        where: { id: emailId },
        data: {
          status: shouldFail ? "failed" : "queued",
          retryCount,
          errorMessage: error.message,
        },
      });

      console.error(`[ERROR] Email ${emailId} failed: ${error.message}`);
      
      // If it's a transient error, re-throw to trigger BullMQ exponential backoff
      if (!shouldFail) throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Low concurrency to keep Gmail reputation safe
    limiter: {
      max: 1,
      duration: 30000, // Hard limit: 1 email every 30 seconds per worker
    },
  }
);

outreachWorker.on("failed", (job, err) => {
  console.error(`[FATAL] Job ${job?.id} failed definitely: ${err.message}`);
});