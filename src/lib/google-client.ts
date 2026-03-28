import { google } from "googleapis";
import { prisma } from "@/src/lib/db";
import { Credentials } from "google-auth-library";

export async function getAuthenticatedGmail(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account || !account.refresh_token) {
    throw new Error("MISSING_REFRESH_TOKEN");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token ?? undefined,
  });

  oauth2Client.on("tokens", async (tokens: Credentials) => {
    if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}