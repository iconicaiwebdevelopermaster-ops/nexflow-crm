import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { leadName = 'Partner', company = 'Business', niche = 'Growth', city = 'Global', website = '' } = body;

    let user: any = null;
    if (session?.user?.email) {
      user = await prisma.user.findFirst({
        where: { email: { equals: session.user.email, mode: 'insensitive' } }
      });
    }

    const provider = user?.aiProvider || 'deepseek';
    const deepseekKey = user?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
    const openaiKey = user?.openaiApiKey || process.env.OPENAI_API_KEY;

    const fromName = user?.fromName || 'Iconic Usama';
    const promoteSite = user?.promoteSite || 'besttradelogic.com';
    const promoteTopic = user?.promoteTopic || 'AI Web Development & CRM Automation';
    const extraPrompt = user?.aiExtraPrompt || 'keep it short under 4 sentences, casual tone';

    const prompt = `Write a short, high-converting 1-to-1 cold outreach email from ${fromName}.
Target Lead: ${leadName} at ${company} (${niche} in ${city}, Website: ${website}).
Pitch Context: We offer ${promoteTopic} over at ${promoteSite}.
Extra Guidelines: ${extraPrompt}.

STRICT REQUIREMENT: Return ONLY a valid JSON object with keys "subject" and "body". Do NOT use markdown code blocks or additional text.`;

    // 1. DEEPSEEK AI PROVIDER (Very cheap & fast)
    if (provider === 'deepseek' && deepseekKey) {
      try {
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
          const parsed = JSON.parse(data.choices[0].message.content);
          return NextResponse.json({
            success: true,
            provider: 'DeepSeek AI',
            subject: parsed.subject,
            body: parsed.body
          });
        }
      } catch (deepseekErr) {
        console.warn('DeepSeek call failed, falling back to OpenAI/Template:', deepseekErr);
      }
    }

    // 2. OPENAI PROVIDER
    if (openaiKey) {
      try {
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
          const parsed = JSON.parse(data.choices[0].message.content);
          return NextResponse.json({
            success: true,
            provider: 'OpenAI GPT-4o-mini',
            subject: parsed.subject,
            body: parsed.body
          });
        }
      } catch (openaiErr) {
        console.warn('OpenAI call failed:', openaiErr);
      }
    }

    // 3. HIGH-CONVERTING TEMPLATE FALLBACK
    return NextResponse.json({
      success: true,
      provider: 'Template Fallback',
      subject: `Quick idea regarding ${company}`,
      body: `Hi ${leadName},\n\nI came across ${company} in ${city} and was really impressed by your work in ${niche}.\n\nI wanted to reach out regarding ${promoteTopic} over at ${promoteSite}.\n\nWould you be open to a quick 2-minute chat this week?\n\nBest regards,\n${fromName}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}