
// src/lib/kyc.ts
import { getToken } from './auth';

const API = import.meta.env.VITE_API_BASE || 'https://api.beeechoo.com';

export type Me = {
  instagram: any;
  isHost: boolean;
  isCreator?: boolean;

  // Backward-compatible host KYC fields
  kycStatus?: 'pending' | 'verified' | 'rejected' | null;
  kycReason?: string | null;

  // Optional future split per role, if /me is extended later
  hostKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  hostKycReason?: string | null;
  creatorKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  creatorKycReason?: string | null;

  isBrand?: boolean | null;
  brandKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  brandKycReason?: string | null;


  brandName?: string | null;
  name?: string | null;
  email?: string | null;
  city?: string | null;
  bio?: string | null;
};

export async function getMe(): Promise<Me> {
  const r = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!r.ok) throw new Error('Unauthorized');

  const data = await r.json();
  return data.user as Me;
}

/**
 * Submit KYC for either host or creator.
 *
 * @param form   FormData including fullName, document, selfie, etc.
 * @param target "host" | "creator" (defaults to "host")
 */
export async function submitKyc(
  form: FormData,
  target: 'host' | 'creator' | 'brand' = 'host',
) {
  // Ensure the target is included in multipart payload
  if (!form.has('target')) {
    form.append('target', target);
  }

  const r = await fetch(`${API}/kyc/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
    body: form,
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({} as any));
    throw new Error(e?.error || 'KYC submit failed');
  }
  return r.json();
}
