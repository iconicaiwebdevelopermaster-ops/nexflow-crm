import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { leadName, company, niche, city, website } = await req.json();

    let user: any = null;
    if (session?.user?.email) {
      user = await prisma.user.findFirst({
        where: { email: { equals: session.user.email, mode: 'insensitive' } }
      });
    }

    const provider = user?.aiProvider || 'deepseek';
    const deepseekKey = user?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
    const openaiKey = user?.openaiApiKey || process.env.OPENAI_API_KEY;

    const fromName = user?.fromName || 'Aamir';
    const promoteSite = user?.promoteSite || 'our platform';
    const promoteTopic = user?.promoteTopic || 'growth collaboration';
    const extraPrompt = user?.aiExtraPrompt || 'keep it casual and short';

    const prompt = `Write a short, highly personalized cold outreach email from ${fromName}.
Target Lead: ${leadName} at ${company} (${niche} in ${city}, Website: ${website}).
We are pitching/promoting: ${promoteTopic} (${promoteSite}).
Extra instructions: ${extraPrompt}.

Return strictly valid JSON with "subject" and "body" keys. Do NOT use markdown codeblocks.`;

    // 1. DEEPSEEK PROVIDER (Very cheap)
    if (provider === 'deepseek' && deepseekKey) {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: user?.aiModel || 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = JSON.parse(data.choices[0].message.content);
        return NextResponse.json({ success: true, subject: content.subject, body: content.body });
      }
    }

    // 2. OPENAI PROVIDER
    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: user?.aiModel || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = JSON.parse(data.choices[0].message.content);
        return NextResponse.json({ success: true, subject: content.subject, body: content.body });
      }
    }

    // Template Fallback if AI not configured
    return NextResponse.json({
      success: true,
      subject: `Quick question regarding ${company}`,
      body: `Hi ${leadName},\n\nI came across ${company} in ${city} and was really impressed by your work in ${niche}.\n\nI wanted to reach out regarding ${promoteTopic} over at ${promoteSite}.\n\nBest regards,\n${fromName}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}