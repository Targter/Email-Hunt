import { prisma } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  const campaigns = await prisma.campaign.findMany({
    where: { userId: session?.user.id },
    include: { _count: { select: { jobDescriptions: true } } },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Outreach Campaigns</h1>
      <div className="grid gap-4">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="text-white font-bold">{c.name}</p>
              <p className="text-slate-500 text-xs">
                {c._count.jobDescriptions} Roles Targeted
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] uppercase border border-indigo-500/20">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
