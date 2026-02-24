// src/LoginRedirectIfAuthed.tsx
import { Navigate } from 'react-router-dom';
import { isAuthed } from './lib/auth';
import type { JSX } from 'react';

export default function LoginRedirectIfAuthed({ children }: { children: JSX.Element }) {
  if (isAuthed()) return <Navigate to="/" replace />;
  return children;
}
