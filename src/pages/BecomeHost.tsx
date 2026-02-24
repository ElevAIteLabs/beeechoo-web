// src/pages/BecomeHost.tsx
import React, { type JSX } from 'react';
import { getMe, submitKyc } from '../lib/kyc';
import { getToken } from '../lib/auth';

const API = import.meta.env.VITE_API_BASE as string;

type Me = {
  isHost: boolean;
  kycStatus?: 'pending' | 'verified' | 'rejected' | null;
  kycReason?: string | null;
};

const theme = {
  text: '#111827',
  subtext: '#6B7280',
  primary: '#F6B100',
  border: '#E5E7EB',
  green: '#10B981',
  red: '#EF4444',
};

// ✅ Fix: make inputs shrink properly inside CSS grid + never exceed parent width
const uploadCardStyle: React.CSSProperties = {
  background: '#F9FAFB',
  borderRadius: 14,
  border: `1.5px dashed ${theme.border}`,
  padding: 14,              // ✅ smaller
  textAlign: 'left',
  boxSizing: 'border-box',
  minWidth: 0,
};

const uploadTopRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const uploadHintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: theme.subtext,
  lineHeight: 1.4,
};

const uploadButtonStyle: React.CSSProperties = {
  background: theme.primary,
  color: '#111',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(246, 177, 0, 0.25)',
  whiteSpace: 'nowrap',
};

const fileNamePillStyle: React.CSSProperties = {
  marginTop: 10,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#ECFDF5',
  color: '#065F46',
  fontSize: 12,
  fontWeight: 600,
  maxWidth: '100%',
};


const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  display: 'block',
  padding: '14px 16px',
  borderRadius: 12,
  border: `1.5px solid ${theme.border}`,
  fontSize: 14,
  transition: 'all 0.2s ease',
  background: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  marginBottom: 8,
  fontSize: 14,
  color: theme.text,
};

export default function BecomeHost(): JSX.Element {
  const [me, setMe] = React.useState<Me | null>(null);

  const [fullName, setFullName] = React.useState('');
  const [brandName, setBrandName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [city, setCity] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [gender, setGender] = React.useState<'male' | 'female' | 'other' | ''>('');

  const [gstNumber, setGstNumber] = React.useState('');
  const [companyEmail, setCompanyEmail] = React.useState('');
  const [eventHostName, setEventHostName] = React.useState('');

  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');

  React.useEffect(() => {
    getMe()
      .then((data) => {
        setMe(data as Me);
        const anyData = data as any;
        if (anyData.name) setFullName(anyData.name);
        if (anyData.brandName) setBrandName(anyData.brandName);
        if (anyData.email) setEmail(anyData.email);
        if (anyData.city) setCity(anyData.city);
        if (anyData.bio) setBio(anyData.bio);
        if (anyData.gender) setGender(anyData.gender);
      })
      .catch(() => setMe({ isHost: false, kycStatus: null }));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documentFile) return setMsg('Please upload an ID document');
    if (!fullName.trim()) return setMsg('Full name is required');

    setMsg('');
    setSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        setMsg('You must be signed in to submit KYC.');
        return;
      }

      const profilePayload = {
        name: fullName,
        email: email || undefined,
        city: city || undefined,
        bio: bio || undefined,
        brandName: brandName || undefined,
        gender: gender || undefined,
      };

      const rProfile = await fetch(`${API}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profilePayload),
      });

      if (!rProfile.ok) {
        const je = await rProfile.json().catch(() => ({} as any));
        throw new Error(je?.error || 'Failed to save profile information');
      }

      const form = new FormData();
      form.append('fullName', fullName);
      if (brandName) form.append('brandName', brandName);
      if (gstNumber) form.append('gstNumber', gstNumber);
      if (companyEmail) form.append('companyEmail', companyEmail);
      if (eventHostName) form.append('eventHostName', eventHostName);

      form.append('document', documentFile);
      if (selfieFile) form.append('selfie', selfieFile);

      await submitKyc(form, 'host');
      setMsg('Host KYC submitted! Awaiting admin approval.');
      setMe((prev) => (prev ? { ...prev, kycStatus: 'pending' } : prev));
    } catch (err: any) {
      setMsg(err?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Optional: page background like your screenshot + more responsive width
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFF7E6 0%, #FFFFFF 55%)',
    padding: '24px 12px',
    boxSizing: 'border-box',
  };

  // ✅ Fix: allow wider form on desktop, still fluid on mobile
  const containerStyle: React.CSSProperties = {
    maxWidth: 920,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  };

  // ✅ Fix: prevent any child overflow from visually escaping the card
  const formCardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: `1px solid ${theme.border}`,
    padding: '28px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
  };

  // Loading
  if (!me) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: theme.subtext }}>Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  // (rest of your state screens unchanged...) 👇
  // ✅ Just wrap the returned JSX in pageStyle/containerStyle, and use formCardStyle for the form card.

  if (me.isHost) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: '0 0 12px' }}>
              You're already a Host!
            </h2>
            <p style={{ color: theme.subtext, marginBottom: 24, fontSize: 15 }}>
              Start creating amazing events for your audience.
            </p>
            <a
              href="/events/new"
              style={{
                display: 'inline-block',
                background: theme.primary,
                color: '#000',
                padding: '14px 28px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(246, 177, 0, 0.3)',
              }}
            >
              Create an Event →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // pending/verified/rejected screens: wrap same way (pageStyle + containerStyle + formCardStyle)

  // No KYC yet → form
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
            Become a Host
          </h2>
          <p style={{ color: theme.subtext, fontSize: 15, margin: 0 }}>
            Submit your details to request host access.
          </p>
        </div>

        {/* Form Card */}
        <div style={formCardStyle}>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your legal full name"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Event Host Name</label>
              <input
                value={eventHostName}
                onChange={(e) => setEventHostName(e.target.value)}
                placeholder="Name to show as event host (optional)"
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Brand / Company Name</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your brand or company"
                style={inputStyle}
              />
            </div>

            {/* ✅ Fix: minWidth:0 on grid + children */}
            <div className="be-grid cols-2" style={{ width: '100%' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>GST Number</label>
                <input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="GSTIN (optional)"
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  type="email"
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Company Email</label>
                <input
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="business@company.com"
                  type="email"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about you as a host"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              />
            </div>

            {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
              <div
                style={{
                  minWidth: 0,
                  background: '#F9FAFB',
                  borderRadius: 12,
                  border: `1.5px dashed ${theme.border}`,
                  padding: 20,
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 12 }}>ID Document *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  required
                  style={{ fontSize: 12, maxWidth: '100%' }}
                />
                {documentFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: theme.green }}>✓ {documentFile.name}</div>
                )}
              </div>

              <div
                style={{
                  minWidth: 0,
                  background: '#F9FAFB',
                  borderRadius: 12,
                  border: `1.5px dashed ${theme.border}`,
                  padding: 20,
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 12 }}>Selfie (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                  style={{ fontSize: 12, maxWidth: '100%' }}
                />
                {selfieFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: theme.green }}>✓ {selfieFile.name}</div>
                )}
              </div>
            </div> */}

            {/* File uploads in a grid */}
            <div
              className="be-grid cols-2"
              style={{
                width: '100%',
                alignItems: 'start',
              }}
            >
              {/* ID Document */}
              <div style={uploadCardStyle}>
                <div style={uploadTopRowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...labelStyle, marginBottom: 0 }}>ID Document <span style={{ color: theme.red }}>*</span></div>
                    <div style={uploadHintStyle}>PNG/JPG/PDF • Max ~10MB</div>
                  </div>

                  {/* Hidden input + pretty button */}
                  <input
                    id="kyc-document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    required
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="kyc-document" style={uploadButtonStyle}>
                    Upload
                  </label>
                </div>

                {documentFile ? (
                  <div style={fileNamePillStyle} title={documentFile.name}>
                    <span>✓</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {documentFile.name}
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: theme.subtext }}>
                    No file selected
                  </div>
                )}
              </div>

              {/* Selfie */}
              <div style={uploadCardStyle}>
                <div style={uploadTopRowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...labelStyle, marginBottom: 0 }}>Selfie (optional)</div>
                    <div style={uploadHintStyle}>Clear face photo • JPG/PNG</div>
                  </div>

                  <input
                    id="kyc-selfie"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="kyc-selfie" style={uploadButtonStyle}>
                    Upload
                  </label>
                </div>

                {selfieFile ? (
                  <div style={fileNamePillStyle} title={selfieFile.name}>
                    <span>✓</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selfieFile.name}
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: theme.subtext }}>
                    No file selected
                  </div>
                )}
              </div>
            </div>


            <button
              disabled={submitting}
              type="submit"
              style={{
                background: theme.primary,
                color: '#000',
                padding: '16px 24px',
                border: 'none',
                borderRadius: 12,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 12px rgba(246, 177, 0, 0.3)',
                opacity: submitting ? 0.7 : 1,
                marginTop: 8,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Host KYC'}
            </button>

            {msg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: msg.includes('submitted') ? '#ECFDF5' : '#FEF2F2',
                  color: msg.includes('submitted') ? '#065F46' : '#991B1B',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
