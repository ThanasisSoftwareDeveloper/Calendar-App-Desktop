import { Link } from 'react-router-dom'

export default function PrivacyPage() {
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
      <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-text-muted text-sm font-mono mb-10">Last updated: April 2026</p>

      <div className="space-y-8 font-sans text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">1. Overview</h2>
          <p>
            Calendar App Desktop ("the app") is a personal productivity tool built for task and calendar management.
            This policy explains what data we collect, how we use it, and how we protect it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">2. Data We Collect</h2>
          <p>When you sign in with Google, we receive and store:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Your name and email address</li>
            <li>Your Google profile picture</li>
            <li>OAuth access and refresh tokens (to connect to Google services)</li>
          </ul>
          <p className="mt-3">
            We also store the tasks, categories, and calendar data you create within the app.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">3. Google API Usage</h2>
          <p>With your permission, the app may access:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong className="text-text-primary">Gmail</strong> — to import labeled emails as tasks and send reminder emails</li>
            <li><strong className="text-text-primary">Google Calendar</strong> — to sync your tasks as calendar events</li>
          </ul>
          <p className="mt-3">
            We do not read, store, or share the content of your emails beyond what is needed to create tasks.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">4. Data Storage</h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on Supabase (EU region).
            OAuth tokens are encrypted and never exposed publicly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">5. Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal data with third parties.
            Data is only shared with the Google APIs you explicitly authorize.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">6. Data Deletion</h2>
          <p>
            You can disconnect your Google account at any time from within the app.
            To request full deletion of your data, contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-text-primary mb-3">7. Contact</h2>
          <p>
            For any privacy-related questions, contact:{' '}
            <a href="mailto:thanasis.koufos1@gmail.com" className="text-accent hover:underline">
              thanasis.koufos1@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
