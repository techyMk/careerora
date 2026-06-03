import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Careerora terms of service.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        Welcome to Careerora. By creating an account or using our service,
        you agree to these terms. Read them — they&apos;re short.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Careerora is a personal career-tooling app that helps you generate
        resumes, portfolios, LinkedIn copy, case studies and cover letters.
        Throughout these terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
        &ldquo;Careerora&rdquo; mean the operators of this service.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 13 years old to use Careerora.</li>
        <li>You&apos;re responsible for your account credentials and any activity under your account.</li>
        <li>Don&apos;t share your account with others. One person, one account.</li>
        <li>If you sign in with Google, the same rules apply.</li>
      </ul>

      <h2>3. What you create</h2>
      <p>
        You retain full ownership of every resume, portfolio, case study,
        cover letter and other asset you create on Careerora. We claim no
        rights to your content. We do store your content on our servers
        and process it via AI providers strictly to deliver the service to you.
      </p>

      <h2>4. AI-generated output</h2>
      <p>
        Careerora uses third-party AI models (currently <a href="https://groq.com" target="_blank" rel="noreferrer">Groq</a>) to generate
        drafts. Output is generated from your prompts and context. You are
        responsible for reviewing AI-generated content before submitting it
        to recruiters, clients, employers or any third party. We don&apos;t
        guarantee that AI output is accurate, original, or appropriate for
        any specific use.
      </p>

      <h2>5. Paid plans</h2>
      <ul>
        <li>Subscriptions are billed monthly or yearly via Stripe.</li>
        <li>You can cancel at any time from Settings → Billing → Manage subscription. Your access continues until the end of the paid period.</li>
        <li>We don&apos;t refund partial periods, but reach out if something went wrong and we&apos;ll work it out.</li>
        <li>If a payment fails, we&apos;ll notify you and pause Pro features until the issue is resolved.</li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use Careerora to spam, harass, defame, or harm anyone.</li>
        <li>Misrepresent someone else or impersonate a real person.</li>
        <li>Scrape, abuse our AI endpoints, or attempt to overload the service.</li>
        <li>Reverse-engineer or copy the product for a competing service.</li>
        <li>Use the service for anything illegal in your jurisdiction.</li>
      </ul>

      <h2>7. Service availability</h2>
      <p>
        We do our best to keep Careerora running, but we don&apos;t promise
        100% uptime. The service is provided &ldquo;as is&rdquo; without
        warranties of any kind. We may add, change, or remove features at any
        time; we&apos;ll try to give reasonable notice for material changes.
      </p>

      <h2>8. Termination</h2>
      <p>
        You can delete your account at any time from Settings. We may suspend
        or terminate accounts that violate these terms or that present a
        material risk to the service.
      </p>

      <h2>9. Liability</h2>
      <p>
        To the maximum extent permitted by law, Careerora is not liable for
        indirect, incidental, or consequential damages arising from your use of
        the service. Our total liability is limited to the amount you paid us
        in the 12 months preceding any claim.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these terms occasionally. We&apos;ll post the new
        version here and update the &ldquo;Last updated&rdquo; date. If the
        changes are material, we&apos;ll email registered users.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions? Reach out at <a href="mailto:techymk.dev@gmail.com">techymk.dev@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
