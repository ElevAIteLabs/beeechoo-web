// src/pages/StudioDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Shield,
  Share2,
  Heart,
  ChevronLeft
} from 'lucide-react';
import { getStudioById, type StudioDto } from '../lib/studios';
import { theme } from '../theme';

const API_BASE = (import.meta as any).env.VITE_API_BASE as string;

// Helper to ensure full image URLs
function normalizeImg(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export default function StudioDetails() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [studio, setStudio] = useState<StudioDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getStudioById(id);
        setStudio(data);
        // Set initial active image to cover image
        setActiveImage(
          data.coverImageUrl ||
          normalizeImg(data.coverImage) ||
          null
        );
      } catch (err) {
        console.error(err);
        setError('Failed to load studio details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={styles.centerMsg}>Loading studio...</div>;
  if (error || !studio) return <div style={styles.centerMsg}>{error || 'Studio not found'}</div>;

  // Prepare images list (Cover + Photos)
  const allPhotos = [
    studio.coverImageUrl || normalizeImg(studio.coverImage),
    ...(studio.photoUrls || []).map(p => p || normalizeImg(p)) // Handle already absolute or relative
  ].filter(Boolean) as string[];

  // Safe safe fallback for photos
  const displayPhotos = allPhotos.length > 0 ? allPhotos : ['https://via.placeholder.com/800x450?text=No+Image'];

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthWrapper}>

        {/* Header / Nav */}
        <button onClick={() => nav(-1)} style={styles.backButton}>
          <ChevronLeft size={20} /> Back
        </button>

        {/* Title Section */}
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>{studio.title}</h1>
            <div style={styles.locationRow}>
              <MapPin size={16} color={theme.colors.subtext} />
              <span>
                {studio.venueName ? `${studio.venueName}, ` : ''}
                {studio.address}, {studio.city}
              </span>
              {studio.mapLink && (
                <a href={studio.mapLink} target="_blank" rel="noreferrer" style={styles.mapLink}>
                  (View on Map)
                </a>
              )}
            </div>
          </div>
          <div style={styles.actionButtons}>
            <button style={styles.iconButton}><Share2 size={18} /></button>
            <button style={styles.iconButton}><Heart size={18} /></button>
          </div>
        </div>

        {/* Image Gallery */}
        <div style={styles.gallerySection}>
          <div style={styles.mainImageContainer}>
            <img src={activeImage || displayPhotos[0]} alt="Main View" style={styles.mainImage} />
          </div>
          <div style={styles.thumbnailStrip}>
            {displayPhotos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`View ${idx}`}
                style={{
                  ...styles.thumbnail,
                  border: activeImage === src ? `2px solid ${theme.colors.primary}` : '2px solid transparent'
                }}
                onClick={() => setActiveImage(src)}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="sd-content-grid">

          {/* Left Column: Details */}
          <div style={styles.detailsColumn}>

            {/* Quick Stats */}
            <div style={styles.statsBar}>
              <div style={styles.statItem}>
                <Users size={20} color={theme.colors.primary} />
                <span>Up to {studio.maxPeople || 'N/A'} Guests</span>
              </div>
              <div style={styles.statItem}>
                <Clock size={20} color={theme.colors.primary} />
                <span>Min {studio.minHours} Hour{studio.minHours > 1 ? 's' : ''}</span>
              </div>
              <div style={styles.statItem}>
                <Shield size={20} color={theme.colors.primary} />
                <span>{studio.cancellationPolicy ?
                  studio.cancellationPolicy.charAt(0).toUpperCase() + studio.cancellationPolicy.slice(1)
                  : 'Standard'} Cancellation</span>
              </div>
            </div>

            <div style={styles.divider} />

            {/* Description */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>About this Space</h3>
              <p style={styles.description}>
                {studio.description || 'No description provided.'}
              </p>
              {/* Categories Tags */}
              <div style={styles.tagContainer}>
                {studio.categories.map(cat => (
                  <span key={cat} style={styles.categoryTag}>{cat}</span>
                ))}
              </div>
            </section>

            <div style={styles.divider} />

            {/* Amenities */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Amenities</h3>
              {studio.amenities.length > 0 ? (
                <div style={styles.amenitiesGrid}>
                  {studio.amenities.map(am => (
                    <div key={am} style={styles.amenityItem}>
                      <CheckCircle size={18} color="#10B981" />
                      <span>{am}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.subtext}>No amenities listed.</p>
              )}
            </section>

            <div style={styles.divider} />

            {/* House Rules */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>House Rules</h3>
              <p style={styles.rulesText}>
                {studio.houseRules || 'No specific house rules listed. Please contact the host for details.'}
              </p>
            </section>

            {/* Host Info */}
            <section style={styles.hostSection}>
              <div style={styles.hostAvatarPlaceholder}>
                {(studio.ownerName || 'H').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.subtext}>Hosted by</div>
                <div style={styles.hostName}>{studio.ownerName || 'Verified Host'}</div>
              </div>
            </section>

          </div>

          {/* Right Column: Booking Card (Sticky) */}
          <div style={styles.bookingColumn}>
            <div style={styles.bookingCard}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.price}>₹{studio.hourlyRate.toLocaleString()}</span>
                  <span style={styles.priceUnit}> / hour</span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span>Minimum Booking</span>
                  <strong>{studio.minHours} Hours</strong>
                </div>
                <div style={styles.infoRow}>
                  <span>Max Capacity</span>
                  <strong>{studio.maxPeople || '-'} People</strong>
                </div>
              </div>

              <button style={styles.bookButton}>
                Request to Book
              </button>

              <p style={styles.cardFooterText}>
                You won't be charged yet
              </p>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .sd-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 1024px) {
          .sd-content-grid {
            grid-template-columns: 1fr 360px;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Styles ---------------- */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    padding: '24px 16px',
  },
  centerMsg: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 80,
    fontSize: 18,
    color: '#6B7280'
  },
  maxWidthWrapper: {
    maxWidth: 1120,
    margin: '0 auto',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 8px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#4B5563',
    fontSize: 15,
  },
  mapLink: {
    color: theme.colors.primary,
    textDecoration: 'underline',
    fontSize: 14,
    marginLeft: 4,
  },
  actionButtons: {
    display: 'flex',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px solid #E5E7EB',
    backgroundColor: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
  },

  /* Gallery */
  gallerySection: {
    marginBottom: 32,
  },
  mainImageContainer: {
    width: '100%',
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailStrip: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 8,
  },
  thumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
    objectFit: 'cover',
    cursor: 'pointer',
    flexShrink: 0,
  },

  /* Content Grid */
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 48,
  },
  detailsColumn: {
    minWidth: 0,
  },

  /* Stats Bar */
  statsBar: {
    display: 'flex',
    gap: 24,
    padding: '20px 0',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 15,
    fontWeight: 500,
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    margin: '24px 0',
  },

  /* Generic Section */
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4B5563',
    whiteSpace: 'pre-wrap',
    marginBottom: 20,
  },
  tagContainer: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#FEF3C7', // light yellow
    color: '#92400E',
    padding: '4px 12px',
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 600,
  },

  /* Amenities */
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 15,
    color: '#374151',
  },

  /* House Rules */
  rulesText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 1.5,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },

  /* Host */
  hostSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
    paddingTop: 32,
    borderTop: '1px solid #E5E7EB',
  },
  hostAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: '#111827',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 700,
  },
  hostName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  subtext: {
    color: '#6B7280',
    fontSize: 14,
  },

  /* Booking Card */
  bookingColumn: {
    position: 'relative',
  },
  bookingCard: {
    position: 'sticky',
    top: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E5E7EB',
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: '1px solid #E5E7EB',
  },
  price: {
    fontSize: 24,
    fontWeight: 800,
    color: '#111827',
  },
  priceUnit: {
    fontSize: 15,
    color: '#6B7280',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    color: '#374151',
  },
  bookButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#EAB308', // Primary yellow
    color: '#111827',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  cardFooterText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
  },
};