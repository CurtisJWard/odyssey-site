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
    const firstName = String(formData.get('first-name') || '').trim();
    const lastName = String(formData.get('last-name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const buildLocation = String(formData.get('build-location') || '').trim();
    const projectType = String(formData.get('project-type') || '').trim();
    const timeline = String(formData.get('timeline') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!firstName || !lastName || !email) {
      return jsonResponse({ ok: false, error: 'Missing required fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'Invalid email' }, 400);
    }
    if (message.length > 5000) {
      return jsonResponse({ ok: false, error: 'Message too long' }, 400);
    }

    // ─── Lead qualification — soft routing for no-fit submissions ───
    // Two automatic disqualifiers: remodel/addition requests, and out-of-area
    // builds. Both still email the team (with a flag) so we can decline
    // politely, but they're tagged so the consultant knows not to invest time.
    const isNoFitProject = projectType === 'remodel-or-addition';
    const isOutOfArea = buildLocation === 'outside-eastern-idaho';
    const isNoFit = isNoFitProject || isOutOfArea;
    const noFitReason = isNoFitProject
      ? 'Project type: remodel/addition (Odyssey does new construction only)'
      : isOutOfArea
        ? 'Build location: outside Eastern Idaho'
        : null;

    // ─── Soft warning: out-of-state area code ─────────────────────────
    // Not a hard no-fit — relocating buyers from out of state ARE a target
    // segment. But surface the area code so the consultant can scan the
    // message for "moving to" / "relocating" before investing time on what
    // might be an out-of-area shopper who slipped past the location dropdown.
    const phoneDigits = phone.replace(/\D/g, '');
    const areaCode = phoneDigits.length >= 10 ? phoneDigits.slice(-10, -7) : '';
    const isOutOfStateAreaCode = areaCode !== '' && !IDAHO_AREA_CODES.includes(areaCode);

    // Pretty labels for the email body
    const buildLocationLabel = formatChoice(buildLocation, BUILD_LOCATION_LABELS);
    const projectTypeLabel = formatChoice(projectType, PROJECT_TYPE_LABELS);
    const timelineLabel = formatChoice(timeline, TIMELINE_LABELS);

    const todaysAgent = await fetchTodaysAgent(env.TODAYS_AGENT_URL);
    const recipients = buildRecipients(todaysAgent, env.FORM_RECIPIENTS);
    const bcc = buildBcc(env.FORM_BCC, recipients);
    const routedTo = todaysAgent ? `${todaysAgent.name} (on duty today)` : 'on-call team (no rotation event today)';

    // Subject line surfaces build location for fast triage. No-fit leads get
    // a hard flag prefix; out-of-state area codes get a soft warning prefix
    // (consultants still treat as live, just verify before deep investment).
    const locationTag = buildLocationLabel ? ` — ${buildLocationLabel}` : '';
    const noFitFlag = isNoFit ? '🚫 NO-FIT ' : '';
    const areaCodeFlag = !isNoFit && isOutOfStateAreaCode ? '⚠️ OUT-OF-STATE AREA CODE — ' : '';
    const subject = `${noFitFlag}${areaCodeFlag}Odyssey inquiry — ${firstName} ${lastName}${locationTag}`;

    const noFitBlock = isNoFit ? `
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;">
        <p style="margin:0;font-weight:bold;color:#92400e;">⚠️ Flagged as no-fit</p>
        <p style="margin:6px 0 0;color:#78350f;font-size:14px;">${escapeHtml(noFitReason || '')}</p>
        <p style="margin:6px 0 0;color:#78350f;font-size:14px;">Recommended response: polite decline. Don't invest sales time.</p>
      </div>
    ` : '';

    const areaCodeBlock = !isNoFit && isOutOfStateAreaCode ? `
      <div style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 16px;margin:16px 0;">
        <p style="margin:0;font-weight:bold;color:#854d0e;">⚠️ Out-of-state area code</p>
        <p style="margin:6px 0 0;color:#713f12;font-size:14px;">Phone (${escapeHtml(phone)}) has non-Idaho area code <strong>${escapeHtml(areaCode)}</strong>. Could be a relocating buyer (high value) or an out-of-area shopper. Scan the message for "moving to" / state names before significant time investment.</p>
      </div>
    ` : '';

    const html = `
      <h2>New website inquiry — Odyssey Homes</h2>
      ${noFitBlock}
      ${areaCodeBlock}
      <h3>Contact</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}<br />
        <strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
        ${phone ? `<br /><strong>Phone:</strong> ${escapeHtml(phone)}` : ''}
      </p>
      <h3>Project</h3>
      <p>
        <strong>Build location:</strong> ${escapeHtml(buildLocationLabel || '(not specified)')}<br />
        <strong>Project type:</strong> ${escapeHtml(projectTypeLabel || '(not specified)')}<br />
        <strong>Timeline:</strong> ${escapeHtml(timelineLabel || '(not specified)')}
      </p>
      ${message ? `<h3>Message</h3><p style="white-space: pre-wrap;">${escapeHtml(message)}</p>` : ''}
      <hr />
      <p style="color: #666; font-size: 12px;">Sent from buildodyssey.com. Routed to ${escapeHtml(routedTo)}. Reply directly to respond to the sender.</p>
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

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
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

// Idaho area codes — phones starting with these are treated as local.
// 208 is the historical statewide area code; 986 is the newer overlay
// added in 2017 to handle number exhaustion.
const IDAHO_AREA_CODES = ['208', '986'];

// Pretty labels for the qualifying-field select values
const BUILD_LOCATION_LABELS: Record<string, string> = {
  'idaho-falls': 'Idaho Falls',
  'ammon': 'Ammon',
  'rigby': 'Rigby',
  'rexburg': 'Rexburg',
  'shelley': 'Shelley',
  'blackfoot': 'Blackfoot',
  'pocatello': 'Pocatello',
  'other-eastern-idaho': 'Other Eastern Idaho area',
  'moving-from-out-of-state': 'Moving here from out of state',
  'not-sure-yet': 'Eastern Idaho but not sure which city yet',
  'outside-eastern-idaho': 'Outside Eastern Idaho',
};
const PROJECT_TYPE_LABELS: Record<string, string> = {
  'new-construction-our-lot': 'New construction on an Odyssey lot',
  'new-construction-my-lot': 'New construction on my own lot',
  'quick-move-in': 'Quick move-in / spec home',
  'just-exploring': 'Just exploring options',
  'remodel-or-addition': 'Remodel or addition',
};
const TIMELINE_LABELS: Record<string, string> = {
  'ready-now': 'Ready to start now',
  '3-6-months': '3-6 months out',
  '6-12-months': '6-12 months out',
  '12-months-plus': 'More than a year out',
  'exploring': 'Just exploring',
};
function formatChoice(value: string, labels: Record<string, string>): string {
  return labels[value] || value;
}
