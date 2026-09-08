import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/gmail/callback`;

    console.log('Initiating Gmail OAuth with redirectUri:', redirectUri);

    const url = getAuthUrl(redirectUri);
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Gmail OAuth Init Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}