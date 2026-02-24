import { type JSX } from 'react';
import { requestOtp, verifyOtp, saveSession } from '../lib/auth';
import { theme } from '../theme';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps): JSX.Element | null {
  const nav = useNavigate();

  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizePhone = (v: string) => v.replace(/[^\d]/g, '').slice(0, 15);

  const handleClose = () => {
    // 🔹 Always reset form state when closing
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
    onClose();
  };

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

      // 🔹 Use handleClose so popup *really* closes & resets
      handleClose();

      // 🔹 Navigate after closing modal
      nav('/');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          style={{
            width: '90%',
            maxWidth: 380,
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            padding: 18,
            position: 'relative',
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#999',
            }}
          >
            ✕
          </button>

          {/* Header */}
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
              <div style={{ fontSize: 22, fontWeight: 800 }}>Join the Creative Hive</div>
              <div style={{ opacity: 0.9 }}>Sign in to continue</div>
            </div>
          </div>

          <h3 style={{ margin: 0 }}>{step === 'phone' ? 'Sign in' : 'Enter OTP'}</h3>
          <p style={{ marginTop: 6, color: theme.colors.subtext }}>
            {step === 'phone' ? "We'll send a code to your phone" : 'Use the 4-digit code (1234)'}
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
                <div style={{ color: theme.colors.subtext, marginBottom: 4 }}>Phone</div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
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
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Sending…' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerify} style={{ display: 'grid', gap: 10 }}>
              <label>
                <div style={{ color: theme.colors.subtext, marginBottom: 4 }}>OTP</div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                  maxLength={4}
                  placeholder="1234"
                  inputMode="numeric"
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
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
