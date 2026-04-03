import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-6 py-16 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link to="/login" className="font-mono text-xs text-accent hover:underline">
          ← Back to app
        </Link>
      </div>

      <div className="font-mono text-[10px] text-text-muted tracking-widest mb-4">
        // LEGAL
      </div>
      <h1 className="font-display text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-text-muted text-sm font-mono mb-10">Last updated: April 2026</p>

      <div className="space-y-8 font-sans text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">1. Acceptance</h2>
          <p>
            By using Calendar App Desktop, you agree to these Terms of Service.
            If you do not agree, please do not use the app.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">2. Description of Service</h2>
          <p>
            Calendar App Desktop is a personal task and calendar management web application.
            It integrates with Google services (Gmail, Google Calendar) to help you organize your work.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Use the app only for lawful purposes</li>
            <li>Not attempt to access other users' data</li>
            <li>Not use the app to send spam or unsolicited messages</li>
            <li>Keep your account credentials secure</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">4. Google Services</h2>
          <p>
            This app uses Google APIs. By connecting your Google account, you also agree to
            Google's Terms of Service. We request only the permissions necessary for the
            features you choose to use.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">5. Availability</h2>
          <p>
            The app is provided "as is" without any guarantee of uptime or availability.
            The free hosting tier may experience downtime or slow response times.
            We reserve the right to modify or discontinue the service at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">6. Limitation of Liability</h2>
          <p>
            We are not liable for any loss of data or damages resulting from use of this app.
            You are responsible for maintaining backups of important data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">7. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the app after changes
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">8. Contact</h2>
          <p>
            For any questions regarding these terms, contact:{' '}
            <a href="mailto:thanasis.koufos1@gmail.com" className="text-accent hover:underline">
              thanasis.koufos1@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
