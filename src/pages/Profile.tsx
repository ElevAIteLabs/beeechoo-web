// src/pages/Profile.tsx
import React, { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/auth';
import { Camera, Image, CheckCircle, ChevronDown } from 'lucide-react';

// 🛑 EXTENDED ME USER TYPE (Includes all necessary fields from /me response)
type MeUser = {
  id: string;
  phone: string;
  name?: string | null;
  brandName?: string | null;
  isHost: boolean;
  isCreator?: boolean;
  email?: string | null;
  city?: string | null;
  bio?: string | null;
  kycStatus?: 'pending' | 'verified' | 'rejected' | null;

  hostKycStatus?: 'pending' | 'verified' | 'rejected' | null;
  creatorKycStatus?: 'pending' | 'verified' | 'rejected' | null;

  // 🛑 NEW/EDITABLE FIELDS (Photo URLs, Socials, Category)
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
  category?: string | null;
};

type SponsorshipInterestDto = {
  id: string;
  tier: string;
  cost?: string | null;
  name: string;
  email: string;
  brandName?: string | null;
  city: string;
  createdAt: string;
  userPhone?: string | null;
  userProfileName?: string | null;
  userProfileBrandName?: string | null;
  userProfileCity?: string | null;
};

// Host's events including sponsorship interests
export type MyEvent = {
  approved: any;
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startAt: string;
  endAt?: string | null;
  status: 'scheduled' | 'cancelled' | 'completed';
  organizerId?: string | null;
  bannerUrl?: string | null;
  ticketLink?: string | null;
  categories?: string[];
  sponsorships?: any;
  sponsorshipInterests?: SponsorshipInterestDto[];
};
export type MyCampaign = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: 'live' | 'closed' | 'expired';
  expiresAt: string;
  imageUrl?: string | null;
  interestCount?: number;
  createdAt?: string;
};


// ✅ NEW: Studio DTO for host list
export type MyStudio = {
  id: string;
  title: string;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  pricingType?: 'hour' | 'day';
  price?: number | null;
  capacity?: number | null;
  categories?: string[];
  amenities?: string[];
  coverImageUrl?: string | null;

  approved: boolean;
  status: 'active' | 'inactive';
  ownerId?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

const API = import.meta.env.VITE_API_BASE as string;

// 🟢 IMAGE URL HELPER: Ensure relative paths are converted to absolute URLs
function toAbsoluteUrl(path?: string | null): string | null {
  if (!path || path.startsWith('http')) return path ?? null;
  if (path.startsWith('/uploads')) return `${API}${path}`;
  return `${API}/uploads/${path}`;
}

const theme = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  primary: '#F6B100',
  green: '#10B981',
  red: '#EF4444',
  slate: '#64748B',
  border: '#E5E7EB',
  shadow: '0 8px 32px rgba(0,0,0,0.08)',
  shadowHover: '0 12px 40px rgba(0,0,0,0.12)',
};

const surface: React.CSSProperties = {
  background: theme.card,
  borderRadius: 20,
  boxShadow: theme.shadow,
  border: `1px solid ${theme.border}`,
  transition: 'all 0.3s ease',
};

function Card(props: React.PropsWithChildren<{ style?: React.CSSProperties }>) {
  return <div style={{ ...surface, ...props.style }}>{props.children}</div>;
}
function CardHeader(props: React.PropsWithChildren<{ style?: React.CSSProperties }>) {
  return <div style={{ padding: '24px 24px 12px', ...props.style }}>{props.children}</div>;
}
function CardTitle(props: React.PropsWithChildren<{ small?: boolean }>) {
  return (
    <div style={{ fontWeight: 800, fontSize: props.small ? 14 : 18, color: theme.text, letterSpacing: '-0.02em' }}>
      {props.children}
    </div>
  );
}
function CardDescription(props: React.PropsWithChildren) {
  return <div style={{ color: theme.subtext, marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>{props.children}</div>;
}
function CardContent(props: React.PropsWithChildren) {
  return <div style={{ padding: '16px 24px 24px' }}>{props.children}</div>;
}

function Button(
  props: React.PropsWithChildren<{
    variant?: 'solid' | 'outline' | 'secondary';
    size?: 'sm' | 'md';
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    style?: React.CSSProperties;
  }>,
) {
  const { variant = 'solid', size = 'md', children, onClick, type, disabled, style } = props;
  const base: React.CSSProperties = {
    border: '1px solid transparent',
    borderRadius: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    padding: size === 'sm' ? '8px 14px' : '14px 20px',
    fontSize: size === 'sm' ? 12 : 14,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...style,
  };
  if (variant === 'solid') {
    base.background = theme.primary;
    base.color = '#000';
    base.boxShadow = '0 4px 12px rgba(246, 177, 0, 0.3)';
  } else if (variant === 'outline') {
    base.background = '#fff';
    base.color = theme.text;
    base.border = `1.5px solid ${theme.border}`;
  } else {
    base.background = '#F3F4F6';
    base.color = theme.text;
  }
  return (
    <button type={type} onClick={onClick} style={base} disabled={disabled}>
      {children}
    </button>
  );
}

/**
 * Helper to handle file upload to a specific endpoint
 */
async function uploadFile(file: File, endpoint: string, fileFieldName: string): Promise<string> {
  const token = getToken();
  if (!token) throw new Error('Sign in required for file upload.');

  const form = new FormData();
  form.append(fileFieldName, file);

  const r = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!r.ok) {
    const je = await r.json().catch(() => ({} as any));
    throw new Error(je?.error || `Failed to upload ${fileFieldName}`);
  }

  const data = await r.json();

  // Return the absolute URL returned by the server (avatarUrl or coverPhotoUrl)
  return data[fileFieldName + 'Url'] as string;
}

export default function Profile(): JSX.Element {
  const [me, setMe] = React.useState<MeUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [fileUploading, setFileUploading] = React.useState<'avatar' | 'cover' | null>(null);

  const [openEventId, setOpenEventId] = React.useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [campaignsLoading, setCampaignsLoading] = React.useState(false);
  const [myCampaigns, setMyCampaigns] = React.useState<MyCampaign[]>([]);

  const [myEvents, setMyEvents] = React.useState<MyEvent[]>([]);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);

  // ✅ Studios state
  const [studiosLoading, setStudiosLoading] = React.useState(false);
  const [myStudios, setMyStudios] = React.useState<MyStudio[]>([]);

  const [activeTab, setActiveTab] = React.useState<'host' | 'creator'>('host');
  const [hostSubTab, setHostSubTab] = React.useState<'events' | 'studios'>('events');

  const token = getToken();
  const nav = useNavigate();

  const fetchMe = React.useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error('Unauthorized');

      const { user } = (await r.json()) as { user: MeUser };

      const normalizedUser: MeUser = {
        ...user,
        avatarUrl: toAbsoluteUrl(user.avatarUrl),
        coverPhotoUrl: toAbsoluteUrl(user.coverPhotoUrl),
      };

      setMe(normalizedUser);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  React.useEffect(() => {
    if (!me?.id || !me.isHost) return;
    (async () => {
      try {
        setCampaignsLoading(true);
        const r = await fetch(`${API}/host/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!r.ok) throw new Error('Failed to load campaigns');
        const data = await r.json();

        const raw = (Array.isArray(data.data) ? data.data : data) as any[];

        const normalized: MyCampaign[] = raw.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? null,
          category: c.category,
          status: c.status,
          expiresAt: c.expiresAt,
          imageUrl: c.imageUrl ?? null,
          interestCount: c.interestCount ?? 0,
          createdAt: c.createdAt,
        }));

        setMyCampaigns(normalized);
      } catch (e) {
        console.error(e);
        setMyCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    })();
  }, [me?.id, me?.isHost, token]);


  // Fetch ONLY this host's events (with sponsorship interests)
  React.useEffect(() => {
    if (!me?.id || !me.isHost) return;
    (async () => {
      try {
        setEventsLoading(true);
        const r = await fetch(`${API}/host/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!r.ok) throw new Error('Failed to load events');
        const data = await r.json();
        const raw = (Array.isArray(data.data) ? data.data : data) as MyEvent[];

        const evs = raw.filter((ev) => ev.organizerId === me.id);

        setMyEvents(evs);
      } catch (e) {
        console.error(e);
        setMyEvents([]);
      } finally {
        setEventsLoading(false);
      }
    })();
  }, [me?.id, me?.isHost, token]);

  // ✅ Fetch ONLY this host's studios
  React.useEffect(() => {
    if (!me?.id || !me.isHost) return;
    (async () => {
      try {
        setStudiosLoading(true);
        const r = await fetch(`${API}/host/studios`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!r.ok) throw new Error('Failed to load studios');
        const data = await r.json();
        const raw = (Array.isArray(data.data) ? data.data : data) as MyStudio[];

        const sts = raw.filter((s) => s.ownerId === me.id);

        setMyStudios(sts);
      } catch (e) {
        console.error(e);
        setMyStudios([]);
      } finally {
        setStudiosLoading(false);
      }
    })();
  }, [me?.id, me?.isHost, token]);

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return alert('Sign in required');
    if (!me) return;

    try {
      setSaving(true);
      const isCreatorOrApplying =
        me.isCreator || me.creatorKycStatus === 'pending' || me.creatorKycStatus === 'rejected';

      const payload = {
        name: me.name || '',
        email: me.email || '',
        city: me.city || '',
        bio: me.bio || '',
        brandName: me.brandName || '',
        instagram: isCreatorOrApplying ? me.instagram || '' : undefined,
        facebook: isCreatorOrApplying ? me.facebook || '' : undefined,
        youtube: isCreatorOrApplying ? me.youtube || '' : undefined,
        whatsapp: isCreatorOrApplying ? me.whatsapp || '' : undefined,
        category: isCreatorOrApplying ? me.category || '' : undefined,
      };

      const r = await fetch(`${API}/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || 'Save failed');
      }
      await fetchMe();
      alert('Profile saved');
    } catch (err: any) {
      alert(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileUploading(type);
      const endpoint = type === 'avatar' ? '/me/avatar' : '/me/cover-photo';
      const fieldName = type === 'avatar' ? 'avatar' : 'coverPhoto';

      const newUrl = await uploadFile(file, endpoint, fieldName);

      setMe((prev) => {
        if (!prev) return prev;
        const newMe = { ...prev };
        if (type === 'avatar') newMe.avatarUrl = newUrl;
        else newMe.coverPhotoUrl = newUrl;
        return newMe;
      });

      alert(`${type === 'avatar' ? 'Profile photo' : 'Cover photo'} uploaded successfully!`);
    } catch (err: any) {
      alert(err?.message || `Failed to upload ${type === 'avatar' ? 'photo' : 'cover'}`);
    } finally {
      setFileUploading(null);
      e.target.value = '';
    }
  };

  async function updateEventStatus(
    evId: string,
    status: 'scheduled' | 'cancelled' | 'completed',
  ) {
    if (!token) {
      alert('Sign in required');
      return;
    }
    try {
      setStatusUpdatingId(evId);
      const r = await fetch(`${API}/events/${evId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update event status');
      }
      setMyEvents((prev) => prev.map((e) => (e.id === evId ? { ...e, status } : e)));
      alert(`Event marked as ${status}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  }

  // ✅ Single source of truth for host KYC/verified
  const hostKycStatus = me?.hostKycStatus ?? me?.kycStatus ?? null;
  const creatorKycStatus = me?.creatorKycStatus ?? null;

  const isCreatorOrApplying =
    me?.isCreator || creatorKycStatus === 'pending' || creatorKycStatus === 'rejected';

  const shouldShowCreatorProfileFields = isCreatorOrApplying && activeTab === 'creator';

  // ✅ Helper: should allow listing events/studios
  const isVerifiedHost = !!me?.isHost || hostKycStatus === 'verified';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24, padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: '-0.02em' }}>My Profile</div>
          <div style={{ color: theme.subtext, marginTop: 6, fontSize: 15 }}>
            Manage your details, host and creator status
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'inline-flex',
          borderRadius: 16,
          border: `1px solid ${theme.border}`,
          padding: 4,
          background: '#F9FAFB',
          width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <button
          onClick={() => setActiveTab('host')}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'host' ? theme.primary : 'transparent',
            color: activeTab === 'host' ? '#000' : theme.subtext,
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'host' ? '0 2px 8px rgba(246, 177, 0, 0.3)' : 'none',
          }}
        >
          Host
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'creator' ? theme.primary : 'transparent',
            color: activeTab === 'creator' ? '#000' : theme.subtext,
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'creator' ? '0 2px 8px rgba(246, 177, 0, 0.3)' : 'none',
          }}
        >
          Creator
        </button>
      </div>


      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'minmax(0,1fr)' }}>
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your basic information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div style={{ color: theme.subtext }}>Loading…</div>
            ) : !me ? (
              <div style={{ color: theme.subtext }}>Please sign in to view your profile.</div>
            ) : (
              <form onSubmit={onSave} style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
                {/* Avatar + cover */}
                {/* Avatar + cover */}
                <div className="stack-on-mobile" style={{ marginBottom: 10, width: '100%' }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0, width: 100, textAlign: 'center' }}>
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6,
                        backgroundImage: `url(${me.avatarUrl || ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: `2px solid ${theme.primary}`,
                        overflow: 'hidden',
                      }}
                    >
                      {!me.avatarUrl && <Camera size={32} color={theme.subtext} />}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ position: 'relative', overflow: 'hidden' }}
                      disabled={fileUploading === 'avatar'}
                    >
                      {fileUploading === 'avatar' ? 'Uploading...' : 'Change Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        disabled={fileUploading !== null}
                      />
                    </Button>
                    <div style={{ fontSize: 10, color: theme.subtext, marginTop: 4 }}>
                      Avatar (Public)
                    </div>
                  </div>

                  {/* Cover Photo (Creator only) */}
                  {shouldShowCreatorProfileFields && (
                    <div
                      style={{
                        flexGrow: 1,
                        minHeight: 120,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 120,
                          borderRadius: 10,
                          background: '#F3F4F6',
                          backgroundImage: `url(${me.coverPhotoUrl || ''})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${theme.border}`,
                          overflow: 'hidden',
                        }}
                      >
                        {!me.coverPhotoUrl && <Image size={32} color={theme.subtext} />}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ position: 'absolute', bottom: 10, right: 10, overflow: 'hidden' }}
                        disabled={fileUploading === 'cover'}
                      >
                        {fileUploading === 'cover' ? 'Uploading...' : 'Change Cover'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cover')}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          disabled={fileUploading !== null}
                        />
                      </Button>
                      <div
                        style={{
                          fontSize: 10,
                          color: theme.subtext,
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                        }}
                      >
                        Cover (Creator Profile Banner)
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                    Phone (read-only)
                  </div>
                  <input
                    disabled
                    value={me.phone}
                    style={{
                      width: '100%',
                      height: 42,
                      border: '1px solid #eee',
                      borderRadius: 10,
                      padding: '0 10px',
                      background: '#F9FAFB',
                    }}
                  />
                </div>

                {/* Name */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: theme.subtext }}>Name</div>
                    {isVerifiedHost && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'rgba(16,185,129,0.1)',
                          color: '#065f46',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle size={12} /> Verified (host)
                      </span>
                    )}
                  </div>

                  {(() => {
                    const isNameReadOnly = isVerifiedHost;
                    return (
                      <input
                        name="name"
                        value={me.name || ''}
                        disabled={isNameReadOnly || saving}
                        onChange={(e) =>
                          !isNameReadOnly &&
                          setMe((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                        }
                        placeholder="Your name"
                        style={{
                          width: '100%',
                          height: 42,
                          border: '1px solid #eee',
                          borderRadius: 10,
                          padding: '0 10px',
                          background: isNameReadOnly ? '#F9FAFB' : '#fff',
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Brand */}
                <div>
                  <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                    Brand / Company Name
                  </div>
                  <input
                    name="brandName"
                    value={me.brandName || ''}
                    disabled={saving}
                    onChange={(e) => setMe((prev) => (prev ? { ...prev, brandName: e.target.value } : prev))}
                    placeholder="Your brand or company name"
                    style={{
                      width: '100%',
                      height: 42,
                      border: '1px solid #eee',
                      borderRadius: 10,
                      padding: '0 10px',
                    }}
                  />
                </div>

                {/* Email + City + Category (creator only) */}
                <div
                  style={{
                    display: 'grid',
                    gap: 12,
                    gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Email</div>
                    <input
                      name="email"
                      type="email"
                      value={me.email || ''}
                      disabled={saving}
                      onChange={(e) => setMe((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                      placeholder="you@email.com"
                      style={{
                        width: '100%',
                        height: 42,
                        border: '1px solid #eee',
                        borderRadius: 10,
                        padding: '0 10px',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>City</div>
                    <input
                      name="city"
                      value={me.city || ''}
                      disabled={saving}
                      onChange={(e) => setMe((prev) => (prev ? { ...prev, city: e.target.value } : prev))}
                      placeholder="City"
                      style={{
                        width: '100%',
                        height: 42,
                        border: '1px solid #eee',
                        borderRadius: 10,
                        padding: '0 10px',
                      }}
                    />
                  </div>

                  {shouldShowCreatorProfileFields && (
                    <div>
                      <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Category</div>
                      <input
                        name="category"
                        value={me.category || ''}
                        disabled={saving}
                        onChange={(e) => setMe((prev) => (prev ? { ...prev, category: e.target.value } : prev))}
                        placeholder="E.g., Vlogger, Designer"
                        style={{
                          width: '100%',
                          height: 42,
                          border: '1px solid #eee',
                          borderRadius: 10,
                          padding: '0 10px',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Creator socials */}
                {shouldShowCreatorProfileFields && (
                  <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 8 }}>
                      Social Links
                    </div>
                    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                      <div>
                        <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                          Instagram URL/Handle
                        </div>
                        <input
                          name="instagram"
                          value={me.instagram || ''}
                          disabled={saving}
                          onChange={(e) =>
                            setMe((prev) => (prev ? { ...prev, instagram: e.target.value } : prev))
                          }
                          placeholder="https://instagram.com/handle"
                          style={{
                            width: '100%',
                            height: 42,
                            border: '1px solid #eee',
                            borderRadius: 10,
                            padding: '0 10px',
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Facebook URL</div>
                        <input
                          name="facebook"
                          value={me.facebook || ''}
                          disabled={saving}
                          onChange={(e) =>
                            setMe((prev) => (prev ? { ...prev, facebook: e.target.value } : prev))
                          }
                          placeholder="https://facebook.com/page"
                          style={{
                            width: '100%',
                            height: 42,
                            border: '1px solid #eee',
                            borderRadius: 10,
                            padding: '0 10px',
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                          YouTube Channel Link
                        </div>
                        <input
                          name="youtube"
                          value={me.youtube || ''}
                          disabled={saving}
                          onChange={(e) =>
                            setMe((prev) => (prev ? { ...prev, youtube: e.target.value } : prev))
                          }
                          placeholder="https://youtube.com/channel"
                          style={{
                            width: '100%',
                            height: 42,
                            border: '1px solid #eee',
                            borderRadius: 10,
                            padding: '0 10px',
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                          WhatsApp Number (public contact)
                        </div>
                        <input
                          name="whatsapp"
                          value={me.whatsapp || ''}
                          disabled={saving}
                          onChange={(e) =>
                            setMe((prev) => (prev ? { ...prev, whatsapp: e.target.value } : prev))
                          }
                          placeholder="+1234567890"
                          style={{
                            width: '100%',
                            height: 42,
                            border: '1px solid #eee',
                            borderRadius: 10,
                            padding: '0 10px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Bio</div>
                  <textarea
                    name="bio"
                    value={me.bio || ''}
                    disabled={saving}
                    onChange={(e) => setMe((prev) => (prev ? { ...prev, bio: e.target.value } : prev))}
                    rows={4}
                    placeholder="Tell us a bit about you"
                    style={{
                      width: '100%',
                      border: '1px solid #eee',
                      borderRadius: 10,
                      padding: 10,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* HOST TAB */}
        {me && activeTab === 'host' && (
          <Card>
            <CardHeader>
              <CardTitle>Host</CardTitle>
              <CardDescription>Manage your host access, events and studios</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Host status / CTA */}
              <div style={{ marginBottom: 16 }}>
                {isVerifiedHost ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: 'rgba(16,185,129,0.08)',
                      color: '#065f46',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ✅ You are a verified host.
                  </div>
                ) : hostKycStatus === 'pending' ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ⏳ Host KYC submitted. We are reviewing your details.
                  </div>
                ) : hostKycStatus === 'rejected' ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ❌ Host KYC rejected. Please correct details and resubmit.
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 8 }}>
                    You’re not a host yet. Submit your host KYC to create events or list studios.
                  </div>
                )}

                {!isVerifiedHost && (
                  <Button variant="outline" type="button" onClick={() => nav('/become-host')}>
                    {hostKycStatus ? 'View / Resubmit Host KYC' : 'Become a host'}
                  </Button>
                )}
              </div>

              {/* Events/Studios Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  padding: 4,
                  background: '#F9FAFB',
                  width: 'fit-content',
                  marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => setHostSubTab('events')}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: hostSubTab === 'events' ? theme.primary : 'transparent',
                    color: hostSubTab === 'events' ? '#000' : theme.subtext,
                    transition: 'all 0.2s ease',
                    boxShadow: hostSubTab === 'events' ? '0 2px 8px rgba(246, 177, 0, 0.3)' : 'none',
                  }}
                >
                  Events
                </button>
                <button
                  onClick={() => setHostSubTab('studios')}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: hostSubTab === 'studios' ? theme.primary : 'transparent',
                    color: hostSubTab === 'studios' ? '#000' : theme.subtext,
                    transition: 'all 0.2s ease',
                    boxShadow: hostSubTab === 'studios' ? '0 2px 8px rgba(246, 177, 0, 0.3)' : 'none',
                  }}
                >
                  Studios
                </button>
              </div>

              {/* My Events */}
              {hostSubTab === 'events' && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: theme.text }}>
                    My Events
                    <Button
                      variant="solid"
                      size="sm"
                      style={{ float: 'right' }}
                      onClick={() => {
                        if (!isVerifiedHost) {
                          alert('You must be a verified host to create events.');
                          nav('/become-host');
                          return;
                        }
                        nav('/events/new');
                      }}
                    >
                      + Create New Event
                    </Button>
                  </div>

                  {isVerifiedHost ? (
                    eventsLoading ? (
                      <div style={{ color: theme.subtext }}>Loading your events…</div>
                    ) : myEvents.length === 0 ? (
                      <div style={{ color: theme.subtext }}>No events found. Create your first event!</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {myEvents.map((ev) => {
                          const dateStr = new Date(ev.startAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          const statusColor =
                            ev.status === 'cancelled'
                              ? theme.red
                              : ev.status === 'completed'
                                ? theme.slate
                                : theme.green;

                          const interestCount = ev.sponsorshipInterests?.length || 0;
                          const isOpen = openEventId === ev.id;

                          return (
                            <div
                              key={ev.id}
                              style={{
                                borderRadius: 16,
                                border: `1px solid ${theme.border}`,
                                padding: 16,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                background: '#FAFAFA',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenEventId(isOpen ? null : ev.id)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: 6,
                                  display: 'flex',
                                  width: '100%',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    flex: 1,
                                    minWidth: 0,
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: theme.text,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {ev.title}
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 13,
                                      color: theme.subtext,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {dateStr}
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: statusColor,
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    Status: {ev.status}
                                  </div>

                                  <div style={{ fontSize: 12, color: theme.subtext }}>
                                    {ev.approved ? '✅ Approved' : '⏳ Pending approval'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {interestCount > 0 && (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        padding: '2px 8px',
                                        borderRadius: 999,
                                        background: '#FFF7ED',
                                        color: '#9A3412',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {interestCount} sponsor{interestCount > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  <ChevronDown
                                    size={18}
                                    style={{
                                      transition: 'transform 0.2s ease',
                                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                      color: theme.subtext,
                                    }}
                                  />
                                </div>
                              </button>

                              {isOpen && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    paddingTop: 6,
                                    borderTop: `1px dashed ${theme.border}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                  }}
                                >
                                  {/* status buttons */}
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={statusUpdatingId === ev.id || ev.status === 'scheduled'}
                                      onClick={() => updateEventStatus(ev.id, 'scheduled')}
                                    >
                                      {statusUpdatingId === ev.id ? 'Updating…' : 'Mark Scheduled'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={statusUpdatingId === ev.id || ev.status === 'completed'}
                                      onClick={() => updateEventStatus(ev.id, 'completed')}
                                    >
                                      {statusUpdatingId === ev.id ? 'Updating…' : 'Mark Completed'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={statusUpdatingId === ev.id || ev.status === 'cancelled'}
                                      onClick={() => updateEventStatus(ev.id, 'cancelled')}
                                    >
                                      {statusUpdatingId === ev.id ? 'Updating…' : 'Cancel Event'}
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => nav('/events/new', { state: { event: ev } })}
                                    >
                                      Manage
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <div style={{ color: theme.subtext }}>Become a verified host to start creating events.</div>
                  )}
                </div>
              )}

              {/* ✅ My Studios */}
              {hostSubTab === 'studios' && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: theme.text }}>
                    My Studios
                    <Button
                      variant="solid"
                      size="sm"
                      style={{ float: 'right' }}
                      onClick={() => {
                        if (!isVerifiedHost) {
                          alert('You must be a verified host to list a studio.');
                          nav('/become-host');
                          return;
                        }
                        nav('/studios/new');
                      }}
                    >
                      + List Studio
                    </Button>
                  </div>

                  {isVerifiedHost ? (
                    studiosLoading ? (
                      <div style={{ color: theme.subtext }}>Loading your studios…</div>
                    ) : myStudios.length === 0 ? (
                      <div style={{ color: theme.subtext }}>No studios found. List your first studio!</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {myStudios.map((s) => (
                          <div
                            key={s.id}
                            style={{
                              borderRadius: 16,
                              border: `1px solid ${theme.border}`,
                              padding: 16,
                              background: '#FAFAFA',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 16,
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: theme.text,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {s.title}
                              </div>
                              <div style={{ fontSize: 12, color: theme.subtext }}>
                                {s.city || '—'} • {s.status} • {s.approved ? '✅ Approved' : '⏳ Pending approval'}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => nav('/studios/new', { state: { studio: s } })}
                            >
                              Manage
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ color: theme.subtext }}>Become a verified host to list studios.</div>
                  )}
                </div>
              )}
              {/* ✅ My Campaigns */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: theme.text }}>
                  My Campaigns
                  <Button
                    variant="solid"
                    size="sm"
                    style={{ float: 'right' }}
                    onClick={() => {
                      if (!isVerifiedHost) {
                        alert('You must be a verified host to create campaigns.');
                        nav('/become-host');
                        return;
                      }
                      nav('/host/campaigns/new'); // ✅ your create campaign page route
                    }}
                  >
                    + Add New Campaign
                  </Button>
                </div>

                {isVerifiedHost ? (
                  campaignsLoading ? (
                    <div style={{ color: theme.subtext }}>Loading your campaigns…</div>
                  ) : myCampaigns.length === 0 ? (
                    <div style={{ color: theme.subtext }}>No campaigns yet. Create your first campaign!</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {myCampaigns.map((c) => {
                        const exp = new Date(c.expiresAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        const statusColor =
                          c.status === 'closed' ? theme.red : c.status === 'expired' ? theme.slate : theme.green;

                        const interested = c.interestCount || 0;

                        return (
                          <div
                            key={c.id}
                            style={{
                              borderRadius: 10,
                              border: `1px solid ${theme.border}`,
                              padding: 10,
                              background: '#F9FAFB',
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 10,
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: theme.text,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {c.title}
                              </div>

                              <div style={{ fontSize: 12, color: theme.subtext }}>
                                Category: <b>{c.category}</b> • Expires: {exp}
                              </div>

                              <div style={{ fontSize: 12, fontWeight: 700, color: statusColor, marginTop: 4 }}>
                                Status: {c.status}
                              </div>

                              {interested > 0 && (
                                <div style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>
                                  {interested} interested
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => nav('/host/campaigns/new', { state: { campaign: c } })}
                              >
                                Manage
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div style={{ color: theme.subtext }}>Become a verified host to create campaigns.</div>
                )}
              </div>

            </CardContent>
          </Card>
        )}

        {/* CREATOR TAB */}
        {me && activeTab === 'creator' && (
          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
              <CardDescription>Apply as a creator and manage your creator status</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: 16 }}>
                {me.isCreator ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: 'rgba(16,185,129,0.08)',
                      color: '#065f46',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ✅ You are a verified creator.
                  </div>
                ) : creatorKycStatus === 'pending' ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ⏳ Creator KYC submitted. We are reviewing your details.
                  </div>
                ) : creatorKycStatus === 'rejected' ? (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    ❌ Creator KYC rejected. Please correct details and resubmit.
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 8 }}>
                    You’re not a creator yet. Submit your creator KYC to join campaigns and programs.
                  </div>
                )}

                {!me.isCreator && (
                  <Button variant="outline" type="button" onClick={() => nav('/become-creator')}>
                    {creatorKycStatus ? 'View / Resubmit Creator KYC' : 'Become a creator'}
                  </Button>
                )}
              </div>

              {me.isCreator && (
                <div style={{ fontSize: 13, color: theme.subtext }}>
                  Creator dashboards, earnings, and campaign management can be added here later.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
