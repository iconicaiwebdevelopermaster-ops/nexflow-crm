import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.NEXTAUTH_SECRET || "nexflow-enterprise-encryption-vault-2026")
  .digest();

export function encryptSecret(text: string | null | undefined): string | null {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    return text;
  }
}

export function decryptSecret(cipherText: string | null | undefined): string | null {
  if (!cipherText) return null;
  if (!cipherText.includes(":")) return cipherText;

  try {
    const [ivHex, authTagHex, encryptedText] = cipherText.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return cipherText;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return cipherText;
  }
}