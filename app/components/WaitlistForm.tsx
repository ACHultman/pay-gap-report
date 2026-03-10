'use client';

import { useState } from 'react';

const EMPLOYEE_BANDS = [
  '50–99 employees',
  '100–249 employees',
  '250–499 employees',
  '500+ employees',
];

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [employeeBand, setEmployeeBand] = useState(EMPLOYEE_BANDS[0]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          employeeBand,
          source: 'landing',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong.' }));
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
      setEmail('');
      setCompany('');
      setEmployeeBand(EMPLOYEE_BANDS[0]);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@company.ca"
          className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="text"
          required
          value={company}
          onChange={event => setCompany(event.target.value)}
          placeholder="Company name"
          className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={employeeBand}
          onChange={event => setEmployeeBand(event.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {EMPLOYEE_BANDS.map(band => (
            <option key={band} value={band} className="text-gray-900">
              {band}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-center">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors disabled:opacity-70"
        >
          {status === 'loading' ? 'Submitting…' : 'Join the waitlist'}
        </button>
        {status === 'success' ? (
          <span className="text-sm text-emerald-300">You&apos;re on the list. We&apos;ll email you before launch.</span>
        ) : null}
        {status === 'error' ? (
          <span className="text-sm text-red-300">{error}</span>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-gray-500 text-center">One email when we launch. No spam.</p>
    </form>
  );
}
