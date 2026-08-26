import nodemailer from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  body: string;
  userSmtp?: {
    host?: string | null;
    port?: number | null;
    user?: string | null;
    pass?: string | null;
  };
}

export async function sendOutreachEmail({ to, subject, body, userSmtp }: SendMailParams) {
  const host = userSmtp?.host || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = userSmtp?.port || Number(process.env.SMTP_PORT) || 465;
  const user = userSmtp?.user || process.env.GMAIL_USER;
  const pass = userSmtp?.pass || process.env.GMAIL_PASS;

  if (!user || !pass) {
    throw new Error("SMTP credentials are not configured. Please add your Gmail SMTP details in Settings.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const formattedHtml = body.replace(/\n/g, "<br/>");

  const info = await transporter.sendMail({
    from: `NexPulseLabs Outreach <${user}>`,
    to,
    subject,
    text: body,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">${formattedHtml}</div>`,
  });

  return info;
}