// src/lib/profile.ts

export type MyProfile = {
  id: string;
  phone: string;

  // Public fields
  name?: string | null;
  email?: string | null;
  city?: string | null;
  bio?: string | null;

  brandName?: string | null;      // Shared with host + creator

  // Roles
  isHost: boolean;
  isCreator: boolean;             // <-- NEW
};

const API =
  (import.meta as any).env?.VITE_API_BASE ||
  'https://api.beeechoo.com';

/** --------------------------------------------------
 *  GET MY PROFILE
 *  -------------------------------------------------- */
export async function getMyProfile(token: string): Promise<MyProfile> {
  const res = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');

  // /me returns: { user: {...} }
  const json = await res.json();
  return json.user as MyProfile;
}

/** --------------------------------------------------
 *  UPDATE PROFILE
 *  -------------------------------------------------- */
export async function updateMyProfile(
  token: string,
  input: Partial<
    Pick<
      MyProfile,
      'name' | 'email' | 'city' | 'bio' | 'brandName'
    >
  >
): Promise<MyProfile> {
  const res = await fetch(`${API}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || 'Failed to update profile');
  }

  const json = await res.json();
  return json.user as MyProfile;
}

/** --------------------------------------------------
 *  BECOME HOST (Existing)
 *  -------------------------------------------------- */
export async function becomeHost(token: string) {
  const res = await fetch(`${API}/me/become-host`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to submit host request');
  return res.json();
}

/** --------------------------------------------------
 *  NEW — Become Creator
 *  -------------------------------------------------- */
export async function becomeCreator(token: string) {
  const res = await fetch(`${API}/me/become-creator`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || 'Failed to become creator');
  }
  return res.json();
}
