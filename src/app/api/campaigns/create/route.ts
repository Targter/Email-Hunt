// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/src/lib/auth";
// import { prisma } from "@/src/lib/db";
// import { generateTailoredEmail } from "@/src/lib/ai";
// // import { scheduleCampaignJobs } from "@/src/lib/scheduler";
// import { qstashClient } from "@/src/lib/queue";


// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const { name, resumeId, jobDescriptions } = await req.json();

//     const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
//     if (!resume?.parsedText) return NextResponse.json({ error: "Resume text missing" }, { status: 400 });

//     const campaign = await prisma.campaign.create({
//       data: { name, userId: session.user.id, status: "active" },
//     });

//     const createdEmailIds: string[] = [];

//     // Process JDs: Gemini 1.5 Pro is fast, but we map to maintain sequence
//     for (const jd of jobDescriptions) {
//       const { subject, body } = await generateTailoredEmail(resume.parsedText, jd.text);

//       const jdRecord = await prisma.jobDescription.create({
//         data: {
//           campaignId: campaign.id,
//           companyName: jd.company,
//           roleTitle: jd.title,
//           recipientEmail: jd.email,
//           jdText: jd.text,
//           status: "ready",
//         },
//       });

//       console.log("subJect:",subject,"body:",body)
//       console.log("SubJect:",subject)
//       console.log("body:",body)
//       const email = await prisma.outboundEmail.create({
//         data: {
//           campaignId: campaign.id,
//           resumeId: resume.id,
//           jobDescriptionId: jdRecord.id,
//           recipientEmail: jd.email,
//           subject,
//           generatedBody: body,
//           idempotencyKey: `idx_${campaign.id}_${jdRecord.id}`,
//           scheduledFor: new Date(),
//           status: "queued",
//         },
//       });
//       createdEmailIds.push(email.id);
//     }

//     // // Hand off to BullMQ for staggered delivery
//     // await scheduleCampaignJobs(
//     //   session.user.id,
//     //   campaign.id,
//     //   createdEmailIds,
//     //   session.user.dailyLimit
//     // );

//     await qstashClient.publishJSON({
//       url: `${process.env.NEXTAUTH_URL}/api/worker/process`, // The webhook endpoint
//       body: {
//         emailId: email.id,
//         userId: session.user.id
//       },
//       // Staggering: 10/20/50 per day logic
//       delay: index * intervalSeconds, 
//       retries: 3,
//     });
  
//     return NextResponse.json({ 
//       success: true, 
//       campaignId: campaign.id, 
//       jobsQueued: createdEmailIds.length 
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { generateTailoredEmail } from "@/src/lib/ai";
import { qstashClient } from "@/src/lib/queue"; // Ensure this exports the QStash client

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, resumeId, jobDescriptions } = await req.json();

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume?.parsedText) return NextResponse.json({ error: "Resume text missing" }, { status: 400 });

    const campaign = await prisma.campaign.create({
      data: { name, userId: session.user.id, status: "active" },
    });

    // --- FIX 1: Calculate interval based on user's daily limit ---
    // 86400 seconds = 24 hours
    const dailyLimit = session.user.dailyLimit || 10;
    const intervalSeconds = Math.floor(86400 / dailyLimit);

    const createdEmailIds: string[] = [];

    // --- FIX 2: Use .entries() to get the 'index' variable ---
    for (const [index, jd] of jobDescriptions.entries()) {
      const { subject, body } = await generateTailoredEmail(resume.parsedText, jd.text);

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

      const email = await prisma.outboundEmail.create({
        data: {
          campaignId: campaign.id,
          resumeId: resume.id,
          jobDescriptionId: jdRecord.id,
          recipientEmail: jd.email,
          subject,
          generatedBody: body,
          idempotencyKey: `idx_${campaign.id}_${jdRecord.id}`,
          scheduledFor: new Date(),
          status: "queued",
        },
      });

      createdEmailIds.push(email.id);

      // --- FIX 3: Move QStash call INSIDE the loop so 'email' and 'index' are available ---
      await qstashClient.publishJSON({
        // Ensure NEXTAUTH_URL is defined in your .env (e.g., http://localhost:3000 or your production domain)
        url: `${process.env.NEXTAUTH_URL}/api/worker/process`, 
        body: {
          emailId: email.id, // Now 'email' is defined from the prisma create above
          userId: session.user.id
        },
        // Spread emails over time: index 0 = now, index 1 = +interval, etc.
        delay: index * intervalSeconds, 
        retries: 3,
      });
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