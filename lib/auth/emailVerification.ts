import crypto from "crypto";

export function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  return { token, tokenHash, expiresAt };
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

