import React, { type JSX } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { listEvents } from '../lib/events';
import { theme } from '../theme';
import { getToken } from '../lib/auth';
import { Calendar, MapPin, Ticket, Send } from 'lucide-react'; // Removed ArrowRight
import { Footer } from '../components/Footer';

/** ------------------------- Banner helpers ------------------------- **/
const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  'https://api.beeechoo.com';

function normalizeBannerPath(raw?: string | null): string | null {
  if (!raw) return null;
  const p = raw.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p; // already absolute

  const path = p.startsWith('/') ? p : `/${p}`;
  return `${API_BASE}${path}`;
}

function primaryBannerSrc(e: { bannerUrl?: string | null; banner?: string | null }) {
  return normalizeBannerPath(e.bannerUrl) ?? normalizeBannerPath(e.banner) ?? null;
}

// Increased height to 400px
function BannerImg({
  event,
}: {
  event: { title: string; bannerUrl?: string | null; banner?: string | null };
}) {
  const [src, setSrc] = React.useState<string | null>(() => primaryBannerSrc(event));

  React.useEffect(() => {
    setSrc(primaryBannerSrc(event));
  }, [event.bannerUrl, event.banner]);

  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg,#222,#333)',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={event.title}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={() => setSrc(null)}
    />
  );
}

/** ---------------------------- Types ---------------------------- **/

type SponsorshipTier = {
  tier: string;
  description?: string | null;
  cost?: string | number | null;
  price?: string | number | null;
  amount?: string | number | null;
};

type EventDto = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  banner?: string | null;
  bannerUrl?: string | null;
  categories: string[];
  ticketLink?: string;
  sponsorships?: SponsorshipTier[] | null;
};

type MeProfile = {
  id?: string; // ⬅️ we now track user id
  name?: string | null;
  email?: string | null;
  brandName?: string | null;
  city?: string | null;
};

/** helper for localStorage key (per user + per event) */
function interestStorageKey(eventId: string, userId?: string | null) {
  const uid = userId && String(userId).trim() ? String(userId).trim() : 'anon';
  return `sponsorshipInterest:${uid}:${eventId}`;
}

export default function EventDetails(): JSX.Element {
  const { id } = useParams();
  const location = useLocation() as any;
  const initialEvent = (location?.state?.event as EventDto | undefined) || null;

  const [event, setEvent] = React.useState<EventDto | null>(initialEvent);
  const [loading, setLoading] = React.useState(!initialEvent);
  const [error, setError] = React.useState<string | null>(null);

  // profile (for pre-fill / auto send)
  const [profile, setProfile] = React.useState<MeProfile | null>(null);

  // full sponsorship interest popup state (for incomplete profile)
  const [interestOpen, setInterestOpen] = React.useState(false);
  const [interestTier, setInterestTier] = React.useState<SponsorshipTier | null>(null);
  const [interestForm, setInterestForm] = React.useState({
    name: '',
    email: '',
    brandName: '',
    city: '',
  });

  // brand-only popup (when only brandName missing)
  const [brandPromptOpen, setBrandPromptOpen] = React.useState(false);
  const [brandDraft, setBrandDraft] = React.useState('');

  const [interestSubmitting, setInterestSubmitting] = React.useState(false);
  const [sentTiers, setSentTiers] = React.useState<string[]>([]);

  /* ---------- load event ---------- */
  React.useEffect(() => {
    if (initialEvent) return;
    (async () => {
      try {
        const res = await listEvents(100);
        const found =
          (res?.data as EventDto[]).find((e) => String(e.id) === String(id)) ||
          null;
        if (!found) throw new Error('Event not found');
        setEvent(found);
      } catch (e: any) {
        console.error(e);
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, initialEvent]);

  /* ---------- load profile once (for prefill / auto-send) ---------- */
  React.useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const data = await r.json();
        const user = (data?.user || data) as any;
        setProfile({
          id: user.id, // ⬅️ capture id
          name: user.name ?? '',
          email: user.email ?? '',
          brandName: user.brandName ?? '',
          city: user.city ?? '',
        });
      } catch (err) {
        console.warn('Failed to load profile for sponsorship prefill', err);
      }
    })();
  }, []);

  /* ---------- restore "interest sent" from localStorage (per user) ---------- */
  React.useEffect(() => {
    if (!event?.id) return;
    const userId = profile?.id ?? null;
    try {
      const stored = localStorage.getItem(interestStorageKey(event.id, userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSentTiers(parsed.map((v) => v.toString()));
        }
      }
    } catch (err) {
      console.warn('Failed to read stored interests', err);
    }
  }, [event?.id, profile?.id]); // rerun when user changes

  if (loading)
    return <div style={{ padding: 24, color: theme.colors.subtext }}>Loading…</div>;
  if (error || !event)
    return (
      <div style={{ padding: 24, color: theme.colors.danger }}>
        {error || 'Not found.'}
      </div>
    );

  const dateStr = new Date(event.startAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasSponsorships =
    Array.isArray(event.sponsorships) && event.sponsorships.length > 0;

  function getCostRaw(s: SponsorshipTier) {
    return s.cost ?? s.price ?? s.amount ?? null;
  }

  function getCostDisplay(s: SponsorshipTier) {
    const raw = getCostRaw(s);
    if (raw == null || raw === '') return null;
    // Format as currency or simply string
    if (typeof raw === 'number' || (typeof raw === 'string' && /^\d+(\.\d+)?$/.test(raw.toString()))) {
      return raw.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return raw.toString().replace(/[^0-9.,]/g, '');
  }

  /* ---------- core send logic (used by auto + popup) ---------- */
  async function sendInterest(
    values: { name: string; email: string; brandName?: string; city: string },
    tier: SponsorshipTier
  ) {
    if (!event) return;

    const token = getToken();
    if (!token) {
      alert('Please sign in to send sponsorship interest.');
      return;
    }

    const { name, email, brandName, city } = values;
    if (!name.trim() || !email.trim() || !city.trim()) {
      alert('Please fill in name, email, and city.');
      return;
    }

    try {
      setInterestSubmitting(true);

      const payload = {
        eventId: event.id,
        tier: tier.tier,
        cost: getCostRaw(tier),
        name: name.trim(),
        email: email.trim(),
        brandName: brandName?.trim() || undefined, // optional
        city: city.trim(),
      };

      const r = await fetch(
        `${API_BASE}/events/${event.id}/sponsorship-interest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!r.ok) {
        const eJson = await r.json().catch(() => ({} as any));
        throw new Error(eJson?.error || 'Failed to send sponsorship interest');
      }

      const tierKey = tier.tier || String(tier.tier ?? '');
      setSentTiers((prev) => {
        const next = prev.includes(tierKey) ? prev : [...prev, tierKey];

        // ⬅️ persist per user + per event
        try {
          const userId = profile?.id ?? null;
          localStorage.setItem(interestStorageKey(event.id, userId), JSON.stringify(next));
        } catch (err) {
          console.warn('Failed to persist interest tiers', err);
        }

        return next;
      });

      alert('Sent your interest. Thank you, the organizer will contact you soon.');
      // close both modals if any open
      setInterestOpen(false);
      setBrandPromptOpen(false);
      setInterestTier(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to send interest');
    } finally {
      setInterestSubmitting(false);
    }
  }

  /* ---------- click handler for "I'm Interested" ---------- */
  function handleInterestClick(tier: SponsorshipTier) {
    // If profile has all required fields
    if (profile && profile.name && profile.email && profile.city) {
      // If brand already saved → send directly
      if (profile.brandName && profile.brandName.trim()) {
        void sendInterest(
          {
            name: profile.name,
            email: profile.email,
            brandName: profile.brandName,
            city: profile.city,
          },
          tier
        );
        return;
      }

      // Brand name missing → show brand-only popup, brand is optional
      setInterestTier(tier);
      setBrandDraft('');
      setBrandPromptOpen(true);
      return;
    }

    // Otherwise need full details → open full popup with whatever we know
    setInterestTier(tier);
    setInterestForm((prev) => ({
      name: profile?.name?.toString() || prev.name,
      email: profile?.email?.toString() || prev.email,
      brandName: profile?.brandName?.toString() || prev.brandName,
      city: profile?.city?.toString() || prev.city,
    }));
    setInterestOpen(true);
  }

  function closeInterestPopup() {
    setInterestOpen(false);
    setInterestTier(null);
  }

  /* ---------- Full popup submit (also save brandName to user if needed) ---------- */
  async function handleInterestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interestTier) return;

    // if user provided a brandName and we don't have one stored yet → save to /me
    if (
      interestForm.brandName.trim() &&
      (!profile || !profile.brandName || !profile.brandName.trim())
    ) {
      const token = getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ brandName: interestForm.brandName.trim() }),
          });
          setProfile((prev) =>
            prev
              ? { ...prev, brandName: interestForm.brandName.trim() }
              : { brandName: interestForm.brandName.trim() }
          );
        } catch (err) {
          console.warn('Failed to save brandName from full popup, continuing anyway', err);
        }
      }
    }

    await sendInterest(
      {
        name: interestForm.name,
        email: interestForm.email,
        brandName: interestForm.brandName,
        city: interestForm.city,
      },
      interestTier
    );
  }

  /* ---------- Brand-only popup “Save & send” / “Send without brand” ---------- */
  async function handleBrandSaveAndSend(saveBrand: boolean) {
    if (!interestTier || !profile || !profile.name || !profile.email || !profile.city) return;

    const brandNameToSend = saveBrand ? brandDraft.trim() : '';

    // optionally save brand to profile
    if (saveBrand && brandNameToSend) {
      const token = getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ brandName: brandNameToSend }),
          });
          setProfile((prev) =>
            prev ? { ...prev, brandName: brandNameToSend } : prev
          );
        } catch (err) {
          console.warn('Failed to save brandName, continuing anyway', err);
        }
      }
    }

    await sendInterest(
      {
        name: profile.name,
        email: profile.email,
        brandName: brandNameToSend,
        city: profile.city,
      },
      interestTier
    );
  }

  // Custom split function for descriptions
  const getDescriptionsAsList = (description?: string | null) => {
    if (!description) return [];
    return description.split(',').map(d => d.trim()).filter(d => d.length > 0);
  };

  // Custom split function for location (assuming venue, address)
  // Note: We use the full location string for address if split fails or only one part exists
  const locationParts = event.location?.split(/,\s?/, 2) || [];
  const venueName = locationParts[0];
  const venueAddress = locationParts[1];

  return (
    <div className="ed-wrap">
      {/* Hero */}
      <div className="ed-hero">
        <BannerImg
          event={{
            title: event.title,
            bannerUrl: event.bannerUrl ?? null,
            banner: event.banner ?? null,
          }}
        // height prop removed, controlled by CSS wrapper
        />
      </div>

      {/* Repositioned Details Header */}
      <div className="ed-header">
        <div className="ed-headerContent">
          <div className="ed-tags">
            {(event.categories || []).slice(0, 2).map((c) => (
              <span key={c} className="ed-tag">
                {c}
              </span>
            ))}
          </div>
          <h1 className="ed-title">{event.title}</h1>
          <div className="ed-heroMeta">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} strokeWidth={1.8} /> {dateStr}
            </span>
            {event.location && (
              <>
                <span className="ed-metaVenue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} strokeWidth={1.8} />
                  {/* Venue Name on one line */}
                  {venueName}
                </span>
                {venueAddress && (
                  <span className="ed-metaAddress">
                    **{venueAddress}**
                  </span>
                )}
                {/* Fallback for single line location string that isn't split */}
                {/* {!venueAddress && event.location && locationParts.length === 1 && (
                    <span className="ed-metaAddress">
                        **{event.location}**
                    </span>
                )} */}
              </>
            )}
          </div>

          {/* Ticket Button - Oval Style */}
          <div className="ed-ticketButtonWrapper">
            {event.ticketLink ? (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noreferrer"
                className="ed-buyBtn ed-buyBtn--primary"
              >
                <Ticket size={16} style={{ marginRight: 8 }} /> Buy Ticket Now
              </a>
            ) : (
              <button disabled className="ed-buyBtn ed-buyBtn--disabled">
                <Ticket size={16} style={{ marginRight: 8 }} /> Tickets Unavailable
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ed-grid">
        <div className="ed-left">
          {/* About Section - FULL WIDTH */}
          <section className="ed-card ed-aboutSection">
            <h3 className="ed-h3">About This Event</h3>
            <p className="ed-p">
              {event.description || 'Details to be announced soon.'}
            </p>
          </section>

          {/* Sponsorship Section */}
          {hasSponsorships && (
            <section className="ed-card ed-sponsorSection">
              <h3 className="ed-h3">Sponsorship Opportunities</h3>
              <div className="ed-sponsorGrid">
                {event.sponsorships!.map((s, i) => {
                  const costDisplay = getCostDisplay(s);
                  const tierKey = s.tier || String(i);
                  const alreadySent = sentTiers.includes(tierKey);
                  const descriptions = getDescriptionsAsList(s.description);

                  return (
                    <div key={i} className="ed-sponsorCard">
                      <div className="ed-sponsorCardContent">
                        <div className="ed-sponsorText">
                          <div className="ed-sponsorTier">{s.tier}</div>

                          {/* Description as Yellow Bullet Points */}
                          {descriptions.length > 0 && (
                            <ul className="ed-sponsorDescList">
                              {descriptions.map((desc, index) => (
                                <li key={index}>
                                  <span className="ed-bulletPoint" />
                                  {desc}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Price moved above the button, made more prominent */}
                      {costDisplay && (
                        <div className="ed-sponsorCostWrapper">
                          <div className="ed-sponsorCost">
                            ₹{costDisplay}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="ed-sponsorBtn ed-sponsorCardBtn"
                        disabled={alreadySent}
                        onClick={() => handleInterestClick(s)}
                      >
                        {alreadySent ? <Send size={14} style={{ marginRight: 4 }} /> : ''}
                        {alreadySent ? 'Interest Sent' : 'I’m Interested'}
                      </button>
                    </div>
                  );
                })}
              </div>

            </section>

          )}

        </div>

        {/* The right aside is now just a placeholder and hidden on desktop */}
        <aside className="ed-right">
        </aside>
      </div>

      {/* Full Interest Popup (for incomplete profile) */}
      {interestOpen && (
        <div className="ed-modalOverlay">
          <div className="ed-modal">
            <div className="ed-modalHeader">
              <div className="ed-modalTitle">Sponsorship Interest</div>
              {interestTier && (
                <div className="ed-modalSubtitle">
                  {event.title} • {interestTier.tier}
                </div>
              )}
            </div>
            <form onSubmit={handleInterestSubmit} className="ed-modalBody">
              <div className="ed-field">
                <label>Name *</label>
                <input
                  value={interestForm.name}
                  onChange={(e) =>
                    setInterestForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="ed-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={interestForm.email}
                  onChange={(e) =>
                    setInterestForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@email.com"
                  required
                />
              </div>
              <div className="ed-field">
                <label>Brand / Company (optional)</label>
                <input
                  value={interestForm.brandName}
                  onChange={(e) =>
                    setInterestForm((f) => ({ ...f, brandName: e.target.value }))
                  }
                  placeholder="Your brand or company name"
                />
              </div>
              <div className="ed-field">
                <label>City *</label>
                <input
                  value={interestForm.city}
                  onChange={(e) =>
                    setInterestForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="City"
                  required
                />
              </div>

              <div className="ed-modalActions">
                <button
                  type="button"
                  className="ed-modalBtn ed-modalBtn--ghost"
                  onClick={closeInterestPopup}
                  disabled={interestSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ed-modalBtn ed-modalBtn--primary"
                  disabled={interestSubmitting}
                >
                  {interestSubmitting ? 'Sending…' : 'Send Interest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand-only popup (when only brand is missing) */}
      {brandPromptOpen && interestTier && profile && (
        <div className="ed-modalOverlay">
          <div className="ed-modal">
            <div className="ed-modalHeader">
              <div className="ed-modalTitle">Brand / Company (Optional)</div>
              <div className="ed-modalSubtitle">
                You’ve already saved your name, email and city. You can optionally add a brand or
                agency name, or just send your interest.
              </div>
              <div className="ed-modalSubtitle">
                {event.title} • {interestTier.tier}
              </div>
            </div>
            <div className="ed-modalBody">
              <div className="ed-field">
                <label>Brand / Company (optional)</label>
                <input
                  value={brandDraft}
                  onChange={(e) => setBrandDraft(e.target.value)}
                  placeholder="Your brand or company name"
                />
              </div>

              <div className="ed-modalActions">
                <button
                  type="button"
                  className="ed-modalBtn ed-modalBtn--ghost"
                  disabled={interestSubmitting}
                  onClick={() => handleBrandSaveAndSend(false)}
                >
                  Send without brand
                </button>
                <button
                  type="button"
                  className="ed-modalBtn ed-modalBtn--primary"
                  disabled={interestSubmitting}
                  onClick={() => handleBrandSaveAndSend(true)}
                >
                  {interestSubmitting ? 'Sending…' : 'Save & send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .ed-wrap { min-height: 100vh; background: ${theme.colors.bg}; }
        
        /* Banner/Hero area with increased height and max-width/margins *//* Banner / Hero — StudioDetails-style responsive main image */
.ed-hero {
  position: relative;
  width: 100%;
  height: 480px;               /* ✅ like StudioDetails main image */
  border-radius: 16px;          /* ✅ desktop rounded */
  overflow: hidden;
  background: #111;

  max-width: 1120px;
  margin: 0 auto 12px;          /* small spacing under image */
}

/* tablet */
@media (max-width: 1024px) {
  .ed-hero {
    height: 360px;
  }
}

/* mobile */
@media (max-width: 768px) {
  .ed-hero {
    height: 260px;              /* ✅ mobile height similar behavior */
    border-radius: 0;           /* ✅ edge-to-edge like StudioDetails on phone */
    max-width: 100%;
    margin: 0;                  /* ✅ flush edges */
  }
}

/* ensure image covers */
.ed-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

        
        /* New Header Section for Details (was in overlay) */
        .ed-header {
          padding: 16px; 
          max-width: 1120px; 
          margin: 0 auto;
          text-align: center; /* Center the content */
        }
        .ed-headerContent {
          background: #fff;
          border-radius: 12px;
          box-shadow: ${theme.shadow.card};
          padding: 24px;
          margin-top: -30px; /* Overlap with banner a bit */
          position: relative;
          z-index: 10;
          border: 1px solid rgba(0,0,0,0.08);
        }

        @media (max-width: 768px) {
          .ed-headerContent {
             padding: 16px;
             margin-top: -20px;
          }
        }

        .ed-tags { display: flex; gap: 8px; margin-bottom: 12px; justify-content: center; }
        .ed-tag { background: #F6B100; color: #111827; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        
        .ed-title { 
            font-size: 42px; /* Increased size for impact */
            line-height: 1.1; 
            margin: 6px 0 16px; /* Added slight vertical spacing */
            color: #111827;
            text-transform: capitalize; 
            /* Professional font stack: Use a classic serif for elegance and readability */
            font-family: 'Caudex', serif !important; 
            font-weight: 700; /* Ensure it's bold */
        }

        @media (max-width: 768px) {
          .ed-title {
            font-size: 28px;
          }
        }
        
        /* Venue/Date Meta Data */
        .ed-heroMeta { 
          color: #6B7280; 
          display: flex; 
          gap: 10px; 
          flex-wrap: wrap; 
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px; 
          border-bottom: 1px dashed rgba(0,0,0,0.1); 
          padding-bottom: 20px;
          flex-direction: column; /* Stack date/time and venue/address vertically */
          align-items: center;
        }
        .ed-heroMeta > span {
            margin-bottom: 4px; /* space between venue/date/address */
        }
        .ed-metaVenue {
            font-weight: 700;
        }
        .ed-metaAddress {
            color: #111827;
            font-size: 14px;
        }


        /* MAIN GRID - remains 1 column (full width) */
        .ed-grid { 
            display: grid; 
            gap: 16px; 
            grid-template-columns: 1fr; /* Default: 1 column */
            padding: 0 16px 16px; 
            max-width: 1120px; 
            margin: 0 auto; 
        }
        @media (min-width: 960px) {
            .ed-grid { 
                grid-template-columns: 1fr; 
                padding: 0 24px 24px; 
                gap: 24px; 
            }
            .ed-left { 
                grid-column: 1 / -1; 
            }
            .ed-right {
                display: none; 
            }
        }
        
        .ed-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          box-shadow: ${theme.shadow.card};
          padding: 16px;
          margin-bottom: 16px; 
        }
        .ed-left .ed-card:last-child {
            margin-bottom: 0;
        }
        
        .ed-h3 { font-size: 16px; font-weight: 800; margin: 0 0 10px; color: #111827; }
        .ed-p { color: ${theme.colors.subtext}; line-height: 1.6; }


        /* --- Ticket Button Styles (Oval shape) --- */
        .ed-ticketButtonWrapper {
            max-width: 320px;
            margin: 0 auto;
            text-align: center;
        }
        
        .ed-buyBtn {
          display: flex; align-items: center; justify-content: center;
          height: 50px; 
          width: 100%; 
          border-radius: 999px; /* Oval shape */
          font-weight: 800; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          font-size: 16px;
          text-decoration: none;
        }
        
        .ed-buyBtn--primary {
            background: #F6B100; 
            color: #111827;
            box-shadow: 0 4px 10px rgba(246, 177, 0, 0.4);
        }
        .ed-buyBtn--primary:hover {
            background: #e5a400;
        }
        
        .ed-buyBtn--disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
            background: #e5e7eb;
            color: #6b7280;
            box-shadow: none;
        }

        .ed-status { 
            margin-top: 10px; 
            font-size: 13px; 
            font-weight: 700; 
            text-transform: capitalize; 
            padding: 8px 0;
            color: #6B7280;
        }
        .ed-status--cancelled { color: ${theme.colors.danger}; }
        .ed-status--scheduled { color: ${theme.colors.success}; }
        .ed-status--completed { color: #6B7280; }

        /* --- Sponsorship Grid Restyle --- */
        .ed-sponsorGrid { 
            display: grid; 
            grid-template-columns: repeat(1, 1fr); 
            gap: 16px; 
            margin-top: 16px; 
        }
        @media (min-width: 600px) {
            .ed-sponsorGrid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
            .ed-sponsorGrid { grid-template-columns: repeat(3, 1fr); }
        }

        .ed-sponsorCard {
            border-radius: 12px;
            border: 2px solid ${theme.colors.border || '#E5E7EB'};
            background: #f9fafb; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 200px; 
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .ed-sponsorCard:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }

        .ed-sponsorCardContent {
            padding: 16px;
            flex-grow: 1; /* Pushes price/button to the bottom */
        }

        .ed-sponsorTier { 
            font-weight: 800; 
            color: #111827; 
            font-size: 18px; 
            margin-bottom: 10px;
        }
        
        /* New list style for descriptions */
        .ed-sponsorDescList {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 13px;
            color: ${theme.colors.subtext};
        }
        .ed-sponsorDescList li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 4px;
            text-transform: capitalize; /* Apply Title Case to list items */
        }
        
        /* Yellow Dot Bullet Point */
        .ed-bulletPoint {
            width: 6px;
            height: 6px;
            background: #F6B100;
            border-radius: 50%;
            margin: 7px 8px 0 0; /* Align vertically with text baseline */
            flex-shrink: 0;
        }


        /* Price Wrapper: Placed above button */
        .ed-sponsorCostWrapper {
            padding: 0 16px 12px;
            text-align: center;
        }
        .ed-sponsorCost { 
            font-weight: 900; /* Extra bold */
            color: #F6B100; /* Yellow */
            font-size: 20px; 
            margin: 0;
        }

        .ed-sponsorCardBtn {
            width: 100%;
            height: 42px;
            border-radius: 0 0 10px 10px; 
            border-top: 1px solid #E5E7EB;
            background: #F6B100;
            color: #111827;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
        }
        .ed-sponsorCardBtn:not(:disabled):hover {
            background: #e5a400;
            opacity: 1;
        }
        .ed-sponsorCardBtn:disabled {
            background: #e5e7eb;
            color: #6B7280;
            opacity: 1;
        }

        /* Modal styles (kept original) */
        .ed-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
        }
        .ed-modal {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 18px 45px rgba(15,23,42,0.35);
          width: 100%;
          max-width: 420px;
          padding: 18px 18px 16px;
        }
        .ed-modalHeader {
          margin-bottom: 10px;
        }
        .ed-modalTitle {
          font-weight: 800;
          font-size: 18px;
          color: #111827;
        }
        .ed-modalSubtitle {
          margin-top: 4px;
          font-size: 13px;
          color: ${theme.colors.subtext};
        }
        .ed-modalBody {
          display: grid;
          gap: 10px;
        }
        .ed-field {
          display: grid;
          gap: 4px;
        }
        .ed-field label {
          font-size: 12px;
          font-weight: 600;
          color: ${theme.colors.subtext};
        }
        .ed-field input {
          height: 38px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          padding: 0 10px;
          font-size: 14px;
        }
        .ed-modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 6px;
        }
        .ed-modalBtn {
          border-radius: 999px;
          border: none;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          cursor: pointer;
        }
        .ed-modalBtn--ghost {
          background: #F3F4F6;
          color: #111827;
        }
        .ed-modalBtn--primary {
          background: #F6B100;
          color: #111827;
        }
        .ed-modalBtn[disabled] {
          opacity: 0.6;
          cursor: default;
        }
        `}</style>
      <Footer />
    </div>
  );
}