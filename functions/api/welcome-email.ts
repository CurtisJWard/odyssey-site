// Welcome-email endpoint — bridges the Apps Script "Add User" flow to Resend
// so the new user's invitation comes from noreply@buildodyssey.com (verified
// domain, DKIM/SPF set up) instead of Curtis's personal email address.
//
// Called by Code.js → sendWelcomeEmailToNewUser_ via fetch POST. Each request
// must include the shared secret in the Authorization header — without it,
// the endpoint returns 401 so the public can't spam it.
//
// Request body (JSON):
//   {
//     toEmail:        "bob@kw.com",
//     firstName:      "Bob",
//     tempPassword:   "Odyssey-XX1234",
//     role:           "Agent Admin",  // or 'Customer-Client' / 'Odyssey Project Consultant' / 'Owner'
//     callerName:     "Kaysha Landon",
//     callerEmail:    "kaysha@buildodyssey.com"
//   }

interface Env {
  RESEND_API_KEY: string;
  FORM_FROM: string;                  // "Odyssey Homes <noreply@buildodyssey.com>"
  WELCOME_EMAIL_SECRET: string;       // shared secret with Apps Script; set in Pages env
}

interface RequestBody {
  toEmail?: string;
  firstName?: string;
  tempPassword?: string;
  role?: string;
  callerName?: string;
  callerEmail?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Shared-secret auth — Apps Script sends `Authorization: Bearer <secret>`.
  // Without it, anyone could POST to this endpoint and burn through our
  // Resend quota or spam arbitrary email addresses on our behalf.
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${env.WELCOME_EMAIL_SECRET}`;
  if (!env.WELCOME_EMAIL_SECRET || auth !== expected) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const toEmail = String(body.toEmail || '').trim().toLowerCase();
  const firstName = String(body.firstName || '').trim();
  const tempPassword = String(body.tempPassword || '').trim();
  const role = String(body.role || '').trim();
  const callerName = String(body.callerName || '').trim() || 'Your Odyssey contact';
  const callerEmail = String(body.callerEmail || '').trim();

  if (!toEmail || !firstName || !tempPassword) {
    return jsonResponse({ ok: false, error: 'Missing required fields (toEmail, firstName, tempPassword)' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return jsonResponse({ ok: false, error: 'Invalid toEmail' }, 400);
  }

  // Role-specific intro line
  let roleLine: string;
  switch (role) {
    case 'Agent Admin':
      roleLine = "You're set up as an Agent Admin — sign in, add your own clients, and manage their estimates.";
      break;
    case 'Odyssey Project Consultant':
      roleLine = "You're set up as an Odyssey Project Consultant — recruit Realtors and manage clients.";
      break;
    case 'Owner':
      roleLine = "You're set up as an Owner — full access across all teams and users.";
      break;
    default:
      roleLine = "You're set up as a Customer-Client — sign in, build your custom estimate, save drafts at your own pace.";
  }

  const loginUrl = 'https://buildodyssey.com/estimate/';
  const subject = `Your Odyssey Homes Estimator login — welcome, ${firstName}!`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #111827; max-width: 540px; line-height: 1.55;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>${escapeHtml(callerName)} just registered you in the Odyssey Homes Estimator. ${escapeHtml(roleLine)}</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="margin: 0 0 8px;"><strong>Sign in:</strong> <a href="${loginUrl}" style="color: #2B2E83;">${loginUrl}</a><br />
      <span style="color: #6B7280; font-size: 13px;">(click "Sign in to the Estimator" on that page)</span></p>
      <p style="margin: 16px 0;"><strong>Your login:</strong></p>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #6B7280;">Email:</td><td style="padding: 4px 0;"><code style="background: #F3F4F6; padding: 2px 6px; border-radius: 3px;">${escapeHtml(toEmail)}</code></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6B7280;">Password:</td><td style="padding: 4px 0;"><code style="background: #F3F4F6; padding: 2px 6px; border-radius: 3px;">${escapeHtml(tempPassword)}</code></td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #6B7280; font-size: 13px; margin: 0;">A few quick notes:</p>
      <ul style="color: #6B7280; font-size: 13px; margin: 8px 0 0; padding-left: 20px;">
        <li>Your email is case-insensitive; the password is case-sensitive (match it exactly).</li>
        <li>You can save drafts and come back later — no need to finish in one sitting.</li>
        <li>Questions? Reply to this email and ${escapeHtml(callerName)} will help.</li>
      </ul>
      <p style="margin-top: 24px;">Welcome aboard.</p>
      <p style="color: #6B7280; font-size: 13px; margin: 8px 0 0;">
        — The Odyssey Homes Team<br />
        <a href="https://buildodyssey.com" style="color: #2B2E83;">buildodyssey.com</a> · (208) 450-5500
      </p>
    </div>
  `;

  // Plain-text fallback for clients that don't render HTML
  const text =
`Hi ${firstName},

${callerName} just registered you in the Odyssey Homes Estimator. ${roleLine}

Sign in here:
  ${loginUrl}
  (click "Sign in to the Estimator" on that page)

Your login:
  Email:    ${toEmail}
  Password: ${tempPassword}

A few quick notes:
  - Your email is case-insensitive; the password is case-sensitive (match it exactly).
  - You can save drafts and come back later — no need to finish in one sitting.
  - Questions? Reply to this email and ${callerName} will help.

Welcome aboard.

— The Odyssey Homes Team
buildodyssey.com · (208) 450-5500
`;

  // Reply-To goes to the sales agent who added them — buyer's questions
  // route back to the right person, not to noreply@.
  const replyTo = callerEmail || 'office@buildodyssey.com';

  // CC the sales agent so they see the welcome went out and can forward
  // it themselves if it ever bounces or lands in spam.
  const cc = callerEmail ? [callerEmail] : [];

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FORM_FROM,           // "Odyssey Homes <noreply@buildodyssey.com>"
      to: [toEmail],
      ...(cc.length > 0 ? { cc } : {}),
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    console.error('Resend welcome-email error:', resendRes.status, errBody);
    return jsonResponse({ ok: false, error: 'Email service error', status: resendRes.status }, 502);
  }

  return jsonResponse({ ok: true });
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
