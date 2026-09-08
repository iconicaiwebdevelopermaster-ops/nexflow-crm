import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/gmail-client';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=no_code', req.url));
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const origin = req.nextUrl.origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/gmail/callback`;

    const oauth2Client = getOAuth2Client(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || 'connected@gmail.com';

    await prisma.gmailAccount.upsert({
      where: {
        userId_email: {
          userId: session.user.id,
          email: email,
        },
      },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
        scope: tokens.scope || '',
        isActive: true,
      },
      create: {
        userId: session.user.id,
        email: email,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
        scope: tokens.scope || '',
        isActive: true,
      },
    });

    return NextResponse.redirect(new URL('/settings?success=gmail_connected', req.url));
  } catch (error: any) {
    console.error('Gmail OAuth Callback Error:', error);
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
  }
}