// import { Receiver } from "@upstash/qstash";
// import { NextResponse } from "next/server";
// import { prisma } from "@/src/lib/db";
// import { getAuthenticatedGmail } from "@/src/lib/google-client";
// import { generateTailoredEmail, pickBestResume } from "@/src/lib/ai";


// const receiver = new Receiver({
//   currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
//   nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
// });

// export async function POST(req: Request) {
//   // 1. Verify Request is actually from Upstash
//   const signature = req.headers.get("upstash-signature");
//   const body = await req.text();
  
//   const isValid = await receiver.verify({
//     signature: signature!,
//     body: body,
//   }).catch(() => false);

//   if (!isValid) return new Response("Unauthorized", { status: 401 });

//   const { emailId, userId } = JSON.parse(body);

//   // 2. Execution Logic (Same as your old worker)
//   try {
//     const email = await prisma.outboundEmail.findUnique({
//       where: { id: emailId },
//       include: { campaign: true, jobDescription: true }
//     });

//     if (!email || email.status === "sent") return NextResponse.json({ ok: true });

//     // AI Logic & Gmail Send
//     const gmail = await getAuthenticatedGmail(userId);
//     // ... generateTailoredEmail call ...
//     // ... gmail.users.messages.send call ...

//     await prisma.outboundEmail.update({
//       where: { id: emailId },
//       data: { status: "sent", sentAt: new Date() }
//     });

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("QStash Worker Error:", error);
//     // Returning 500 triggers QStash to retry based on your configuration
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getAuthenticatedGmail } from "@/src/lib/google-client";
import { composeRawEmail } from "@/src/lib/email-composer";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  // 1. Verify Request is actually from Upstash (Security)
  const signature = req.headers.get("upstash-signature");
  const bodyText = await req.text();
  
  // Local bypass for testing (if signature is missing and we are on localhost)
  const isLocal = process.env.NEXTAUTH_URL?.includes("localhost");
  
  if (!isLocal) {
    const isValid = await receiver.verify({
      signature: signature!,
      body: bodyText,
    }).catch(() => false);

    if (!isValid) return new Response("Unauthorized", { status: 401 });
  }

  const { emailId, userId } = JSON.parse(bodyText);

  try {
    // 2. Fetch the prepared email data
    const email = await prisma.outboundEmail.findUnique({
      where: { id: emailId },
      include: { 
        jobDescription: true,
        resume: true 
      }
    });

    // Safeguard: Don't double-send or send non-existent emails
    if (!email || email.status === "sent") {
      return NextResponse.json({ skipped: true, message: "Email already sent or not found" });
    }

    // 3. Initialize Authenticated Gmail Client
    // This handles the token refresh automatically via lib/google-client.ts
    const gmail = await getAuthenticatedGmail(userId);

    // 4. Compose the Raw MIME message
    const raw = composeRawEmail({
      to: email.recipientEmail,
      subject: email.subject,
      body: email.generatedBody,
    });

    // 5. Execute Egress (Send to Gmail API)
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: raw,
      },
    });

    // 6. Update Database Status
    await prisma.outboundEmail.update({
      where: { id: emailId },
      data: { 
        status: "sent", 
        sentAt: new Date(),
        providerMessageId: response.data.id // Store Gmail's ID for tracking
      }
    });
    // 
     prisma.emailLog.create({
    data: {
      emailId: emailId,
      event: "delivered", // Using the Enum we defined: delivered
    }
  })

    console.log(`[SUCCESS] Cold mail sent to ${email.recipientEmail} via Gmail API`);

    return NextResponse.json({ success: true, messageId: response.data.id });

  } catch (error: any) {
    console.error("Worker Execution Error:", error);

    // Update DB with the error so the user can see it in the monitor
    // Inside the catch block:
await prisma.$transaction([
  prisma.outboundEmail.update({
    where: { id: emailId },
    data: { 
      status: "failed", 
      errorMessage: error.message 
    }
  }),
  // CREATE THE ERROR LOG
  prisma.emailLog.create({
    data: {
      emailId: emailId,
      event: "bounced", // Or create a "failed" event type
      metadata: { error: error.message } // Store the raw error for Abhay to debug
    }
  })
]);

    // Returning 500 triggers QStash to retry automatically
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}