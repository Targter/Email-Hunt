export function composeRawEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Content-Transfer-Encoding: 7bit`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "",
    body,
  ];
  const message = messageParts.join("\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}