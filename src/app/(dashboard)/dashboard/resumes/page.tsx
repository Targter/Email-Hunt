import { prisma } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);
  const resumes = await prisma.resume.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Resumes</h1>
      <div className="grid gap-4">
        {resumes.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between"
          >
            <span className="text-white">{r.fileName}</span>
            <span className="text-slate-500 text-xs">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
