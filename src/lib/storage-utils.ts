import { supabaseAdmin } from "./supabase-admin";

export async function getResumeDownloadUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_BUCKET!)
    .createSignedUrl(path, 60 * 15); // Valid for 15 minutes

  if (error) throw error;
  return data.signedUrl;
}