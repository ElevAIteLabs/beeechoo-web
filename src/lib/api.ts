const API_BASE = import.meta.env.VITE_API_BASE as string;

export type Event = {
  id: string; title: string; description?: string; location?: string;
  startAt: string; endAt?: string; isAllDay: boolean;
  status: 'scheduled'|'cancelled'|'completed'; organizerEmail?: string;
};

export async function listEvents(): Promise<{data: Event[], nextCursor: string|null}> {
  const r = await fetch(`${API_BASE}/events`);
  if (!r.ok) throw new Error('Failed to load');
  return r.json();
}

export async function createEvent(payload: Partial<Event>) {
  const r = await fetch(`${API_BASE}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('Failed to create');
  return r.json();
}
