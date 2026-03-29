import { Client } from "@upstash/qstash";

export const qstashClient = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
});