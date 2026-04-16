import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | The Equalizer by Rebel Marketer",
  description: "Privacy policy for The Equalizer SEO audit tool.",
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">

        <div className="mb-10">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to The Equalizer
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-xl font-semibold mb-3">Who we are</h2>
            <p className="text-muted-foreground">
              The Equalizer is a free SEO audit tool operated by Rebel Marketer, based in the United
              Kingdom. If you have any questions about this policy, contact us at{" "}
              <a
                href="mailto:hello@rebelmarketer.co.uk"
                className="text-primary hover:underline"
              >
                hello@rebelmarketer.co.uk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">What we collect and why</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Email address</h3>
                <p className="text-muted-foreground">
                  When you sign up to use The Equalizer, we ask for your email address. We use this
                  to keep you informed about updates and improvements to the tool. We will not sell
                  your email or use it for unrelated marketing. Legal basis: legitimate interest in
                  maintaining a user relationship for a free service.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Analytics (cookies)</h3>
                <p className="text-muted-foreground">
                  With your consent, we use Google Analytics 4 (GA4) to understand how the tool is
                  used — which features are popular, how long sessions last, and where users drop
                  off. This helps us improve the product. GA4 sets cookies in your browser to
                  identify sessions. We do not use advertising or remarketing cookies. Legal basis:
                  consent.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">URLs you audit</h3>
                <p className="text-muted-foreground">
                  When you enter a URL for auditing, that URL is sent to our server to fetch and
                  analyse. We do not store the URLs you audit or the audit results.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cookies</h2>
            <p className="text-muted-foreground mb-3">
              We use the following cookies:
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Cookie</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono">_ga, _ga_*</td>
                    <td className="p-3 text-muted-foreground">Google Analytics — distinguishes users and sessions</td>
                    <td className="p-3 text-muted-foreground">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono">equalizer_cookie_consent</td>
                    <td className="p-3 text-muted-foreground">Stores your cookie preference (localStorage, not a cookie)</td>
                    <td className="p-3 text-muted-foreground">Until cleared</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground font-mono">equalizer_email</td>
                    <td className="p-3 text-muted-foreground">Remembers that you have signed up (localStorage)</td>
                    <td className="p-3 text-muted-foreground">Until cleared</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3">
              Analytics cookies are only set after you give consent via the cookie banner. You can
              withdraw consent at any time by clearing your browser storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third parties</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Google Analytics (GA4)</span> — analytics
                platform. Data is processed in the EU/US under Google&apos;s standard contractual
                clauses. See{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <span className="font-medium text-foreground">Vercel</span> — hosting provider. May
                process IP addresses and request logs for security and performance. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <span className="font-medium text-foreground">Google Sheets</span> — we store email
                addresses in a private Google Sheet accessed only by Rebel Marketer.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How long we keep your data</h2>
            <p className="text-muted-foreground">
              Email addresses are kept until you unsubscribe or request deletion. Analytics data
              retention is set to 14 months in GA4. We do not retain audit results or audited URLs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your rights</h2>
            <p className="text-muted-foreground mb-3">
              Under UK GDPR you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for analytics at any time</li>
              <li>Object to processing based on legitimate interest</li>
              <li>Lodge a complaint with the ICO at{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ico.org.uk
                </a>
              </li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:hello@rebelmarketer.co.uk"
                className="text-primary hover:underline"
              >
                hello@rebelmarketer.co.uk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to this policy</h2>
            <p className="text-muted-foreground">
              We may update this policy as the tool evolves. Significant changes will be noted at
              the top of this page with an updated date.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            The Equalizer by{" "}
            <a
              href="https://www.rebelmarketer.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Rebel Marketer
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
