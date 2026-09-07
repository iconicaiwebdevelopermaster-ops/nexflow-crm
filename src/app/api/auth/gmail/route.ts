import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail-client';

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
