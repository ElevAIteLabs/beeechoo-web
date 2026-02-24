// src/lib/creators.ts
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';
// src/lib/creators.ts


export type CreatorDto = {
  id: string;
  name: string | null;
  brandName?: string | null;
  bio?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
  isCreator: boolean;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  category?: string | null;

  // ✅ NEW: used for verified badge + WhatsApp visibility
  creatorKycStatus?: 'pending' | 'verified' | 'rejected' | null;
};

export async function listCreators(
  take = 24
): Promise<{ data: CreatorDto[]; nextCursor: string | null }> {
  const res = await fetch(`${API_BASE}/creators?take=${take}`);
  if (!res.ok) {
    throw new Error(`Failed to load creators: ${res.status}`);
  }
  return res.json();
}

export async function getCreatorById(id: string): Promise<CreatorDto> {
  const res = await fetch(`${API_BASE}/creators/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load creator ${id}: ${res.status}`);
  }
  return res.json();
}
