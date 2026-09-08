import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export function getOAuth2Client(customRedirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = customRedirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/gmail/callback';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(customRedirectUri?: string) {
  const oauth2Client = getOAuth2Client(customRedirectUri);
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