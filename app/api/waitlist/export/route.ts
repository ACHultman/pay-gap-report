import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values
    .map(value => {
      const safe = value ?? '';
      const str = String(safe).replace(/"/g, '""');
      return `"${str}"`;
    })
    .join(',');
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const expectedToken = process.env.WAITLIST_EXPORT_TOKEN || '';

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('waitlist_signups')
    .select('email, company, employee_band, created_at, source, referrer')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('waitlist export error', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }

  const rows = [
    toCsvRow(['email', 'company', 'employee_band', 'created_at', 'source', 'referrer']),
    ...(data || []).map(row =>
      toCsvRow([row.email, row.company, row.employee_band, row.created_at, row.source, row.referrer])
    ),
  ];

  const csv = rows.join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="waitlist.csv"',
    },
  });
}
