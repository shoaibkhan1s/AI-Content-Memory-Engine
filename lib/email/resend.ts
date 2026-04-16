import { Resend } from "resend";

export function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is missing");
  return new Resend(key);
}

export function getAppBaseUrl() {
  const base = process.env.APP_BASE_URL;
  // Dev-friendly default to avoid breaking signup locally.
  if (!base) return "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

