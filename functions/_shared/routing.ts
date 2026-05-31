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
 * Distinguishes the THREE meaningful outcomes when we ask Apps Script "who's
 * on duty today?". This matters because both `no-event` and `unreachable`
 * cause fallback routing to FORM_RECIPIENTS — but `unreachable` is a SILENT
 * FAILURE the team should be told about (in the email subject), while
 * `no-event` is normal (e.g., a holiday with no rotation event scheduled).
 */
export type TodaysAgentStatus = 'matched' | 'no-event' | 'unreachable';

export interface TodaysAgentResult {
  agent: TodaysAgent | null;
  status: TodaysAgentStatus;
  /** Raw reason string from upstream when status is 'unreachable' or 'no-event'. Useful for debugging. */
  reason?: string;
}

/**
 * Fetches today's on-duty agent from the Apps Script endpoint and returns
 * both the agent (if matched) and a status describing what happened.
 *
 * Callers should fall back to FORM_RECIPIENTS whenever `agent` is null —
 * but should ALSO flag the email subject when `status === 'unreachable'`
 * so a broken upstream doesn't sit silently for days.
 */
export async function fetchTodaysAgent(url: string | undefined): Promise<TodaysAgentResult> {
  if (!url) return { agent: null, status: 'unreachable', reason: 'No TODAYS_AGENT_URL configured' };
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { agent: null, status: 'unreachable', reason: `Upstream HTTP ${res.status}` };
    const data = await res.json() as {
      available?: boolean;
      email?: string;
      name?: string;
      firstName?: string;
      reason?: string;
    };
    if (data.available && data.email) {
      return {
        agent: {
          email: data.email,
          name: data.name || data.firstName || 'Odyssey Team',
          firstName: data.firstName || '',
        },
        status: 'matched',
      };
    }
    // Distinguish "no event today" (normal) from any other reason (broken).
    // Apps Script returns reason='no matching event today' on legit empty days.
    const reason = data.reason || 'unknown';
    const isLegitEmpty = /no matching event/i.test(reason);
    return {
      agent: null,
      status: isLegitEmpty ? 'no-event' : 'unreachable',
      reason,
    };
  } catch (err) {
    return { agent: null, status: 'unreachable', reason: err instanceof Error ? err.message : String(err) };
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
