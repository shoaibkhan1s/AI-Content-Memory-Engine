export function reminderDigestTemplate(params: {
  name: string;
  items: Array<{ title: string; url: string }>;
}) {
  const { name, items } = params;
  const safeName = name?.trim() || "there";

  const listHtml = items
    .map(
      (it) =>
        `<li style="margin: 0 0 10px;"><a href="${it.url}" style="color:#4f46e5; font-weight:800; text-decoration:none;">${it.title}</a></li>`
    )
    .join("");

  const listText = items.map((it) => `- ${it.title}: ${it.url}`).join("\n");

  return {
    subject: items.length === 1 ? `Time to revise: ${items[0].title}` : "Your revision reminders",
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Hi ${safeName},</h2>
        <p style="margin: 0 0 12px;">Time for a quick revision session.</p>
        <ul style="padding-left: 18px; margin: 0 0 12px;">${listHtml}</ul>
        <p style="margin: 0; color:#64748b; font-size: 12px;">
          You’re receiving this because email reminders are enabled in your settings.
        </p>
      </div>
    `,
    text: `Time for a quick revision session:\n${listText}`,
  };
}

