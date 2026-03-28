import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getAuthenticatedGmail } from "@/src/lib/google-client";
import { generateTailoredEmail, pickBestResume } from "@/src/lib/ai";


const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  // 1. Verify Request is actually from Upstash
  const signature = req.headers.get("upstash-signature");
  const body = await req.text();
  
  const isValid = await receiver.verify({
    signature: signature!,
    body: body,
  }).catch(() => false);

  if (!isValid) return new Response("Unauthorized", { status: 401 });

  const { emailId, userId } = JSON.parse(body);

  // 2. Execution Logic (Same as your old worker)
  try {
    const email = await prisma.outboundEmail.findUnique({
      where: { id: emailId },
      include: { campaign: true, jobDescription: true }
    });

    if (!email || email.status === "sent") return NextResponse.json({ ok: true });

    // AI Logic & Gmail Send
    const gmail = await getAuthenticatedGmail(userId);
    // ... generateTailoredEmail call ...
    // ... gmail.users.messages.send call ...

    await prisma.outboundEmail.update({
      where: { id: emailId },
      data: { status: "sent", sentAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("QStash Worker Error:", error);
    // Returning 500 triggers QStash to retry based on your configuration
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}