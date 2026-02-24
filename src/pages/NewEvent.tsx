// src/pages/NewEvent.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Plus, X } from 'lucide-react'; // Added X for removing benefits
import { getToken } from '../lib/auth';
import { createEvent } from '../lib/events';
import { theme } from '../theme';

// Updated Tier type to use a string array for benefits
type Tier = { tier: string; benefits?: string[]; price?: number };

type SponsorshipInterest = {
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

type ExistingEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startAt: string;
  endAt?: string | null;
  status: 'scheduled' | 'cancelled' | 'completed';
  ticketLink?: string | null;
  categories?: string[];
  sponsorships?: any;
  bannerUrl?: string | null;
  sponsorshipInterests?: SponsorshipInterest[];
};

const DEFAULT_CATEGORIES = [
  'AI & ML',
  'Web3',
  'Developer Meetup',
  'Healthcare Tech',
  'Startup',
  'Data Science',
  'Design',
  'Other',
];

const API = import.meta.env.VITE_API_BASE as string;

export default function NewEvent() {
  const nav = useNavigate();
  const location = useLocation() as { state?: { event?: ExistingEvent } };
  const existingEvent = location.state?.event;
  const isEdit = !!existingEvent;

  // Core fields
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Venue + Address -> saved as single 'location' (joined with " | ")
  const [venueName, setVenueName] = React.useState('');
  const [address, setAddress] = React.useState('');

  const nowLocal = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  const [startAt, setStartAt] = React.useState(nowLocal);
  const [endAt, setEndAt] = React.useState('');
  const [ticketLink, setTicketLink] = React.useState('');

  // Banner (single)
  const [banner, setBanner] = React.useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = React.useState<string | null>(null);

  // ✅ Single category only
  const [mainCategory, setMainCategory] = React.useState('');
  const [customCategory, setCustomCategory] = React.useState(''); // new custom category

  // Sponsorship tiers (with price)
  const [tiers, setTiers] = React.useState<Tier[]>([]);
  const [newTierName, setNewTierName] = React.useState('');
  // CHANGED: newBenefit and newTierBenefits array state
  const [newTierBenefits, setNewTierBenefits] = React.useState<string[]>([]);
  const [newBenefit, setNewBenefit] = React.useState('');
  const [newTierPrice, setNewTierPrice] = React.useState('');

  // UX
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = React.useState(false);

  // Prefill if editing an existing event
  React.useEffect(() => {
    if (!existingEvent) return;

    setTitle(existingEvent.title || '');
    setDescription(existingEvent.description || '');

    if (existingEvent.location) {
      const [venue, addr] = existingEvent.location.split(' | ');
      setVenueName(venue || '');
      setAddress(addr || '');
    }

    if (existingEvent.startAt) {
      setStartAt(new Date(existingEvent.startAt).toISOString().slice(0, 16));
    }
    if (existingEvent.endAt) {
      setEndAt(new Date(existingEvent.endAt).toISOString().slice(0, 16));
    }

    setTicketLink(existingEvent.ticketLink || '');

    // Handle existing category: if it's not in defaults, treat as "Other" + custom
    const firstCat = existingEvent.categories?.[0] || '';
    if (firstCat) {
      if (DEFAULT_CATEGORIES.includes(firstCat)) {
        setMainCategory(firstCat);
        setCustomCategory('');
      } else {
        setMainCategory('Other');
        setCustomCategory(firstCat);
      }
    }

    // Sponsorship tiers from event.sponsorships JSON
    if (Array.isArray(existingEvent.sponsorships)) {
      const mapped = existingEvent.sponsorships.map((s: any) => ({
        tier: s.tier || 'Untitled',
        // CHANGED: Handle description string from DB, split by ' + ' into benefits array
        benefits: (typeof s.description === 'string' && s.description) ? s.description.split(' + ') : [],
        price:
          typeof s.price === 'number'
            ? s.price
            : typeof s.cost === 'number'
              ? s.cost
              : typeof s.amount === 'number'
                ? s.amount
                : undefined,
      }));
      setTiers(mapped);
    }

    if (existingEvent.bannerUrl) {
      setBannerPreview(existingEvent.bannerUrl);
    }
  }, [existingEvent]);

  /* ---------------------------- Handlers ---------------------------- */
  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setBanner(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setBannerPreview(url);
      console.log('[NewEvent] banner selected:', { name: f.name, size: f.size, type: f.type });
    } else {
      setBannerPreview(null);
    }
  }

  // NEW: Add a single benefit to the pending list
  function addBenefit() {
    const benefit = newBenefit.trim();
    if (!benefit) return;
    setNewTierBenefits((prev) => [...prev, benefit]);
    setNewBenefit('');
  }

  // NEW: Remove a single benefit from the pending list
  function removePendingBenefit(idx: number) {
    setNewTierBenefits((prev) => prev.filter((_, i) => i !== idx));
  }

  function onTierKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      // CHANGED: Check if the enter key was pressed in the *benefit* input and add benefit instead of tier
      if (e.currentTarget.id === 'new-benefit-input') {
        addBenefit();
      } else if (e.currentTarget.id === 'new-tier-name-input' || e.currentTarget.id === 'new-tier-price-input') {
        addTier();
      }
    }
  }

  function addTier() {
    const name = newTierName.trim();
    const benefits = newTierBenefits;
    const priceStr = newTierPrice.trim();

    if (!name && !priceStr && benefits.length === 0) {
      console.log('[addTier] nothing to add');
      return;
    }

    let price: number | undefined;
    if (priceStr !== '') {
      const n = Number(priceStr);
      if (!Number.isFinite(n) || n < 0) {
        setError('Please enter a valid non-negative price for the sponsorship tier.');
        return;
      }
      price = n;
    }

    // CHANGED: Using benefits array
    const tier: Tier = { tier: name || 'Untitled', benefits: benefits.length > 0 ? benefits : undefined, price };
    console.log('[addTier] adding:', tier);

    setTiers((prev) => [...prev, tier]);
    setNewTierName('');
    setNewTierBenefits([]); // Clear benefits array
    setNewTierPrice('');
    setNewBenefit('');
  }

  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
  }

  function buildPendingTierOrNull(): Tier | null {
    const name = newTierName.trim();
    const benefits = newTierBenefits; // Array of strings
    const priceStr = newTierPrice.trim();

    if (!name && !priceStr && benefits.length === 0) return null;

    let price: number | undefined;
    if (priceStr !== '') {
      const n = Number(priceStr);
      if (!Number.isFinite(n) || n < 0) {
        setError('Please enter a valid non-negative price for the sponsorship tier.');
        return null;
      }
      price = n;
    }
    // CHANGED: Using benefits array
    return { tier: name || 'Untitled', benefits: benefits.length > 0 ? benefits : undefined, price };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      // In this version, edit mode is view-only; prevent creating duplicate event
      return;
    }

    setError(null);
    setMsg(null);

    const token = getToken();
    if (!token) {
      alert('Please login again.');
      nav('/', { replace: true });
      return;
    }

    if (!title.trim()) return setError('Title is required');
    if (!startAt) return setError('Start date/time is required');
    if (!ticketLink.trim()) return setError('Ticket link is required');
    if (!banner) return setError('Please upload a banner image');
    if (!mainCategory) return setError('Please select a category');

    // Handle "Other" -> custom category
    let categoryToSend = mainCategory;
    if (mainCategory === 'Other') {
      if (!customCategory.trim()) {
        return setError('Please enter a custom category name.');
      }
      categoryToSend = customCategory.trim();
    }

    const combinedLocation = [venueName.trim(), address.trim()].filter(Boolean).join(' | ');

    const pending = buildPendingTierOrNull();
    // CHANGED: Map tiers to ensure benefits (if present) are joined by ' + ' for the API
    const tiersToSend = (pending ? [...tiers, pending] : [...tiers]).map(t => ({
      ...t,
      description: t.benefits ? t.benefits.join(' + ') : undefined // Join benefits here for API
    }));

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append('title', title.trim());
      if (description.trim()) form.append('description', description.trim());
      if (combinedLocation) form.append('location', combinedLocation);

      form.append('startAt', new Date(startAt).toISOString());
      if (endAt) form.append('endAt', new Date(endAt).toISOString());

      form.append('ticketLink', ticketLink.trim());
      form.append('categories', categoryToSend);
      form.append('sponsorships', JSON.stringify(tiersToSend));
      form.append('banner', banner);

      const res = await createEvent(token, form);
      console.log('[NewEvent] createEvent response:', res);

      setMsg('Event created successfully! Pending approval.');
      setTimeout(() => nav('/', { replace: true }), 600);
    } catch (err: any) {
      console.error('[NewEvent] save failed:', err);
      setError(err?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelEvent() {
    if (!existingEvent) return;
    const token = getToken();
    if (!token) {
      alert('Please login again.');
      nav('/', { replace: true });
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this event?')) return;

    try {
      setCancelSubmitting(true);
      const r = await fetch(`${API}/events/${existingEvent.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to cancel event');
      }
      alert('Event has been cancelled.');
      nav('/profile', { replace: true });
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel');
    } finally {
      setCancelSubmitting(false);
    }
  }

  /* ---------------------------- Preview helpers ---------------------------- */
  const formatPreviewDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  const previewWhere = [venueName.trim(), address.trim()].filter(Boolean).join(', ');

  const readOnly = isEdit; // in edit mode, treat fields as read-only in this version

  /* ---------------------------- UI ---------------------------- */
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            {isEdit ? 'Event Details' : 'Create New Event'}
          </h1>
          <p style={styles.pageSubtitle}>
            {isEdit
              ? 'Review your event, see sponsor interest, or cancel the event.'
              : 'List your event and start selling tickets or sponsorships'}
          </p>
        </div>
      </div>

      <div className="ne-content-grid">
        {/* Left Column - Form */}
        <div style={styles.formColumn}>
          <div style={styles.formWrapper}>
            {/* Basic Information */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Event Title</label>
                <input
                  value={title}
                  onChange={(e) => !readOnly && setTitle(e.target.value)}
                  placeholder="Enter the name of your event"
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={mainCategory}
                  onChange={(e) => {
                    if (readOnly) return;
                    const value = e.target.value;
                    setMainCategory(value);
                    if (value !== 'Other') {
                      setCustomCategory('');
                    }
                  }}
                  style={styles.select}
                  disabled={readOnly}
                >
                  <option value="">Select a category</option>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {mainCategory === 'Other' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Custom Category</label>
                  <input
                    value={customCategory}
                    onChange={(e) => !readOnly && setCustomCategory(e.target.value)}
                    placeholder="Enter your category"
                    style={styles.input}
                    disabled={readOnly}
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => !readOnly && setDescription(e.target.value)}
                  placeholder="Tell us more about your event..."
                  rows={4}
                  style={styles.textarea}
                  disabled={readOnly}
                />
              </div>
            </section>

            {/* Location & Schedule */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Location & Schedule</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Venue Name</label>
                <input
                  value={venueName}
                  onChange={(e) => !readOnly && setVenueName(e.target.value)}
                  placeholder="e.g., The Grand Hall"
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <div style={styles.inputWithIcon}>
                  <MapPin
                    size={18}
                    color="#9CA3AF"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    value={address}
                    onChange={(e) => !readOnly && setAddress(e.target.value)}
                    placeholder="Type full address"
                    style={{ ...styles.input, paddingLeft: 40 }}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div style={styles.rowGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => !readOnly && setStartAt(e.target.value)}
                    style={styles.input}
                    disabled={readOnly}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => !readOnly && setEndAt(e.target.value)}
                    style={styles.input}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </section>

            {/* Tickets */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Tickets</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ticket Link</label>
                <input
                  value={ticketLink}
                  onChange={(e) => !readOnly && setTicketLink(e.target.value)}
                  placeholder="https://..."
                  style={styles.input}
                  disabled={readOnly}
                />
              </div>
            </section>

            {/* Sponsorship Details */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Sponsorship Details</h3>

              <div style={styles.tierInputGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tier Name</label>
                  <input
                    id="new-tier-name-input"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    onKeyDown={onTierKeyDown}
                    placeholder="e.g., Gold Sponsor"
                    style={styles.input}
                    disabled={readOnly}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price</label>
                  <div style={styles.inputWithIcon}>
                    <span style={styles.currencySymbol}>₹</span>
                    <input
                      id="new-tier-price-input"
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(e.target.value)}
                      onKeyDown={onTierKeyDown}
                      placeholder="1000.00"
                      inputMode="decimal"
                      style={{ ...styles.input, paddingLeft: 28 }}
                      disabled={readOnly}
                    />
                  </div>
                </div>
                {/* CHANGED: Benefit input and list */}
                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Benefits (separate items)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      id="new-benefit-input"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={onTierKeyDown}
                      placeholder="e.g., 6 complimentary passes"
                      style={{ ...styles.input, flex: 1 }}
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={addBenefit}
                        style={styles.addBenefitButton}
                        disabled={!newBenefit.trim()}
                        title="Add Benefit"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Display pending benefits */}
                {newTierBenefits.length > 0 && (
                  <div style={{ ...styles.formGroup, gridColumn: '1 / -1', marginTop: -8 }}>
                    <div style={styles.benefitsTagContainer}>
                      {newTierBenefits.map((benefit, i) => (
                        <div key={i} style={styles.benefitTag}>
                          {benefit}
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => removePendingBenefit(i)}
                              style={styles.benefitTagRemove}
                            >
                              <X size={12} color="#4B5563" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={addTier}
                  style={styles.addButton}
                  disabled={!newTierName.trim() && !newTierPrice.trim() && newTierBenefits.length === 0}
                >
                  + Add Sponsorship Tier
                </button>
              )}

              {tiers.length > 0 && (
                <div style={styles.tiersList}>
                  {tiers.map((t, i) => (
                    <div key={`${t.tier}-${i}`} style={styles.tierItem}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.tierHeader}>
                          <strong>{t.tier}</strong>
                          {typeof t.price === 'number' ? <span>&nbsp;— ₹{t.price}</span> : null}
                        </div>
                        {/* CHANGED: Display benefits list */}
                        {t.benefits && t.benefits.length > 0 && (
                          <ul style={styles.tierBenefitsList}>
                            {t.benefits.map((b, bIdx) => (
                              <li key={bIdx} style={styles.tierBenefitItem}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => removeTier(i)}
                          style={styles.removeButton}
                          title="Remove"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Media & Branding (single banner) */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Media & Branding</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Event Banner (16:9)</label>
                <div
                  style={styles.uploadBox}
                  onClick={() =>
                    !readOnly && document.getElementById('banner-upload')?.click()
                  }
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" style={styles.bannerPreview} />
                  ) : (
                    <>
                      <div style={styles.uploadIcon}>📄</div>
                      <p style={styles.uploadText}>
                        Drag and drop or <span style={styles.uploadLink}>browse files</span>
                      </p>
                      <p style={styles.uploadHint}>PNG, JPG, up to 10MB</p>
                    </>
                  )}
                </div>
                {!readOnly && (
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    style={{ display: 'none' }}
                  />
                )}
              </div>
            </section>

            {/* Status */}
            {error && <div style={styles.errorMessage}>{error}</div>}
            {msg && <div style={styles.successMessage}>{msg}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {!isEdit && (
                <button
                  className="publish-button"
                  onClick={onSubmit}
                  disabled={submitting}
                  style={styles.actionButton} // Applied custom style
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              )}
              {isEdit && (
                <>
                  {/* The instruction says 'edit mode is view-only', but the original code has a 'Save Changes' button. I'm leaving it as-is for consistency with the original code structure, but acknowledging the comment. */}
                  <button
                    className="publish-button"
                    onClick={onSubmit}
                    disabled={submitting}
                    style={styles.actionButton}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="publish-button cancel-button"
                    onClick={cancelEvent}
                    disabled={cancelSubmitting}
                    style={{ ...styles.actionButton, backgroundColor: '#EF4444', border: '2px solid #DC2626', color: '#FFFFFF' }}
                  >
                    {cancelSubmitting ? 'Cancelling…' : 'Cancel Event'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview + Sponsorship Requests */}
        <div style={styles.previewColumn}>
          <div style={styles.previewCard}>
            <h3 style={styles.previewTitle}>Live Preview</h3>

            <div style={styles.previewBanner}>
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" style={styles.previewBannerImg} />
              ) : (
                <div style={styles.previewBannerPlaceholder} />
              )}
            </div>

            <div style={styles.previewContent}>
              <h2 style={styles.previewEventTitle}>
                {title || 'Your Awesome Event Title'}
              </h2>

              <div style={styles.previewInfo}>
                <div style={styles.previewInfoItem}>
                  <Calendar size={16} color="#6B7280" />
                  <span>
                    {formatPreviewDate(startAt) || 'Mon, Dec 25, 2024 at 7:00 PM'}
                  </span>
                </div>
                <div style={styles.previewInfoItem}>
                  <MapPin size={16} color="#6B7280" />
                  <span>{previewWhere || 'The Grand Hall, New York'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsorship Requests list (edit mode only) */}
          {isEdit &&
            Array.isArray(existingEvent?.sponsorshipInterests) &&
            existingEvent!.sponsorshipInterests!.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  padding: 16,
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>
                  Sponsorship Requests
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {existingEvent!.sponsorshipInterests!.map((req) => {
                    const displayName =
                      req.name || req.userProfileName || 'Unknown';
                    const displayBrand =
                      req.brandName || req.userProfileBrandName || null;
                    const displayCity = req.city || req.userProfileCity || '';

                    return (
                      <div
                        key={req.id}
                        style={{
                          borderRadius: 8,
                          border: `1px solid ${theme.colors.border}`,
                          padding: 8,
                          fontSize: 12,
                          background: '#F9FAFB',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#111827' }}>
                          {req.tier}
                          {req.cost && ` • ₹${req.cost}`}
                        </div>
                        <div style={{ color: '#6B7280' }}>
                          {displayName} ({req.email})
                        </div>
                        <div style={{ color: '#6B7280' }}>
                          {displayBrand && `${displayBrand} • `}
                          {displayCity}
                        </div>
                        <div style={{ color: '#6B7280' }}>
                          Phone: {req.userPhone || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
      <style>{`
        .ne-content-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .ne-content-grid {
            grid-template-columns: 1fr 380px;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------- inline styles ------------------------------- */
const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '24px' },
  header: { maxWidth: 1400, margin: '0 auto 24px' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', margin: '4px 0 0' },
  contentGrid: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 24,
  },
  formColumn: { display: 'flex', flexDirection: 'column' },
  formWrapper: { display: 'flex', flexDirection: 'column', gap: 16 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #E5E7EB',
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },

  // Input styles - no border
  input: {
    padding: '12px 14px',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  select: {
    padding: '12px 14px',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
  },

  inputWithIcon: { position: 'relative' },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6B7280',
    fontSize: 14,
  },
  rowGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  tierInputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 12,
  },
  addButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: '2px dashed #D1D5DB',
    backgroundColor: 'transparent',
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 16,
    transition: 'background-color 0.1s',

  },
  // NEW: Style for the add benefit button (Plus button)
  addBenefitButton: {
    padding: 10,
    borderRadius: 12,
    border: '1px solid #D1D5DB',
    backgroundColor: '#EAB308',
    color: '#111827',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.1s',


  },
  // NEW: Styles for pending benefits tags
  benefitsTagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '8px 0 0',
  },
  benefitTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    color: '#4B5563',
    fontSize: 13,
    fontWeight: 500,
  },
  benefitTagRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiersList: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 },
  tierItem: {
    display: 'flex',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  tierHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4,
    fontSize: 14,
  },
  // NEW: Styles for the list of benefits in a saved tier
  tierBenefitsList: {
    listStyleType: 'disc',
    paddingLeft: 20,
    margin: '4px 0 0 0',
    fontSize: 13,
    color: '#6B7280',
  },
  tierBenefitItem: {
    marginBottom: 2,
    lineHeight: '1.4',
  },
  removeButton: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  uploadBox: {
    border: '2px dashed #D1D5DB',
    borderRadius: 12,
    padding: 40,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: { fontSize: 48, marginBottom: 12 },
  uploadText: { fontSize: 14, color: '#6B7280', margin: '0 0 4px' },
  uploadLink: { color: '#F59E0B', fontWeight: 600 },
  uploadHint: { fontSize: 12, color: '#9CA3AF', margin: 0 },
  bannerPreview: { width: '100%', height: 'auto', borderRadius: 8 },
  previewColumn: { position: 'sticky', top: 24, height: 'fit-content' },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    padding: '20px 20px 16px',
  },
  previewBanner: {
    width: '100%',
    aspectRatio: '16 / 9',
    backgroundColor: '#E5E7EB',
  },
  previewBannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#E5E7EB' },
  previewBannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  previewContent: { padding: 20 },
  previewEventTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 16px',
  },
  previewInfo: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  previewInfoItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' },

  actionButton: { // Consolidated common button style
    padding: '12px 24px',
    backgroundColor: '#EAB308',
    color: '#111827',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    flex: 1,
  },
  errorMessage: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: 8,
    fontSize: 14,
  },
  successMessage: {
    padding: 12,
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: 8,
    fontSize: 14,
  },
};