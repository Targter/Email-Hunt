import { outreachQueue } from "./queue";

export async function scheduleCampaignJobs(
  userId: string,
  campaignId: string,
  emailIds: string[],
  dailyLimit: number | any
) {
  // Logic: Spread emails evenly across 24 hours (86,400,000 ms)
  const msInDay = 24 * 60 * 60 * 1000;
  const interval = Math.floor(msInDay / dailyLimit);

  const jobs = emailIds.map((emailId, index) => ({
    name: "outreach-job",
    data: { emailId, userId },
    opts: {
      delay: index * interval + (Math.random() * 5000), // Base delay + small jitter
      jobId: `outreach-${emailId}`, // Native BullMQ idempotency
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000 * 60 * 15, // 15 min starting backoff
      },
    },
  }));

  return await outreachQueue.addBulk(jobs);
}