// src/pages/CreatorProfile.tsx
import React, { type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { getCreatorById, type CreatorDto } from '../lib/creators';
import { MapPin, MessageCircle } from 'lucide-react';
import { getToken } from '../lib/auth';
import { submitKyc } from '../lib/kyc';

// ---- Extend Creator type so TS knows about brand flags / statuses ----
type ExtendedCreator = CreatorDto & {
  isBrand?: boolean | null;
  brandKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  creatorKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  whatsapp?: string | null;
};

// Logged-in viewer (brand) info
type ViewerMe = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  isBrand?: boolean | null;
  brandKycStatus?: 'pending' | 'verified' | 'rejected' | null;
};

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  'https://api.beeechoo.com';

// --- Theme ---
const theme = {
  colors: {
    primary: '#F5B01A',
    primarySoft: '#FFE8A3',
    background: '#F5F5F7',
    card: '#FFFFFF',
    text: '#111827',
    subtext: '#6B7280',
    border: '#E5E7EB',
    muted: '#9CA3AF',
  },
};

// --- Component Styles ---
const pageWrapperStyle: React.CSSProperties = {
  background: theme.colors.background,
  minHeight: '100vh',
  padding: '60px 16px',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const profileContainerStyle: React.CSSProperties = {
  maxWidth: 720,
  width: '100%',
  background: theme.colors.card,
  borderRadius: 20,
  boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
  border: `1px solid ${theme.colors.border}`,
  textAlign: 'center',
  overflow: 'hidden',
};

const coverPhotoStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
};

const profileHeaderStyle: React.CSSProperties = {
  padding: '0 24px 32px 24px',
  marginTop: -80,
  position: 'relative',
};

const avatarStyle: React.CSSProperties = {
  width: 150,
  height: 150,
  borderRadius: '50%',
  objectFit: 'cover',
  border: `6px solid ${theme.colors.card}`,
  boxShadow: '0 8px 30px rgba(15,23,42,0.25)',
  margin: '0 auto 16px auto',
  background: theme.colors.card,
};

const fallbackAvatarStyle: React.CSSProperties = {
  ...avatarStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.colors.primarySoft,
  color: theme.colors.text,
  fontSize: 48,
  fontWeight: 700,
};

const nameTitleWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 20,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 800,
  color: theme.colors.text,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const brandStyle: React.CSSProperties = {
  margin: '4px 0 10px 0',
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.colors.subtext,
};

const verifiedBadgeWrapper: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const verifiedBadgeStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: '999px',
  background:
    'radial-gradient(circle at 30% 0, #FFFFFF 0, #FFFFFF 30%, #FACC15 65%, #EAB308 80%, #CA8A04 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 0 2px #FFFFFF, 0 4px 8px rgba(15,23,42,0.18)',
};

const verifiedCheckStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  stroke: '#111827',
  strokeWidth: 2.2,
  fill: 'none',
};

const infoChipsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  justifyContent: 'center',
  marginBottom: 12,
};

const infoChipStyle: React.CSSProperties = {
  background: theme.colors.primary,
  color: '#111827',
  padding: '6px 14px',
  borderRadius: 999,
  fontSize: '0.9rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
};

const aboutSectionStyle: React.CSSProperties = {
  padding: '28px 32px',
  background: theme.colors.card,
  borderTop: `1px solid ${theme.colors.border}`,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '1.1rem',
  fontWeight: 700,
  color: theme.colors.text,
};

const bioStyle: React.CSSProperties = {
  margin: '0 auto',
  fontSize: '0.95rem',
  color: theme.colors.text,
  lineHeight: 1.7,
  maxWidth: 520,
};

const connectSectionStyle: React.CSSProperties = {
  padding: '24px 32px 28px 32px',
  borderTop: `1px solid ${theme.colors.border}`,
};

const socialIconsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  marginTop: 12,
  flexWrap: 'wrap',
};

const socialIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: theme.colors.card,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.text,
  textDecoration: 'none',
  border: `1px solid ${theme.colors.border}`,
  transition: 'all 0.18s ease',
  fontSize: 0,
};

const socialIconLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: theme.colors.muted,
  marginTop: 4,
};

const bigWhatsappButtonStyle: React.CSSProperties = {
  marginTop: 18,
  width: '100%',
  maxWidth: 360,
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 16px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  background: '#16A34A',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: 15,
  boxShadow: '0 10px 25px rgba(22,163,74,0.35)',
};

const statusContainerStyle: React.CSSProperties = {
  padding: 40,
  textAlign: 'center',
  minHeight: '100vh',
  background: theme.colors.background,
  color: theme.colors.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
};

// Brand KYC modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const modalCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: '#FFFFFF',
  borderRadius: 16,
  boxShadow: '0 20px 40px rgba(15,23,42,0.35)',
  padding: 20,
};

// --- Social SVG icons ---
const InstagramIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12v.1a29 29 0 0 0 .46 5.48a2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12.1v-.1a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 22v-7h2.5a1 1 0 0 0 .98-.8l.5-3A1 1 0 0 0 16 10h-3V8c0-.83.67-1.5 1.5-1.5H17a1 1 0 0 0 1-1V4.1A1.1 1.1 0 0 0 16.9 3h-2.4A4.5 4.5 0 0 0 10 7.5V10H8a1 1 0 0 0-1 .9l-.5 3A1 1 0 0 0 7.5 15H10v7h3z" />
  </svg>
);

// --- Verified Badge component ---
const VerifiedBadge = () => (
  <span style={verifiedBadgeWrapper} aria-label="Verified creator">
    <span style={verifiedBadgeStyle}>
      <svg viewBox="0 0 24 24" style={verifiedCheckStyle}>
        <polyline points="5 13 10 17 19 7" />
      </svg>
    </span>
  </span>
);

export default function CreatorProfile(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const [creator, setCreator] = React.useState<ExtendedCreator | null>(null);
  const [viewer, setViewer] = React.useState<ViewerMe | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // brand KYC modal state
  const [brandModalOpen, setBrandModalOpen] = React.useState(false);
  const [bkFullName, setBkFullName] = React.useState('');
  const [bkBrandName, setBkBrandName] = React.useState('');
  const [bkGstNumber, setBkGstNumber] = React.useState('');
  const [bkCompanyEmail, setBkCompanyEmail] = React.useState('');
  const [bkDocumentFile, setBkDocumentFile] = React.useState<File | null>(null);
  const [bkSelfieFile, setBkSelfieFile] = React.useState<File | null>(null);
  const [bkSubmitting, setBkSubmitting] = React.useState(false);
  const [bkMsg, setBkMsg] = React.useState<string>('');

  React.useEffect(() => {
    if (!id) {
      setError('Creator ID not provided.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // load creator
        const data = await getCreatorById(id);
        setCreator(data as ExtendedCreator);

        // load logged-in viewer (if any)
        const token = getToken();
        if (token) {
          try {
            const res = await fetch(`${API_BASE}/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              // /me returns { user: {...} }
              const json = await res.json();
              const me = (json.user || json) as ViewerMe;
              setViewer(me);

              // Prefill modal with basic info
              if (me.name) setBkFullName(me.name);
              if (me.email) setBkCompanyEmail(me.email);
            }
          } catch (meErr) {
            console.warn('Failed to load current user for brand check', meErr);
          }
        }
      } catch (e: any) {
        console.error(`Creator ${id} load error`, e);
        const errorMessage = e?.message?.includes('404')
          ? 'Creator not found or profile is not public.'
          : `Unable to load creator profile: ${e?.message || 'Unknown error.'}`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div style={statusContainerStyle}>Loading creator profile...</div>;
  }

  if (error) {
    return (
      <div style={{ ...statusContainerStyle, color: '#B91C1C' }}>
        Error: {error}
      </div>
    );
  }

  if (!creator) {
    return (
      <div style={{ ...statusContainerStyle, color: theme.colors.subtext }}>
        Creator not found.
      </div>
    );
  }

  const initials =
    creator.name
      ?.split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  // creator verification (visual badge)
  const isCreatorVerified =
    creator.creatorKycStatus === 'verified' || creator.isCreator;

  // viewer must have brandKycStatus === 'verified' to contact
  const viewerBrandVerified = viewer?.brandKycStatus === 'verified';

  const canUseWhatsapp = viewerBrandVerified && !!creator.whatsapp;

  const socialHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = theme.colors.primary;
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,23,42,0.12)';
  };

  const socialLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = theme.colors.border;
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  // Brand KYC submit handler (popup)
  async function onSubmitBrandKyc(e: React.FormEvent) {
    e.preventDefault();
    if (!bkDocumentFile) {
      setBkMsg('Please upload a company / ID document');
      return;
    }
    setBkMsg('');
    setBkSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        setBkMsg('Please sign in with your brand account to submit Brand KYC.');
        setBkSubmitting(false);
        return;
      }

      const form = new FormData();
      form.append('fullName', bkFullName);
      if (bkBrandName) form.append('brandName', bkBrandName);
      if (bkGstNumber) form.append('gstNumber', bkGstNumber);
      if (bkCompanyEmail) form.append('companyEmail', bkCompanyEmail);
      form.append('document', bkDocumentFile);
      if (bkSelfieFile) form.append('selfie', bkSelfieFile);

      // send as BRAND KYC
      await submitKyc(form, 'brand');

      setBkMsg('Brand KYC submitted! Our team will review and approve your brand.');

      // mark viewer as pending locally (still NOT verified, so WhatsApp stays disabled)
      setViewer((prev) =>
        prev ? { ...prev, brandKycStatus: 'pending' } : prev,
      );

      // close popup after a short success message
      setTimeout(() => {
        setBrandModalOpen(false);
        setBkMsg('');
      }, 1200);
    } catch (err: any) {
      setBkMsg(err?.message || 'Failed to submit Brand KYC');
    } finally {
      setBkSubmitting(false);
    }
  }

  // Shared handler for WhatsApp (icon + big button)
  const handleWhatsappClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (!creator.whatsapp) return;

    // Not logged in
    if (!viewer) {
      e.preventDefault();
      alert('Please log in with your brand account to contact creators on WhatsApp.');
      return;
    }

    // If already verified, allow WhatsApp
    if (viewerBrandVerified) {
      const cleaned = creator.whatsapp.replace(/\D/g, '');
      if (!cleaned) return;

      if ((e.currentTarget as HTMLElement).tagName === 'BUTTON') {
        e.preventDefault();
        window.open(`https://wa.me/${cleaned}`, '_blank', 'noopener,noreferrer');
      }
      // for <a>, browser handles the link
      return;
    }

    // Brand KYC pending: just info message
    if (viewer.brandKycStatus === 'pending') {
      e.preventDefault();
      alert(
        'Your Brand KYC is under review. You can contact creators on WhatsApp after it is approved by our team.',
      );
      return;
    }

    // No / rejected brand KYC → open popup
    e.preventDefault();
    setBrandModalOpen(true);
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={profileContainerStyle}>
        {/* Cover */}
        <div
          style={{
            ...coverPhotoStyle,
            backgroundImage: creator.coverPhotoUrl
              ? `url(${creator.coverPhotoUrl})`
              : 'url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1740&auto=format&fit=crop)',
          }}
        />

        {/* Header */}
        <div style={profileHeaderStyle}>
          {/* Avatar */}
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl}
              alt={`${creator.name}'s profile`}
              style={avatarStyle}
            />
          ) : (
            <div style={fallbackAvatarStyle}>{initials}</div>
          )}

          {/* Name + brand + chips */}
          <div style={nameTitleWrapperStyle}>
            <h1 style={nameStyle}>
              {creator.name}
              {isCreatorVerified && <VerifiedBadge />}
            </h1>

            {creator.brandName && (
              <h2 style={brandStyle}>{creator.brandName}</h2>
            )}

            <div style={infoChipsContainerStyle}>
              {creator.category && (
                <div style={infoChipStyle}>{creator.category}</div>
              )}
              {creator.city && (
                <div style={infoChipStyle}>
                  <MapPin size={14} />
                  {creator.city}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {creator.bio && (
          <div style={aboutSectionStyle}>
            <h3 style={sectionTitleStyle}>About</h3>
            <p style={bioStyle}>{creator.bio}</p>
          </div>
        )}

        {/* Connect */}
        {(creator.whatsapp ||
          creator.instagram ||
          creator.facebook ||
          creator.youtube) && (
            <div style={connectSectionStyle}>
              <h3 style={sectionTitleStyle}>Connect</h3>
              <div style={socialIconsContainerStyle}>
                {/* Instagram */}
                {creator.instagram && (
                  <a
                    href={creator.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialIconStyle}
                    onMouseEnter={socialHover}
                    onMouseLeave={socialLeave}
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                )}

                {/* YouTube */}
                {creator.youtube && (
                  <a
                    href={creator.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialIconStyle}
                    onMouseEnter={socialHover}
                    onMouseLeave={socialLeave}
                    aria-label="YouTube"
                  >
                    <YouTubeIcon />
                  </a>
                )}

                {/* Facebook */}
                {creator.facebook && (
                  <a
                    href={creator.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialIconStyle}
                    onMouseEnter={socialHover}
                    onMouseLeave={socialLeave}
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                )}

                {/* WhatsApp icon (viewer brand-KYC gated) */}
                {creator.whatsapp && (
                  <a
                    href={
                      canUseWhatsapp
                        ? `https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`
                        : '#'
                    }
                    target={canUseWhatsapp ? '_blank' : undefined}
                    rel={canUseWhatsapp ? 'noopener noreferrer' : undefined}
                    style={{
                      ...socialIconStyle,
                      borderColor: '#16A34A',
                      opacity: canUseWhatsapp ? 1 : 0.6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={socialHover}
                    onMouseLeave={socialLeave}
                    onClick={handleWhatsappClick}
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={22} />
                  </a>
                )}
              </div>

              {/* Big WhatsApp button */}
              {creator.whatsapp && (
                <button
                  type="button"
                  style={{
                    ...bigWhatsappButtonStyle,
                    opacity: canUseWhatsapp ? 1 : 0.6,
                    cursor: 'pointer',
                  }}
                  onClick={handleWhatsappClick}
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </button>
              )}

              <div style={socialIconLabelStyle}>
                Only brand accounts with approved Brand KYC can contact creators
                on WhatsApp.
              </div>
            </div>
          )}
      </div>

      {/* Brand KYC Popup */}
      {brandModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Brand KYC Verification
              </h3>
              <button
                type="button"
                onClick={() => setBrandModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', marginBottom: 14 }}>
              To contact creators on WhatsApp, please submit your Brand KYC
              details. Our team will verify your brand and enable outreach.
            </p>

            <form onSubmit={onSubmitBrandKyc}>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Full Name (Brand contact)
                </label>
                <input
                  value={bkFullName}
                  onChange={(e) => setBkFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #E5E7EB',
                  }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Brand / Company Name
                </label>
                <input
                  value={bkBrandName}
                  onChange={(e) => setBkBrandName(e.target.value)}
                  placeholder="Your brand or company"
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #E5E7EB',
                  }}
                />
              </div>

              <div className="stack-on-mobile" style={{ marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    GST Number
                  </label>
                  <input
                    value={bkGstNumber}
                    onChange={(e) => setBkGstNumber(e.target.value)}
                    placeholder="GSTIN"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    Company Email
                  </label>
                  <input
                    value={bkCompanyEmail}
                    onChange={(e) => setBkCompanyEmail(e.target.value)}
                    type="email"
                    placeholder="you@brand.com"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Company / ID Document (required)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setBkDocumentFile(e.target.files?.[0] || null)
                  }
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Authorized Person Selfie (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBkSelfieFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <button
                type="submit"
                disabled={bkSubmitting}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#111827',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: bkSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {bkSubmitting ? 'Submitting Brand KYC…' : 'Submit Brand KYC'}
              </button>

              {bkMsg && (
                <p style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
                  {bkMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
