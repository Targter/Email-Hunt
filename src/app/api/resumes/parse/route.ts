import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function POST(req: Request) {
  try {
    const { resumeId, rawText } = await req.json();

    if (!resumeId || !rawText) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        parsedText: rawText,
        // Optional: you can set status to 'ready' if you add that field
      },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: "Failed to save parsed text" }, { status: 500 });
  }
}