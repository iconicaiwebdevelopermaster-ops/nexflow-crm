// src/lib/scraper-engine.ts

interface ContactData {
  emails: string[];
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
  phone: string | null;
}

async function fetchWithTimeout(url: string, timeout = 5000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(id);
    if (!response.ok) return "";
    return await response.text();
  } catch {
    clearTimeout(id);
    return "";
  }
}

function cleanEmails(emails: string[]): string[] {
  const junk = ["sentry", "wixpress", "schema.org", "example.com", "domain.com", "email.com", ".png", ".jpg", ".gif", ".svg", ".css", ".js", "bootstrap", "jquery", "cloudflare", "wordpress"];
  return Array.from(new Set(emails.map((e) => e.toLowerCase().trim()))).filter((email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    return !junk.some((j) => email.includes(j));
  });
}

function extractEmailsFromHtml(html: string): string[] {
  const found: string[] = [];
  const mailtoRegex = /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  let m;
  while ((m = mailtoRegex.exec(html)) !== null) if (m[1]) found.push(m[1]);
  const standard = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g) || [];
  found.push(...standard);
  return cleanEmails(found);
}

export async function scrapeWebsiteContacts(url: string): Promise<ContactData> {
  const data: ContactData = { emails: [], linkedin: null, instagram: null, facebook: null, phone: null };
  if (!url) return data;

  try {
    const rootUrl = url.startsWith("http") ? url : `https://${url}`;
    const html = await fetchWithTimeout(rootUrl, 5000);
    if (!html) return data;

    data.emails = extractEmailsFromHtml(html);

    const li = html.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-_\.]+)/i);
    if (li) data.linkedin = `https://www.linkedin.com/${li[0].includes("/in/") ? "in" : "company"}/${li[1]}`.replace(/\/$/, "");

    const ig = html.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (ig) data.instagram = `https://instagram.com/${ig[1].replace(/\/$/, "")}`;

    const fb = html.match(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/([a-zA-Z0-9._]+)/i);
    if (fb) data.facebook = `https://facebook.com/${fb[1].replace(/\/$/, "")}`;

    const phones = html.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    const validPhone = phones.find((p) => p.replace(/\D/g, "").length >= 10);
    if (validPhone) data.phone = validPhone.trim();

    // Deep Crawl Contact Pages
    if (data.emails.length === 0) {
      const paths = ["/contact", "/contact-us", "/about", "/about-us"];
      const cleanRoot = rootUrl.replace(/\/$/, "");
      for (const path of paths) {
        if (data.emails.length > 0) break;
        const subHtml = await fetchWithTimeout(`${cleanRoot}${path}`, 4000);
        if (subHtml) {
          const subEmails = extractEmailsFromHtml(subHtml);
          if (subEmails.length > 0) data.emails = subEmails;
        }
      }
    }
  } catch (err) {
    console.error("Scrape error:", err);
  }
  return data;
}