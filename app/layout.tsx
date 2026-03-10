import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BCPayReport.ca — BC Pay Gap Report Generator',
  description: 'Generate your BC Pay Transparency Act compliance report. Upload payroll data, auto-map columns, download a publish-ready PDF. Free. No BCeID required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
