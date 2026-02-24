// src/lib/auth.ts
const API = import.meta.env.VITE_API_BASE as string;

export type User = {
  id: string;
  phone: string;
  name?: string | null;
  brandName?: string | null; // Added previously, ensure it's here
  isHost: boolean;
 isBrand?: boolean | null;
  brandKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  brandKycReason?: string | null;
  isCreator?: boolean;
  kycStatus?: string;
  // 🛑 ADD NEW IMAGE FIELDS HERE
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
};

const TK = 'token';
const UK = 'user';

/* ---------------------- Session Helpers ---------------------- */
export function getToken(): string | null {
  return localStorage.getItem(TK);
}

export function isAuthed(): boolean {
  return !!getToken();
}

export function saveSession(token: string, user: User): void {
  localStorage.setItem(TK, token);
  localStorage.setItem(UK, JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem(UK);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearSession(): void {
  localStorage.removeItem(TK);
  localStorage.removeItem(UK);
}

/* ---------------------- Auth API Calls ---------------------- */
export async function requestOtp(phone: string) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error('OTP request failed');
  return res.json();
}


export async function verifyOtp(phone: string, otp: string) {
  const r = await fetch(`${API}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  if (!r.ok) throw new Error('Invalid OTP');
  return r.json() as Promise<{ token: string; user: User }>;
}

// 🛑 Updated return type in fetchMe
export async function fetchMe(): Promise<User> {
  const token = getToken();
  const r = await fetch(`${API}/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!r.ok) throw new Error('Unauthorized');
  const data = (await r.json()) as { user: User };
  return data.user;
}