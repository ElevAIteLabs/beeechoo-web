// src/pages/Login.tsx
import React, { type JSX } from 'react';
import { requestOtp, verifyOtp, saveSession } from '../lib/auth';
import { theme } from '../theme';
import { useNavigate, useLocation } from 'react-router-dom';

// 🔹 Add props type
type LoginProps = {
  // optional: when used inside a modal, parent can pass this
  onSuccess?: () => void;
};

export default function Login({ onSuccess }: LoginProps): JSX.Element {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state?.from?.pathname as string) || '/';

  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '').slice(0, 15);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = normalizePhone(phone);
    if (clean.length < 8) {
      setError('Enter a valid phone number');
      return;
    }
    try {
      setLoading(true);
      await requestOtp(clean);
      alert('OTP sent (use 1234)');
      setStep('otp');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const { token, user } = await verifyOtp(normalizePhone(phone), otp);
      saveSession(token, user);

      // 🔹 If used inside a modal, this will close the popup
      if (onSuccess) {
        onSuccess();
      }

      // 🔹 Navigate back to where user came from
      nav(from, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.colors.bg,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 18,
          boxShadow: theme.shadow.card,
          padding: 18,
        }}
      >
        <div
          style={{
            height: 160,
            background: theme.colors.primary,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            marginBottom: 14,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              Join the Creative Hive
            </div>
            <div style={{ opacity: 0.9 }}>Sign in to continue</div>
          </div>
        </div>

        <h3 style={{ margin: 0 }}>
          {step === 'phone' ? 'Sign in' : 'Enter OTP'}
        </h3>
        <p style={{ marginTop: 6, color: theme.colors.subtext }}>
          {step === 'phone'
            ? 'We’ll send a code to your phone'
            : 'Use the 4-digit code (1234)'}
        </p>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              padding: 10,
              borderRadius: 8,
              margin: '8px 0',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={onRequest} style={{ display: 'grid', gap: 10 }}>
            <label>
              <div
                style={{
                  color: theme.colors.subtext,
                  marginBottom: 4,
                }}
              >
                Phone
              </div>
              <input
                value={phone}
                onChange={e => setPhone(normalizePhone(e.target.value))}
                placeholder="99999 99999"
                inputMode="numeric"
                style={{
                  width: '100%',
                  height: 42,
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: '0 10px',
                }}
              />
            </label>
            <button
              disabled={loading}
              style={{
                height: 44,
                border: 0,
                borderRadius: 12,
                background: theme.colors.primary,
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {loading ? 'Sending…' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 10 }}>
            <label>
              <div
                style={{
                  color: theme.colors.subtext,
                  marginBottom: 4,
                }}
              >
                OTP
              </div>
              <input
                value={otp}
                onChange={e =>
                  setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 4))
                }
                maxLength={4}
                placeholder='1234'
                inputMode='numeric'
                style={{
                  width: '100%',
                  height: 42,
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: '0 10px',
                  letterSpacing: 6,
                  textAlign: 'center',
                }}
              />
            </label>
            <button
              disabled={loading}
              style={{
                height: 44,
                border: 0,
                borderRadius: 12,
                background: theme.colors.success,
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
