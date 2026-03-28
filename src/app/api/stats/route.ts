import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";

// 
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await prisma.outboundEmail.groupBy({
    by: ['status'],
    where: { campaign: { userId: session.user.id } },
    _count: true,
  });
  const recentLogs = await prisma.outboundEmail.findMany({
    where: { campaign: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      recipientEmail: true,
      status: true,
      sentAt: true,
      errorMessage: true,
      jobDescription: { select: { companyName: true, roleTitle: true } }
    }
  });
  return NextResponse.json({ stats, recentLogs });
}