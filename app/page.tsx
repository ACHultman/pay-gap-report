import Link from 'next/link';
import type { Metadata } from 'next';
import WaitlistForm from './components/WaitlistForm';

export const metadata: Metadata = {
  title: 'BC Pay Gap Report Generator — Free, No BCeID Required',
  description: 'Generate your BC Pay Transparency Act compliance report in minutes. Upload payroll data, auto-map columns, download a publish-ready PDF. No BCeID setup required.',
  keywords: ['BC pay transparency report', 'pay gap report BC', 'BC pay transparency act 2026', 'pay equity report British Columbia'],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-gray-900">BCPayReport.ca</span>
        <Link
          href="#waitlist"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Get notified →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-sm font-medium text-amber-700 mb-6">
          ⏰ Report deadline: November 1, 2026
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          Generate your BC pay gap report.<br />No BCeID required.
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
          Upload your payroll export. Auto-map columns. Download a publish-ready PDF that meets BC Pay Transparency Act requirements. Your data never leaves your browser.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#waitlist"
            className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
          >
            Get notified when it launches →
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Free for one report. No account required. Launching July 2026.
        </p>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            50+ employees in BC? You need to file by November 1, 2026.
          </h2>
          <p className="text-gray-600 mb-6">
            The BC Pay Transparency Act now applies to employers with 50+ employees. Here&apos;s what that means:
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'The government tool requires BCeID setup',
                body: '20+ minute registration, identity verification, and a specific CSV format that doesn\'t match any payroll system\'s default export.',
              },
              {
                title: 'Your payroll export doesn\'t match the template',
                body: 'BambooHR calls it "Gender." ADP calls it "EEO Gender." Humi calls it "Gender Identity." Every system exports differently. Someone has to manually rename columns and reformat.',
              },
              {
                title: 'Edge cases aren\'t documented inline',
                body: 'What if an employee didn\'t disclose gender? What about salaried employees with no hours? The answers are in 4 separate PDFs. The tool doesn\'t tell you.',
              },
              {
                title: 'Enterprise tools start at $10K+/year',
                body: 'Syndio and PayAnalytics are built for Fortune 500. You run a 70-person consulting firm. You need a $29 tool, not a $30K platform.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-1 h-5 w-5 shrink-0 text-red-500">✗</span>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
          <div className="space-y-8">
            {[
              ['1', 'Upload your payroll export', 'CSV or Excel from BambooHR, ADP, Rippling, Humi, or any other system. Your data stays in your browser — nothing is uploaded to our servers.'],
              ['2', 'Auto-map columns', 'We detect your payroll system\'s column names and map them to the BC report fields. Review the mapping, adjust if needed, and confirm.'],
              ['3', 'Review and handle edge cases', 'Inline guidance for undisclosed gender, salaried employees, part-year workers. No digging through PDFs.'],
              ['4', 'Download your report', 'Publish-ready PDF that matches the BC government format. Plus a pre-validated CSV you can upload directly to the government portal — skipping the manual prep.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">{num}</div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your payroll data never leaves your browser.</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            All calculations happen client-side. We don&apos;t store, transmit, or have access to your employee data. The CSV is parsed in your browser, the report is generated locally, and the PDF is downloaded directly to your computer.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            This isn&apos;t a limitation — it&apos;s the architecture. HR data should stay where it belongs.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="rounded-xl border border-gray-100 p-5 text-left">
              <p className="font-bold text-gray-900">Free</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Generate one report</li>
                <li>✓ PDF + CSV download</li>
                <li>✓ Client-side processing</li>
                <li>✓ No account required</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-5 text-left">
              <p className="font-bold text-gray-900">One-time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$29</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Everything in Free</li>
                <li>✓ Save report for records</li>
                <li>✓ Deadline reminder email</li>
              </ul>
            </div>
            <div className="relative rounded-xl border-2 border-indigo-600 p-5 text-left">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                Best value
              </div>
              <p className="font-bold text-gray-900">Pro</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$99<span className="text-sm font-normal text-gray-500">/yr</span></p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Everything in One-time</li>
                <li>✓ Multi-year report history</li>
                <li>✓ Up to 5 team seats</li>
                <li>✓ Pre-fill from last year</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="bg-gray-900 py-16 text-center" id="waitlist">
        <h2 className="text-2xl font-bold text-white mb-2">Get notified when we launch.</h2>
        <p className="text-gray-400 mb-6">Launching July 2026 — before the November deadline rush.</p>
        <WaitlistForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>BCPayReport.ca — Not legal advice. Verify your report against BC government requirements.</p>
        <p className="mt-1">
          Regulation reference: <a href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/23018" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Pay Transparency Act, SBC 2023 c.18</a>
        </p>
      </footer>
    </main>
  );
}
