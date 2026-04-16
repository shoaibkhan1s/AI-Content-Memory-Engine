export function verificationEmailTemplate(params: { name: string; verifyUrl: string }) {
  const { name, verifyUrl } = params;
  const safeName = name?.trim() || "there";

  return {
    subject: "Verify your email for AI Content Memory Engine",
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Hi ${safeName},</h2>
        <p style="margin: 0 0 12px;">
          Please verify your email to activate your account.
        </p>
        <p style="margin: 0 0 16px;">
          <a href="${verifyUrl}" style="display:inline-block; background:#4f46e5; color:white; text-decoration:none; padding:10px 14px; border-radius:10px; font-weight:700;">
            Verify Email
          </a>
        </p>
        <p style="margin: 0 0 12px; color:#475569; font-size: 13px;">
          If the button doesn’t work, copy and paste this link:\n<br />${verifyUrl}
        </p>
        <p style="margin: 0; color:#64748b; font-size: 12px;">
          If you didn’t create this account, you can ignore this email.
        </p>
      </div>
    `,
    text: `Verify your email: ${verifyUrl}`,
  };
}

