import { NextResponse } from 'next/server';

// FreJun analytics API has a 1-month max range, so we split quarter ranges into months
// All date math uses UTC to avoid timezone boundary bugs
function getMonthRanges(startDate: string, endDate: string): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);

  let curYear = sy;
  let curMonth = sm - 1; // 0-indexed

  while (true) {
    const monthFirstMs = Date.UTC(curYear, curMonth, 1);
    const monthLastDay = new Date(Date.UTC(curYear, curMonth + 1, 0)).getUTCDate();
    const monthLastMs = Date.UTC(curYear, curMonth, monthLastDay);

    const rangeStartMs = Math.max(monthFirstMs, start);
    const rangeEndMs = Math.min(monthLastMs, end);

    if (rangeStartMs > end) break;

    if (rangeStartMs <= rangeEndMs) {
      const fmt = (ms: number) => {
        const d = new Date(ms);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      };
      ranges.push({ start: fmt(rangeStartMs), end: fmt(rangeEndMs) });
    }

    curMonth++;
    if (curMonth > 11) {
      curMonth = 0;
      curYear++;
    }
  }

  return ranges;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const dateStart = searchParams.get('date_start');
  const dateEnd = searchParams.get('date_end');

  const apiKey = process.env.frejun_api;

  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'FreJun API key not configured' }, { status: 500 });
  }

  try {
    // 1. Fetch Call Logs filtered by recruiter email
    let callsUrl = 'https://api.frejun.com/api/v2/integrations/calls/';
    const callParams: string[] = [];
    if (email) callParams.push(`recruiter_email=${encodeURIComponent(email)}`);
    // FreJun expects DD/MM/YY H:M:S format
    if (dateStart) {
      const [y, m, d] = dateStart.split('-');
      callParams.push(`date=${encodeURIComponent(`${d}/${m}/${y.slice(2)} 0:0:0`)}`);
    }
    if (dateEnd) {
      const [y, m, d] = dateEnd.split('-');
      callParams.push(`date_end=${encodeURIComponent(`${d}/${m}/${y.slice(2)} 23:59:59`)}`);
    }
    if (callParams.length > 0) callsUrl += '?' + callParams.join('&');

    const resCalls = await fetch(callsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${apiKey}`,
      },
      next: { revalidate: 5 },
    });

    let calls: any[] = [];
    if (resCalls.ok) {
      const callsData = await resCalls.json();
      calls = callsData?.data?.results || [];
    }

    // 2. Fetch Call Analytics — split into monthly sub-ranges, aggregate per-user
    let analyticsMap: Record<string, { total_calls: number; answered_calls: number; total_minutes: number }> = {};

    if (dateStart && dateEnd) {
      const monthRanges = getMonthRanges(dateStart, dateEnd);

      const analyticsPromises = monthRanges.map(async (range) => {
        const analyticsUrl = `https://api.frejun.com/api/v2/integrations/call-analytics/?date_start=${range.start}&date_end=${range.end}`;
        try {
          const res = await fetch(analyticsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Api-Key ${apiKey}`,
            },
            next: { revalidate: 30 },
          });
          if (res.ok) {
            const data = await res.json();
            return data?.data || [];
          }
        } catch {
          // Silently skip failed month range
        }
        return [];
      });

      const allMonthResults = await Promise.all(analyticsPromises);

      for (const monthData of allMonthResults) {
        for (const entry of monthData) {
          const userEmail = entry.user?.toLowerCase();
          if (!analyticsMap[userEmail]) {
            analyticsMap[userEmail] = { total_calls: 0, answered_calls: 0, total_minutes: 0 };
          }
          analyticsMap[userEmail].total_calls += entry.total_calls || 0;
          analyticsMap[userEmail].answered_calls += entry.answered_calls || 0;
          analyticsMap[userEmail].total_minutes += parseFloat(entry.total_minutes) || 0;
        }
      }
    }

    // Pick the analytics for the requested email
    const userAnalytics = email ? analyticsMap[email.toLowerCase()] || null : null;

    return NextResponse.json({
      success: true,
      calls,
      analytics: userAnalytics,
      allAnalytics: analyticsMap, // For admin overview
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
