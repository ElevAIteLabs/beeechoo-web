// src/lib/campaigns.ts
const API = import.meta.env.VITE_API_BASE as string;

export type CampaignPlatform = "online" | "offline" | "both";
export type Gender = "male" | "female" | "other";

export type CampaignDto = {
  id: string;
  hostId?: string | null;

  title: string;
  description?: string | null;
  category: string;

  status: "live" | "closed" | "expired";
  expiresAt: string;

  image?: string | null;
  imageUrl?: string | null;

  hostName?: string | null;
  interestCount?: number;

  // ✅ NEW FIELDS (from your backend changes)
  payPerCreator?: number | null;
  payTotal?: number | null;
  currency?: string | null;

  openings?: number | null;
  preferredGender?: Gender | null;
  platform?: CampaignPlatform;

  location?: string | null;
  language?: string | null;

  // ✅ Save feature (from backend save routes)
  isSaved?: boolean;
  saveCount?: number;

  createdAt?: string;
  updatedAt?: string;
};

export type ListCampaignFilters = {
  platform?: CampaignPlatform;
  gender?: Gender;
  location?: string;
  language?: string;
  category?: string;
};

export async function listCampaigns(
  take = 20,
  cursor?: string,
  filters?: ListCampaignFilters
): Promise<{ data: CampaignDto[]; nextCursor: string | null }> {
  const qs = new URLSearchParams();
  qs.set("take", String(take));
  if (cursor) qs.set("cursor", cursor);

  // ✅ optional filters
  if (filters?.platform) qs.set("platform", filters.platform);
  if (filters?.gender) qs.set("gender", filters.gender);
  if (filters?.location) qs.set("location", filters.location);
  if (filters?.language) qs.set("language", filters.language);
  if (filters?.category) qs.set("category", filters.category);

  const res = await fetch(`${API}/campaigns?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to load campaigns");
  return res.json();
}

export async function getCampaignById(id: string): Promise<CampaignDto> {
  const res = await fetch(`${API}/campaigns/${id}`);
  if (!res.ok) throw new Error("Campaign not found");
  return res.json();
}

// host create (multipart)
export async function createCampaign(token: string, formData: FormData) {
  const res = await fetch(`${API}/campaigns`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to create campaign");
  }
  return res.json();
}
// ✅ Interested users list for host (YOU NEED BACKEND ROUTE)
export type CampaignInterestDto = {
  id: string;
  createdAt: string;

  userId?: string | null;

  // direct fields (if backend stores)
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;

  // or profile fallback (if backend joins user profile)
  userProfileName?: string | null;
  userProfileCity?: string | null;
  userProfileBrandName?: string | null;
};

export async function listCampaignInterests(
  token: string,
  id: string
): Promise<{ data: CampaignInterestDto[] }> {
  const res = await fetch(`${API}/campaigns/${id}/interests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to load interested users");
  }
  return res.json();
}

// host update JSON
export async function updateCampaign(token: string, id: string, payload: Partial<CampaignDto>) {
  const res = await fetch(`${API}/campaigns/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to update campaign");
  }
  return res.json();
}

// host update image (multipart)
export async function updateCampaignImage(token: string, id: string, image: File) {
  const form = new FormData();
  form.append("image", image);

  const res = await fetch(`${API}/campaigns/${id}/image`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to update image");
  }
  return res.json();
}

// host delete
export async function deleteCampaign(token: string, id: string) {
  const res = await fetch(`${API}/campaigns/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to delete campaign");
  }
}

// user interest
export async function markInterested(token: string, id: string) {
  const res = await fetch(`${API}/campaigns/${id}/interest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to save interest");
  }
  return res.json();
}

export async function removeInterested(token: string, id: string) {
  const res = await fetch(`${API}/campaigns/${id}/interest`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json().catch(() => ({ ok: true }));
}

// ✅ SAVE CAMPAIGN
export async function saveCampaign(token: string, id: string) {
  const res = await fetch(`${API}/campaigns/${id}/save`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to save campaign");
  }
  return res.json();
}

export async function unsaveCampaign(token: string, id: string) {
  const res = await fetch(`${API}/campaigns/${id}/save`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json().catch(() => ({ ok: true }));
}

export async function listSavedCampaigns(token: string): Promise<{ data: CampaignDto[] }> {
  const res = await fetch(`${API}/me/saved-campaigns`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Failed to load saved campaigns");
  }
  return res.json();
}

// host list my campaigns
export async function listMyCampaigns(token: string): Promise<{ data: any[] }> {
  const res = await fetch(`${API}/host/campaigns`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load my campaigns");
  return res.json();
}