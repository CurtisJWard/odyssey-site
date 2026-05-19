interface Env {
  RESEND_API_KEY: string;
  FORM_RECIPIENTS: string;
  FORM_FROM: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const firstName = String(formData.get('first-name') || '').trim();
    const lastName = String(formData.get('last-name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
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

    const recipients = env.FORM_RECIPIENTS.split(',').map(s => s.trim()).filter(Boolean);
    const subject = `Odyssey Homes inquiry — ${firstName} ${lastName}`;
    const html = `
      <h2>New website inquiry — Odyssey Homes</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
      ${message ? `<p><strong>Message:</strong></p><p style="white-space: pre-wrap;">${escapeHtml(message)}</p>` : ''}
      <hr />
      <p style="color: #666; font-size: 12px;">Sent from buildodyssey.com — reply directly to respond to the sender.</p>
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
