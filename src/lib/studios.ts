// src/lib/studios.ts
const API = (import.meta.env.VITE_API_BASE as string) || '/api';

export type StudioDto = {
  id: string;
  title: string;
  description?: string | null;
  categories: string[];

  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  mapLink?: string | null;

  maxPeople?: number | null;
  hourlyRate: number;
  minHours: number;

  amenities: string[];
  houseRules?: string | null;
  cancellationPolicy: "flexible" | "standard" | "strict";

  coverImage?: string | null;
  coverImageUrl?: string | null; // Added based on server response
  photos: string[];
  photoUrls?: string[];          // Added based on server response

  status: "active" | "inactive";

  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;

  ownerId?: string | null;
  ownerName?: string | null;     // Added based on server response
  createdAt: string;
  updatedAt: string;
};

/**
 * Public: Get list of studios
 * Backend expects 'take' for pagination, not 'limit'.
 */
export async function listStudios(take?: number): Promise<{ data: StudioDto[] }> {
  const url = take ? `${API}/studios?take=${take}` : `${API}/studios`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load studios");
  return res.json();
}

/**
 * Owner: Get "My" Studios
 * Backend route is '/studio/studios', not '/studios/mine'
 */
export async function listStudiosMine(token: string): Promise<StudioDto[]> {
  const res = await fetch(`${API}/studio/studios`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load your studios");
  // Backend returns { data: [...] } for this route too
  const json = await res.json();
  return json.data || [];
}

export async function getStudioById(id: string): Promise<StudioDto> {
  const res = await fetch(`${API}/studios/${id}`);
  if (!res.ok) throw new Error("Studio not found");
  return res.json();
}

export async function createStudio(token: string, formData: FormData): Promise<StudioDto> {
  const res = await fetch(`${API}/studios`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create studio");
  }
  const json = await res.json();
  return json.data;
}

export async function updateStudio(token: string, id: string, payload: Partial<StudioDto>): Promise<StudioDto> {
  const res = await fetch(`${API}/studios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update studio");
  const json = await res.json();
  return json.data;
}

// Note: Your server.ts does NOT currently have a DELETE route for studios.
// You might need to add `app.delete('/studios/:id', ...)` to server.ts if you want this to work.
export async function deleteStudio(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/studios/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete studio");
}