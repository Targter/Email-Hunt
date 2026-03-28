import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { ResumeUpload } from "@/src/components/dashboard/ResumeUpload";
import { BulkCampaignCreator as CampaignCreator } from "@/src/components/dashboard/CampaignCreator";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userResumes = await prisma.resume.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: "desc" },
  });
  console.log("userResumes:", userResumes);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          System Console
        </h1>
        <p className="text-slate-500 text-sm font-mono tracking-widest uppercase mt-1">
          Status: Active // User_ID: {session?.user.id.split("-")[0]} //
          Daily_Quota: {session?.user.dailyLimit}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Step 1: Context
          </h3>
          <ResumeUpload initialResumes={userResumes} />
        </div>

        <div className="md:col-span-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Step 2: Execution
          </h3>
          {userResumes.length > 0 ? (
            <CampaignCreator resumes={userResumes} />
          ) : (
            <div className="p-12 text-center bg-slate-900/20 border border-slate-800 rounded-2xl text-slate-500">
              Upload a resume to initialize the campaign creator.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
