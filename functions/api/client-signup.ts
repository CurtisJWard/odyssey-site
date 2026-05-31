// Client signup form on /estimate ("Not yet" card).
// A potential buyer who doesn't have a Realtor yet submits their info and
// asks us to set them up with estimator access. The on-duty Project Consultant
// CALLS THEM PERSONALLY — that human-touch step doubles as a competitor filter
// (competitors aren't going to sit through a "tell me about your dream home"
// call to harvest pricing). After the call, the consultant creates the
// estimator account manually and shares the password.
//
// Routing: TO = today's agent (kaysha@/susan@/gary@), BCC = leadership.

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
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const buildLocation = String(formData.get('build-location') || '').trim();
    const projectType = String(formData.get('project-type') || '').trim();
    const bestTime = String(formData.get('best-time') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    const buildLocationLabels: Record<string, string> = {
      'idaho-falls': 'Idaho Falls', 'ammon': 'Ammon', 'rigby': 'Rigby',
      'rexburg': 'Rexburg', 'shelley': 'Shelley', 'blackfoot': 'Blackfoot',
      'pocatello': 'Pocatello', 'other-eastern-idaho': 'Other Eastern Idaho area',
      'moving-from-out-of-state': 'Moving here from out of state', 'not-sure-yet': 'Eastern Idaho but not sure which city yet',
    };
    const projectTypeLabels: Record<string, string> = {
      'new-construction-our-lot': 'New construction on an Odyssey lot',
      'new-construction-my-lot': 'New construction on my own lot',
      'quick-move-in': 'Quick move-in / spec home',
      'just-exploring': 'Just exploring options',
    };
    const buildLocationLabel = buildLocationLabels[buildLocation] || buildLocation;
    const projectTypeLabel = projectTypeLabels[projectType] || projectType;

    if (!name || !email || !phone) {
      return jsonResponse({ ok: false, error: 'Name, phone, and email are required' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'Invalid email' }, 400);
    }
    if (notes.length > 5000) {
      return jsonResponse({ ok: false, error: 'Notes too long' }, 400);
    }

    const agentResult = await fetchTodaysAgent(env.TODAYS_AGENT_URL);
    const todaysAgent = agentResult.agent;
    const recipients = buildRecipients(todaysAgent, env.FORM_RECIPIENTS);
    const bcc = buildBcc(env.FORM_BCC, recipients);
    const routedTo = todaysAgent
      ? `${todaysAgent.name} (on duty today)`
      : agentResult.status === 'unreachable'
        ? `on-call team (⚠️ rotation calendar unreachable — ${agentResult.reason || 'unknown error'})`
        : 'on-call team (no rotation event today)';
    const locationTag = buildLocationLabel ? ` — ${buildLocationLabel}` : '';
    const subject = `📞 Call request — ${name}${locationTag} wants estimator access`;
    const html = `
      <h2>New direct signup — buyer wants a call</h2>
      <p>A potential buyer (no Realtor yet) signed up through the website. They're expecting a call from you to get acquainted and set up estimator access.</p>

      <h3>Buyer</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(name)}<br />
        <strong>Phone:</strong> <a href="tel:${escapeHtml(phone.replace(/[^0-9+]/g, ''))}">${escapeHtml(phone)}</a><br />
        <strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a> <em>(use as estimator login once they're approved)</em><br />
        ${bestTime ? `<strong>Best time to reach:</strong> ${escapeHtml(bestTime)}<br />` : ''}
      </p>

      <h3>Project</h3>
      <p>
        <strong>Build location:</strong> ${escapeHtml(buildLocationLabel || '(not specified)')}<br />
        <strong>Project type:</strong> ${escapeHtml(projectTypeLabel || '(not specified)')}
      </p>

      ${notes ? `<h3>What they're looking to build</h3><p style="white-space: pre-wrap;">${escapeHtml(notes)}</p>` : ''}

      <h3>What to do next</h3>
      <ol>
        <li><strong>Call them at ${escapeHtml(phone)}</strong> — usually within the hour during business hours. They've been told to expect it.</li>
        <li>Get acquainted, hear what they're looking for, and qualify the lead. (This call doubles as a competitor screen — real buyers will engage, competitors usually won't.)</li>
        <li>If they're legit, create an estimator account using <strong>${escapeHtml(email)}</strong> as the username and share the password.</li>
        <li>If they don't pick up, leave a voicemail and follow up by email/text.</li>
      </ol>

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
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend error:', resendRes.status, errBody);
      return jsonResponse({ ok: false, error: 'Email service error' }, 502);
    }

    return jsonResponse({
      ok: true,
      agentName: todaysAgent?.firstName || todaysAgent?.name || null,
    });
  } catch (err) {
    console.error('Client signup form error:', err);
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
