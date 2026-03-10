import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const EMAIL_REGEX = /.+@.+\..+/;

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }

  let payload: { email?: string; company?: string; employeeBand?: string; source?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() || '';
  const company = payload.company?.trim() || '';
  const employeeBand = payload.employeeBand?.trim() || '';
  const source = payload.source?.trim() || 'landing';

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
  }

  if (!company || company.length < 2) {
    return NextResponse.json({ error: 'Enter a company name.' }, { status: 400 });
  }

  if (!employeeBand) {
    return NextResponse.json({ error: 'Select an employee band.' }, { status: 400 });
  }

  const referrer = request.headers.get('referer') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  const { error: signupError, data } = await supabase
    .from('waitlist_signups')
    .insert({
      email,
      company,
      employee_band: employeeBand,
      source,
      referrer,
      user_agent: userAgent,
    })
    .select('id');

  if (signupError) {
    console.error('waitlist signup error', signupError);
    return NextResponse.json({ error: 'Failed to save signup.' }, { status: 500 });
  }

  const emailDomain = email.split('@')[1] || null;
  const { error: eventError } = await supabase
    .from('waitlist_events')
    .insert({
      event_name: 'waitlist_signup',
      metadata: {
        email_domain: emailDomain,
        employee_band: employeeBand,
        source,
        signup_id: data?.[0]?.id ?? null,
      },
    });

  if (eventError) {
    console.warn('waitlist event error', eventError);
  }

  return NextResponse.json({ ok: true });
}
