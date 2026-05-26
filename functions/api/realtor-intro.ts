// Realtor referral form on /estimate (YES card).
// Buyer submits their Realtor's contact info; we email today's on-duty rep
// (per the rotation calendar) so they can reach out to the Realtor and get
// them set up with estimator access.
//
// Routing: TO = today's agent (kaysha@/susan@/gary@). If no rotation event
// today, fan out to FORM_RECIPIENTS (all reps).

import { fetchTodaysAgent, buildRecipients, buildBcc } from '../_shared/routing';

interface Env {
  RESEND_API_KEY: string;
  FORM_RECIPIENTS: string;
  FORM_FROM: string;
  FORM_BCC?: string;
  TODAYS_AGENT_URL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const buyerName = String(formData.get('buyer-name') || '').trim();
    const buyerEmail = String(formData.get('buyer-email') || '').trim();
    const buyerPhone = String(formData.get('buyer-phone') || '').trim();
    const realtorName = String(formData.get('realtor-name') || '').trim();
    const realtorContact = String(formData.get('realtor-contact') || '').trim();
    const buildLocation = String(formData.get('build-location') || '').trim();
    const projectType = String(formData.get('project-type') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    // Pretty labels for the qualifying-field select values
    const buildLocationLabels: Record<string, string> = {
      'idaho-falls': 'Idaho Falls', 'ammon': 'Ammon', 'rigby': 'Rigby',
      'rexburg': 'Rexburg', 'shelley': 'Shelley', 'blackfoot': 'Blackfoot',
      'pocatello': 'Pocatello', 'other-eastern-idaho': 'Other Eastern Idaho area',
      'moving-from-out-of-state': 'Moving here from out of state', 'not-sure-yet': 'Not sure yet',
    };
    const projectTypeLabels: Record<string, string> = {
      'new-construction-our-lot': 'New construction on an Odyssey lot',
      'new-construction-my-lot': 'New construction on my own lot',
      'quick-move-in': 'Quick move-in / spec home',
      'just-exploring': 'Just exploring options',
    };
    const buildLocationLabel = buildLocationLabels[buildLocation] || buildLocation;
    const projectTypeLabel = projectTypeLabels[projectType] || projectType;

    if (!buyerName || !buyerEmail || !realtorName || !realtorContact) {
      return jsonResponse({ ok: false, error: 'Missing required fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return jsonResponse({ ok: false, error: 'Invalid email' }, 400);
    }
    if (notes.length > 5000) {
      return jsonResponse({ ok: false, error: 'Notes too long' }, 400);
    }

    const todaysAgent = await fetchTodaysAgent(env.TODAYS_AGENT_URL);
    const recipients = buildRecipients(todaysAgent, env.FORM_RECIPIENTS);
    const bcc = buildBcc(env.FORM_BCC, recipients);
    const routedTo = todaysAgent ? `${todaysAgent.name} (on duty today)` : 'on-call team (no rotation event today)';
    const locationTag = buildLocationLabel ? ` — ${buildLocationLabel}` : '';
    const subject = `Estimator access request — ${buyerName}${locationTag} (Realtor: ${realtorName})`;
    const html = `
      <h2>New estimate access request — Odyssey Homes</h2>
      <p>A potential buyer wants estimator access. They've shared their Realtor's contact so our team can reach out and get the Realtor set up.</p>
      <h3>Buyer</h3>
      <p><strong>Name:</strong> ${escapeHtml(buyerName)}<br />
      <strong>Email:</strong> <a href="mailto:${escapeHtml(buyerEmail)}">${escapeHtml(buyerEmail)}</a>${buyerPhone ? `<br /><strong>Phone:</strong> ${escapeHtml(buyerPhone)}` : ''}</p>
      <h3>Project</h3>
      <p>
        <strong>Build location:</strong> ${escapeHtml(buildLocationLabel || '(not specified)')}<br />
        <strong>Project type:</strong> ${escapeHtml(projectTypeLabel || '(not specified)')}
      </p>
      <h3>Their Realtor</h3>
      <p><strong>Name:</strong> ${escapeHtml(realtorName)}<br />
      <strong>Contact:</strong> ${escapeHtml(realtorContact)}</p>
      ${notes ? `<h3>Notes</h3><p style="white-space: pre-wrap;">${escapeHtml(notes)}</p>` : ''}
      <hr />
      <p style="color: #666; font-size: 12px;">Submitted via buildodyssey.com/estimate. Routed to ${escapeHtml(routedTo)}. Reply directly to respond to the buyer.</p>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FORM_FROM,
        to: recipients,
        ...(bcc.length > 0 ? { bcc } : {}),
        reply_to: buyerEmail,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend error:', resendRes.status, errBody);
      return jsonResponse({ ok: false, error: 'Email service error' }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('Realtor intro form error:', err);
    return jsonResponse({ ok: false, error: 'Server error' }, 500);
  }
};

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] || c));
}
