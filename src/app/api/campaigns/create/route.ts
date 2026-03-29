import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { generateTailoredEmail } from "@/src/lib/ai";
import { qstashClient } from "@/src/lib/queue";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, resumeId, jobDescriptions } = body;


    // --- CRITICAL FIX 1: Validate that jobDescriptions is an Array ---
    if (!jobDescriptions || !Array.isArray(jobDescriptions)) {
      console.error("Payload error: jobDescriptions is not an array", body);
      return NextResponse.json({ error: "jobDescriptions must be an array of jobs" }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume?.parsedText) return NextResponse.json({ error: "Resume text missing" }, { status: 400 });

    const campaign = await prisma.campaign.create({
      data: { name, userId: session.user.id, status: "active" },
    });

    const dailyLimit = session.user.dailyLimit || 10;
    const intervalSeconds = Math.floor(86400 / dailyLimit);
    const createdEmailIds: string[] = [];

    // --- FIX 2: Safe iteration ---
    for (let index = 0; index < jobDescriptions.length; index++) {
      const jd = jobDescriptions[index];
      console.log("resumeParsedText:",resume.parsedText,jd.text)
      const { subject, body: emailBody } = await generateTailoredEmail(resume.parsedText, jd.text);

      const jdRecord = await prisma.jobDescription.create({
        data: {
          campaignId: campaign.id,
          companyName: jd.company,
          roleTitle: jd.title,
          recipientEmail: jd.email,
          jdText: jd.text,
          status: "ready",
        },
      });

      const emailRecord = await prisma.outboundEmail.create({
        data: {
          campaignId: campaign.id,
          resumeId: resume.id,
          jobDescriptionId: jdRecord.id,
          recipientEmail: jd.email,
          subject,
          generatedBody: emailBody,
          idempotencyKey: `idx_${campaign.id}_${jdRecord.id}`,
          scheduledFor: new Date(Date.now() + (index * intervalSeconds * 1000)), // Set specific time
          status: "queued",
        },
      });

      createdEmailIds.push(emailRecord.id);

      // --- FIX 3: QStash Logic ---
       // --- FIX 3: QStash Logic ---
      if (process.env.NEXTAUTH_URL) {
        await qstashClient.publishJSON({
          url: `${process.env.NEXTAUTH_URL}/api/worker/process`, 
          body: {
            emailId: emailRecord.id,
            userId: session.user.id
          },
          delay: index * intervalSeconds, 
          retries: 3,
        });
      }
    }
    return NextResponse.json({ 
      success: true, 
      campaignId: campaign.id, 
      jobsQueued: createdEmailIds.length 
    });
  } catch (error: any) {
    console.error("Campaign Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}