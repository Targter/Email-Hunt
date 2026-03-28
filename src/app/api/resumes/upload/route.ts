import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { supabaseAdmin } from "@/src/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";


enum ResumeCategory {
  sde = "sde",
  ai = "ai",
  webdev = "webdev"
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categoryy = formData.get("category") ;
       const category = categoryy as ResumeCategory;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if(!category) return NextResponse.json({error:"no category added or given"},{status:400})
    // 1. Prepare File for Supabase
    const buffer = await file.arrayBuffer();
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `${session.user.id}/${fileName}`;

    // 2. Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;
    // 3. Save to Prisma (category is now included)
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        category: category,
        s3Url: data.path, // We store the PATH, not the URL (more secure)
      },
    });

    return NextResponse.json({ id: resume.id });
  } catch (error: any) {
    console.error("Supabase Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}