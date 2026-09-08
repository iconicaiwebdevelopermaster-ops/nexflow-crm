import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail-client';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const dynamicRedirectUri = `${origin}/api/auth/gmail/callback`;

    const url = getAuthUrl(dynamicRedirectUri);
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Gmail OAuth Init Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}