import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
// Resend requires a verified sender domain. Gmail addresses can't be used as From:.
// Set EMAIL_FROM to "YourName <noreply@yourdomain.com>" once you verify a domain at
// https://resend.com/domains. The default below uses Resend's sandbox sender.
const FROM = process.env.EMAIL_FROM || "Careerora <onboarding@resend.dev>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "techymk.dev@gmail.com";

export const hasEmail = !!apiKey;

type SendArgs = { to: string; subject: string; html: string; text?: string };

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  if (!resend) {
    console.log("[email] no RESEND_API_KEY — would send:", { to, subject });
    return { ok: true, skipped: true } as const;
  }
  try {
    const res = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (res.error) {
      console.error("[email] resend error:", res.error);
      return { ok: false } as const;
    }
    return { ok: true, id: res.data?.id } as const;
  } catch (e) {
    console.error("[email] send failed:", e);
    return { ok: false } as const;
  }
}

/* ─── Templates ─── */

const WRAPPER = (content: string) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#070914;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:600;letter-spacing:-0.01em;background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);-webkit-background-clip:text;background-clip:text;color:transparent;">Careerora</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:28px;color:rgba(255,255,255,0.9);line-height:1.55;">
      ${content}
    </div>
    <p style="text-align:center;margin-top:24px;font-size:11px;color:rgba(255,255,255,0.4);">
      Careerora — your AI career operating system.<br/>
      You're receiving this because you have a Careerora account.
    </p>
  </div>
</body></html>`;

const BUTTON = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#3B82F6,#7C3AED,#EC4899);color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-weight:600;">${label}</a>`;

export function welcomeEmail({ name, dashboardUrl }: { name: string; dashboardUrl: string }) {
  const first = name.split(/\s+/)[0] || "there";
  return {
    subject: "Welcome to Careerora 👋",
    html: WRAPPER(`
      <h2 style="margin:0 0 10px;font-size:20px;font-weight:600;">Hey ${first},</h2>
      <p>You're in. We've already pre-filled a starter resume, portfolio and LinkedIn profile in your dashboard — open them, tweak them, make them yours.</p>
      <p>Three things you can do in the next 5 minutes:</p>
      <ul style="padding-left:20px;">
        <li>Generate a tailored cover letter from a job description</li>
        <li>Publish your portfolio to a real URL</li>
        <li>Run an AI mock interview for the role you're chasing</li>
      </ul>
      <p style="margin-top:24px;text-align:center;">${BUTTON(dashboardUrl, "Open dashboard")}</p>
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.55);">Reply to this email anytime — we read every one.</p>
    `),
    text: `Hey ${first},\n\nYou're in. Open your dashboard: ${dashboardUrl}\n\n— Careerora`,
  };
}

export function passwordResetEmail({ name, resetUrl }: { name: string | null; resetUrl: string }) {
  const first = (name ?? "").split(/\s+/)[0] || "there";
  return {
    subject: "Reset your Careerora password",
    html: WRAPPER(`
      <h2 style="margin:0 0 10px;font-size:20px;font-weight:600;">Hi ${first},</h2>
      <p>Someone (hopefully you) asked to reset the password on your Careerora account. Click the button below to set a new one. The link expires in 60 minutes.</p>
      <p style="margin-top:24px;text-align:center;">${BUTTON(resetUrl, "Reset password")}</p>
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.55);">If this wasn't you, you can safely ignore this email — your password stays the same.</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);word-break:break-all;">Or paste this URL into your browser: ${resetUrl}</p>
    `),
    text: `Reset your Careerora password: ${resetUrl}\nThis link expires in 60 minutes.`,
  };
}

export function planChangedEmail({ name, plan, dashboardUrl }: { name: string | null; plan: string; dashboardUrl: string }) {
  const first = (name ?? "").split(/\s+/)[0] || "there";
  return {
    subject: `Welcome to Careerora ${plan.charAt(0).toUpperCase()}${plan.slice(1)} 🎉`,
    html: WRAPPER(`
      <h2 style="margin:0 0 10px;font-size:20px;font-weight:600;">Hi ${first},</h2>
      <p>Your <strong>${plan}</strong> plan is now active. All premium templates, mock interviews, recruiter analytics and custom domain support are unlocked.</p>
      <p style="margin-top:24px;text-align:center;">${BUTTON(dashboardUrl, "Open dashboard")}</p>
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.55);">Manage your subscription anytime from Settings → Billing.</p>
    `),
    text: `Your ${plan} plan is now active. Dashboard: ${dashboardUrl}`,
  };
}
