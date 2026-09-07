export interface ComposeEmailParams {
  leadName?: string;
  businessName?: string;
  niche?: string;
  city?: string;
  website?: string;
  websiteDescription?: string;
  userService?: string;
  tone?: "Professional" | "Casual" | "Urgent";
}

export interface GeneratedEmailResponse {
  subject: string;
  body: string;
}

export async function generatePersonalizedEmail(
  params: ComposeEmailParams
): Promise<GeneratedEmailResponse> {
  const tone = params.tone || "Professional";
  const leadName = params.leadName || "there";
  const businessName = params.businessName || "your company";
  const niche = params.niche || "your industry";
  const city = params.city || "";
  const website = params.website || "";
  const userService =
    params.userService || "B2B client acquisition & automated outreach systems";

  const prompt = `You are an elite B2B cold email copywriter.
Write a high-converting, concise (under 120 words) cold email.

Lead Info:
- Contact Name: ${leadName}
- Business Name: ${businessName}
- Industry/Niche: ${niche}
- City/Location: ${city}
- Website: ${website}

Our Service Offering:
- What we offer: ${userService}
- Desired Tone: ${tone}

Strict Rules:
1. ONLY reference information explicitly provided in the context. Do NOT fabricate numbers, revenue stats, or fake claims.
2. Keep the email under 120 words. Concise and highly relevant.
3. Structure: 
   - Personalized icebreaker hook referencing their business/city.
   - 1-sentence value proposition.
   - Low-friction Call To Action (e.g., 10-minute call or quick question).
4. Output MUST be valid JSON format only, matching this structure:
{
  "subject": "Email Subject Line Here",
  "body": "Hi [Name],\\n\\nEmail body text here...\\n\\nBest,\\n[My Name]"
}`;

  const openaiKey = process.env.OPENAI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  try {
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_DEFAULT_MODEL || "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that writes high-converting B2B cold emails. You only return valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = JSON.parse(data.choices[0].message.content);
        return {
          subject: content.subject,
          body: content.body,
        };
      }
    }

    if (deepseekKey) {
      const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that writes high-converting B2B cold emails. You only return valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (dsRes.ok) {
        const dsData = await dsRes.json();
        const dsContent = JSON.parse(dsData.choices[0].message.content);
        return {
          subject: dsContent.subject,
          body: dsContent.body,
        };
      }
    }

    return {
      subject: `Quick question about ${businessName}'s growth in ${city || "your area"}`,
      body: `Hi ${leadName},\n\nI came across ${businessName} while researching leading businesses in ${city || niche}.\n\nWe help businesses in ${niche} add high-ticket clients via automated acquisition systems without ad spend.\n\nWould you be open to a brief 10-minute chat this week to see if this fits ${businessName}?\n\nBest,\n[Your Name]`,
    };
  } catch (error) {
    console.error("AI Composer Error:", error);
    return {
      subject: `Quick question regarding ${businessName}`,
      body: `Hi ${leadName},\n\nI noticed ${businessName} and wanted to reach out directly.\n\nWe specialize in ${userService} for businesses in ${niche}.\n\nWould you be open to a quick call this week?\n\nBest,\n[Your Name]`,
    };
  }
}
