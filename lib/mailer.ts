import nodemailer from "nodemailer";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// one transport, reused across sends (module scope survives across requests
// on a long-lived Node host)
const transporter = (() => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
})();

export async function sendMessageEmail(fromEmail: string, message: string) {
  if (!transporter) {
    throw new Error(
      "EMAIL_USER / EMAIL_APP_PASSWORD are not set. See .env.local.example.",
    );
  }

  const user = process.env.EMAIL_USER as string;
  const to = process.env.EMAIL_TO || user;

  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const sentAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  await transporter.sendMail({
    from: `"hmu · 4j3" <${user}>`,
    to,
    replyTo: fromEmail,
    subject: `hmu: message from ${fromEmail}`,
    text: `From: ${fromEmail}\nSent: ${sentAt}\n\n${message}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #e4e4e7; border-radius: 16px;">
        <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #f4f4f5;">hmu · new message</p>
        <p style="margin: 0 0 16px; font-size: 13px; color: #a1a1aa;">from <a href="mailto:${escapeHtml(fromEmail)}" style="color: #e4e4e7;">${escapeHtml(fromEmail)}</a> · ${escapeHtml(sentAt)}</p>
        <div style="padding: 16px; background: #17171a; border: 1px solid #27272a; border-radius: 12px; font-size: 15px; line-height: 1.6; white-space: normal;">${safeMessage}</div>
        <p style="margin: 16px 0 0; font-size: 12px; color: #52525b;">hit reply to respond directly to ${escapeHtml(fromEmail)}</p>
      </div>
    `,
  });
}
