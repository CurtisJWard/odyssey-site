// Helpers shared between form-handling Pages Functions.
//
// Inbound leads (contact form, realtor-intro form) get routed to whichever
// rep is on duty today per the rotation calendar. If no rotation event is
// matched, fall back to the env-configured FORM_RECIPIENTS list (typically
// fan-out to all reps so nothing falls through the cracks).

export interface TodaysAgent {
  email: string;
  name: string;
  firstName: string;
}

/**
 * Fetches today's on-duty agent from the Apps Script endpoint.
 * Returns null if no agent is matched, the endpoint isn't configured,
 * or the upstream fails — the caller should fall back to FORM_RECIPIENTS.
 */
export async function fetchTodaysAgent(url: string | undefined): Promise<TodaysAgent | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json() as {
      available?: boolean;
      email?: string;
      name?: string;
      firstName?: string;
    };
    if (data.available && data.email) {
      return {
        email: data.email,
        name: data.name || data.firstName || 'Odyssey Team',
        firstName: data.firstName || '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build the recipient list for a form-handler email.
 * Primary: today's on-duty agent (if matched).
 * Fallback: FORM_RECIPIENTS env var (comma-separated).
 */
export function buildRecipients(
  todaysAgent: TodaysAgent | null,
  fallback: string
): string[] {
  if (todaysAgent) return [todaysAgent.email];
  return fallback.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Build the silent BCC list (leadership/ops visibility).
 * Reads FORM_BCC env var, dedupes against the TO recipients so no one
 * receives the same email twice (e.g., if the on-duty agent is somehow
 * also in the BCC list).
 */
export function buildBcc(
  formBcc: string | undefined,
  toRecipients: string[]
): string[] {
  if (!formBcc) return [];
  const toSet = new Set(toRecipients.map(r => r.toLowerCase()));
  return formBcc
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(addr => !toSet.has(addr.toLowerCase()));
}
