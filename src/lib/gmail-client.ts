import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/gmail/callback'
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
}

export async function getGmailClientForUser(userId: string) {
  const account = await prisma.gmailAccount.findFirst({
    where: { userId, isActive: true },
  });

  if (!account) {
    throw new Error('No active Gmail account connected for this user.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiryDate ? Number(account.expiryDate) : undefined,
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    await prisma.gmailAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokens.access_token || account.accessToken,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : account.expiryDate,
        refreshToken: tokens.refresh_token || account.refreshToken,
      },
    });
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}
