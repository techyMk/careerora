import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Careerora handles your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        We take your privacy seriously and try to keep this readable. This
        policy explains what we collect, why, and what we don&apos;t do.
      </p>

      <h2>1. What we collect</h2>
      <h3>Account data</h3>
      <ul>
        <li>Your email and name</li>
        <li>Password (stored as a bcrypt hash; we never see your plaintext password)</li>
        <li>If you sign in with Google: your email, name, and profile picture URL</li>
      </ul>

      <h3>Content you create</h3>
      <ul>
        <li>Resumes, portfolios, case studies, cover letters, and LinkedIn profile drafts you type or generate</li>
        <li>Chat history with the AI Assistant</li>
        <li>Mock interview answers and AI evaluations</li>
      </ul>

      <h3>Usage data</h3>
      <ul>
        <li>Portfolio view events on your published portfolios: visitor country (from IP, never the IP itself), referrer hostname, browser user agent, time-on-page, and scroll depth</li>
        <li>Notifications generated for your account</li>
        <li>Subscription status and Stripe customer ID (we never see your card details — Stripe handles them)</li>
      </ul>

      <h2>2. What we don&apos;t collect</h2>
      <ul>
        <li>Your IP address (we store only the country derived from it)</li>
        <li>Your card or payment details (handled entirely by Stripe)</li>
        <li>Anything from third-party trackers, advertising networks, or analytics platforms — we don&apos;t use them</li>
        <li>Visitor IP addresses to your portfolios — we anonymize at the country level</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To run the service: render your dashboard, store your work, generate AI content from your prompts</li>
        <li>To send your content to AI providers (currently <a href="https://groq.com" target="_blank" rel="noreferrer">Groq</a>) for generation — they don&apos;t train models on your data per their terms</li>
        <li>To bill you (via Stripe) if you upgrade to a paid plan</li>
        <li>To notify you of relevant events: portfolio views, plan changes, security-related actions</li>
      </ul>

      <h2>4. Who has access</h2>
      <p>
        Only you can see your own resumes, portfolio drafts, case studies, cover
        letters and AI chat history. Other Careerora users can&apos;t access them.
        Published portfolios at <code>/p/your-name</code> (or your custom domain)
        are intentionally public.
      </p>

      <h2>5. Service providers we use</h2>
      <ul>
        <li><strong>Vercel</strong> — hosting and DNS</li>
        <li><strong>Neon</strong> — managed Postgres database (your content lives here)</li>
        <li><strong>Groq</strong> — AI model inference for text generation</li>
        <li><strong>Stripe</strong> — subscription billing and payment processing</li>
        <li><strong>Google</strong> — optional OAuth sign-in</li>
      </ul>
      <p>Each is a reputable provider with their own privacy practices.</p>

      <h2>6. Cookies</h2>
      <p>
        We use a single first-party cookie to keep you signed in
        (NextAuth session JWT). We don&apos;t use analytics, advertising,
        or third-party tracking cookies.
      </p>

      <h2>7. Your rights</h2>
      <ul>
        <li><strong>Access:</strong> see your data anytime from your dashboard</li>
        <li><strong>Export:</strong> all your resumes are downloadable as PDF; portfolios as published HTML</li>
        <li><strong>Delete:</strong> you can delete any asset, your chat history, or your entire account from Settings — deletion is permanent</li>
        <li><strong>Correct:</strong> edit your profile and content directly in the app</li>
      </ul>

      <h2>8. Data retention</h2>
      <p>
        We keep your data while your account is active. If you delete your
        account, we delete your content and personal information within 30
        days, except where we&apos;re legally required to keep records
        (e.g. tax records of paid subscriptions).
      </p>

      <h2>9. Security</h2>
      <p>
        Passwords are bcrypt-hashed. All traffic is over HTTPS. Sessions are
        signed JWTs. We don&apos;t store payment card numbers (Stripe does).
        That said, no system is perfectly secure — please use a strong unique
        password.
      </p>

      <h2>10. Children</h2>
      <p>
        Careerora isn&apos;t intended for users under 13. We don&apos;t
        knowingly collect data from children.
      </p>

      <h2>11. Changes</h2>
      <p>
        If we change this policy materially, we&apos;ll update the date above
        and email registered users. Continued use after a change means you
        accept the updated policy.
      </p>

      <h2>12. Contact</h2>
      <p>
        Reach out at <a href="mailto:techymk.dev@gmail.com">techymk.dev@gmail.com</a> for any data request — access, export, deletion, or general questions.
      </p>
    </LegalLayout>
  );
}
