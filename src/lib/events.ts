const API = (import.meta.env.VITE_API_BASE as string) || '/api';

/**
 * Type definition for Event DTO as returned from the backend API.
 */
export type EventDto = {

  organizerName: any;

  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  banner?: string; // Banner image file path
  categories: string[]; // Categories are now an array of strings
  ticketLink?: string; // Link for ticket purchasing
  sponsorships?: any; // Sponsorships as JSON
};

/**
 * Fetches a paginated list of APPROVED (scheduled) events from the backend API.
 *
 * @param take - Maximum number of events to retrieve (default = 20)
 * @returns JSON containing data[] and nextCursor
 */
export async function listEvents(take = 20): Promise<{ data: EventDto[]; nextCursor: string | null }> {
  // 👇 Only fetch scheduled (approved) events
  const url = `${API}/events?take=${take}&status=scheduled`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to load approved events', res.status);
      throw new Error('Failed to load approved events');
    }
    return res.json();
  } catch (err) {
    console.error('Error fetching approved events:', err);
    throw err;
  }
}

/**
 * Fetches a single event by ID.
 */
export async function getEventById(id: string): Promise<EventDto> {
  const res = await fetch(`${API}/events/${id}`);
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}

/**
 * Creates a new event (Host only).
 * This function now handles file uploads and additional fields like categories and sponsorships.
 */
export async function createEvent(token: string, formData: FormData): Promise<EventDto> {
  const res = await fetch(`${API}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // Send FormData to handle file uploads
  });

  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

/**
 * Updates an existing event by ID.
 * This function can handle updates to categories, sponsorships, and the banner.
 */
export async function updateEvent(token: string, id: string, payload: Partial<EventDto>): Promise<EventDto> {
  const res = await fetch(`${API}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}

/**
 * Deletes an event by ID.
 */
export async function deleteEvent(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/events/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete event');
}
