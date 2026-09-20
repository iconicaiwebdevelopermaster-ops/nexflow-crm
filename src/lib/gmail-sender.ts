import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

interface SendMailParams {
  userId: string;
  to: string;
  subject: string;
  body: string;
}

export async function dispatchOutreachEmail({ userId, to, subject, body }: SendMailParams) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { gmailAccounts: { where: { isActive: true } } },
  });

  if (!user) throw new Error('User not found');

  const senderName = user.fromName || user.name || 'NexFlow Outreach';

  const activeOAuth = user.gmailAccounts[0];
  if (activeOAuth) {
    let accessToken = activeOAuth.accessToken;

    if (activeOAuth.tokenExpiry && new Date() >= activeOAuth.tokenExpiry && activeOAuth.refreshToken) {
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            refresh_token: activeOAuth.refreshToken,
            grant_type: 'refresh_token',
          }),
        });
        const data = await res.json();
        if (data.access_token) {
          accessToken = data.access_token;
          await prisma.gmailAccount.update({
            where: { id: activeOAuth.id },
            data: {
              accessToken: data.access_token,
              tokenExpiry: new Date(Date.now() + (data.expires_in || 3600) * 1000),
            },
          });
        }
      } catch (err) {
        console.error('OAuth token refresh failed:', err);
      }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: activeOAuth.email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: activeOAuth.refreshToken || undefined,
        accessToken,
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${activeOAuth.email}>`,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    return { messageId: info.messageId, method: 'OAUTH' };
  }

  if (user.smtpUser && user.smtpPass) {
    const transporter = nodemailer.createTransport({
      host: user.smtpHost || 'smtp.gmail.com',
      port: user.smtpPort || 587,
      secure: false,
      auth: {
        user: user.smtpUser,
        pass: user.smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${user.smtpUser}>`,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    return { messageId: info.messageId, method: 'SMTP' };
  }

  throw new Error('No active email transport found. Please connect Gmail OAuth or configure SMTP in Settings.');
}
