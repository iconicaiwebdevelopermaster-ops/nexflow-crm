import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ComposeEmailParams {
  leadName: string;
  companyName?: string;
  niche?: string;
  city?: string;
  website?: string;
  userOffering?: string;
  tone?: 'professional' | 'casual' | 'urgent';
}

export async function generatePersonalizedEmail(params: ComposeEmailParams) {
  const prompt = \You are an elite B2B cold email copywriter.
Write a high-converting, concise (under 120 words) cold email.

Lead Info:
- Name: \
- Company: \
- Niche: \
- City: \
- Website: \

Our Offer: \
Tone: \

Rules:
1. Short punchy subject line referencing their specific city or niche.
2. Genuine compliment or observation.
3. No fake stats. Single clear call-to-action (10-minute call).
4. Return pure JSON with keys: "subject" and "body".\;

  const response = await openai.chat.completions.create({
    model: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
