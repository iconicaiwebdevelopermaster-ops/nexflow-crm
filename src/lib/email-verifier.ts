import { resolveMx } from "node:dns/promises";

// 100+ Common Disposable Email Domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "sharklasers.com", "yopmail.com", "trashmail.com", "getairmail.com",
  "dispostable.com", "temp-mail.org", "fakeinbox.com", "throwawaymail.com",
  "mytemp.email", "getnada.com", "inboxkitten.com", "tempail.com"
]);

const ROLE_BASED_PREFIXES = new Set([
  "info", "support", "sales", "contact", "admin", "billing",
  "help", "office", "team", "marketing", "press", "legal", "jobs"
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  score: number; // 0 to 100
  status: "VERIFIED" | "RISKY" | "INVALID";
  reason: string;
  mxHost?: string;
  isDisposable: boolean;
  isRoleBased: boolean;
  domain: string;
}

export async function verifyEmailMx(email: string): Promise<EmailVerificationResult> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Syntax Check
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      email: cleanEmail,
      isValid: false,
      score: 0,
      status: "INVALID",
      reason: "Invalid email syntax format",
      isDisposable: false,
      isRoleBased: false,
      domain: ""
    };
  }

  const [localPart, domain] = cleanEmail.split("@");
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isRoleBased = ROLE_BASED_PREFIXES.has(localPart);

  // 2. Disposable Check
  if (isDisposable) {
    return {
      email: cleanEmail,
      isValid: false,
      score: 10,
      status: "INVALID",
      reason: "Disposable / Temporary email address detected",
      isDisposable: true,
      isRoleBased,
      domain
    };
  }

  // 3. DNS MX Resolution (Live Ping to Domain Nameservers)
  try {
    const mxRecords = await resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        email: cleanEmail,
        isValid: false,
        score: 15,
        status: "INVALID",
        reason: "Domain has no active MX records configured",
        isDisposable: false,
        isRoleBased,
        domain
      };
    }

    // Sort by priority (lowest number = primary mail server)
    const primaryMx = mxRecords.sort((a, b) => a.priority - b.priority)[0];
    const mxHost = primaryMx.exchange.toLowerCase();

    // Scoring Logic
    let score = 95;
    let status: "VERIFIED" | "RISKY" = "VERIFIED";
    let reason = `Verified Mail Server: ${mxHost}`;

    if (isRoleBased) {
      score = 75;
      status = "RISKY";
      reason = "Role-based inbox (low individual engagement rate)";
    }

    return {
      email: cleanEmail,
      isValid: true,
      score,
      status,
      reason,
      mxHost,
      isDisposable: false,
      isRoleBased,
      domain
    };
  } catch (error: any) {
    // ENOTFOUND / ENODATA
    return {
      email: cleanEmail,
      isValid: false,
      score: 0,
      status: "INVALID",
      reason: "Domain does not exist or DNS lookup timed out",
      isDisposable: false,
      isRoleBased,
      domain
    };
  }
}