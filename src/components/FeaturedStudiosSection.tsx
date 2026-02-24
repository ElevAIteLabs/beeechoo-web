import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { type StudioDto } from '../lib/studios';
import { MapPin, ArrowRight } from 'lucide-react';

// --- Helpers ---
const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) || 'https://api.beeechoo.com';

function normalizeBannerPath(raw?: string | null): string | null {
  if (!raw) return null;
  const p = raw.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/') ? p : `/${p}`;
  return `${API_BASE}${path}`;
}

function getStudioImage(s: StudioDto): string | null {
  return (
    normalizeBannerPath(s.coverImage) ??
    normalizeBannerPath(s.coverImageUrl) ??
    (s.photos && s.photos.length > 0 ? normalizeBannerPath(s.photos[0]) : null) ??
    (s.photoUrls && s.photoUrls.length > 0 ? normalizeBannerPath(s.photoUrls[0]) : null)
  );
}

function toTitleCase(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// --- Component ---
interface FeaturedStudiosSectionProps {
  studios: StudioDto[];
  loading: boolean;
}

export function FeaturedStudiosSection({ studios, loading }: FeaturedStudiosSectionProps) {
  const nav = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive hook - MUST be at the top level
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // Auto-scroll logic - 2 seconds interval
  useEffect(() => {
    if (studios.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % studios.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [studios.length]);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
        Loading featured studios...
      </div>
    );
  }

  if (!studios || studios.length === 0) {
    return (
      <section style={{ padding: '24px 16px 48px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 40,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  fontFamily: 'serif',
                }}
              >
                Featured Studios
              </h2>
              <p style={{ margin: '8px 0 0', color: '#4B5563', fontSize: 16 }}>
                Explore buzzing photography, video and recording studios
              </p>
            </div>
          </div>
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: '#6B7280',
              background: '#FFFBEB',
              borderRadius: 16,
              border: '1px solid #E5E7EB',
            }}
          >
            No featured studios found at the moment.
          </div>
        </div>
      </section>
    );
  }



  const currentStudio = studios[currentIndex];
  const category = currentStudio.categories?.[0] ? toTitleCase(currentStudio.categories[0]) : 'Studio';
  const price = `₹${currentStudio.hourlyRate?.toLocaleString() ?? '0'}`;

  // --- Responsive Carousel Config ---
  let ACTIVE_W = 540;
  let ACTIVE_H = 330;
  let SIDE_W = 420;
  let SIDE_H = 290;
  let xOffsets = {
    active: 40,
    next: 260,
    buffer: 500,
    prev: -160,
    hidden: 900
  };

  if (isMobile) {
    ACTIVE_W = 300;
    ACTIVE_H = 200;
    SIDE_W = 260; // smaller side cards
    SIDE_H = 180;
    xOffsets = {
      active: 20,
      next: 160,
      buffer: 300,
      prev: -50,
      hidden: 400
    };
  } else if (isTablet) {
    ACTIVE_W = 400;
    ACTIVE_H = 280;
    SIDE_W = 320;
    SIDE_H = 240;
    xOffsets = {
      active: 20,
      next: 180,
      buffer: 400,
      prev: -100,
      hidden: 600
    };
  }

  return (
    <section
      className="hero-banner"
      style={{ padding: '24px 16px 48px', overflow: 'hidden', position: 'relative' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div className="fs-header">
          <div>
            <h2
              className="heading-responsive"
              style={{
                fontWeight: 800,
                color: '#111827',
                margin: 0,
                fontFamily: 'serif',
              }}
            >
              Featured Studios
            </h2>
            <p style={{ margin: '8px 0 0', color: '#4B5563', fontSize: 16 }}>
              Explore buzzing photography, video and recording studios
            </p>
          </div>
          <button
            onClick={() => nav('/studios')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
            }}
          >
            view all <ArrowRight size={16} />
          </button>
        </div>

        {/* Content Row */}
        <div className="fs-content-wrapper">
          {/* LEFT: Active Studio Details */}
          <div className="fs-info-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStudio.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div style={{ marginBottom: 20 }}>
                  {/* Category Badge */}
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#F6B100',
                      color: '#000',
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    {category}
                  </div>

                  <h3
                    className="subheading-responsive"
                    style={{
                      fontWeight: 700,
                      lineHeight: 1.1,
                      margin: '0 0 16px',
                      color: '#000',
                    }}
                  >
                    {toTitleCase(currentStudio.title)}
                  </h3>

                  <div className="fs-meta-row">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>
                        {currentStudio.venueName ? toTitleCase(currentStudio.venueName) : 'Verified Studio'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#4B5563' }}>
                        <MapPin size={18} fill="#F6B100" stroke="none" />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                          {currentStudio.city ? toTitleCase(currentStudio.city) : 'Location TBA'}
                        </span>
                      </div>
                    </div>

                    <div className="fs-price-box">
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: '#000', marginBottom: 4 }}>
                        STARTING AT
                      </div>
                      <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: '#F6B100', marginBottom: 4 }}>
                        {price}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>per hour</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => nav(`/studios/${currentStudio.id}`)}
                  style={{
                    background: '#F6B100',
                    color: '#000',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(246, 177, 0, 0.3)',
                  }}
                >
                  View Studio
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Carousel */}
          <div className="fs-carousel-col" style={{ height: isMobile ? 240 : 420 }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', perspective: 1000 }}>
              {studios.map((studio, index) => {
                const slot = (index - currentIndex + studios.length) % studios.length;

                let x = 0;
                let scale = 1;
                let zIndex = 0;
                let opacity = 0;
                let blur = 0;

                if (slot === 0) {
                  // Active
                  x = xOffsets.active;
                  scale = 1;
                  zIndex = 20;
                  opacity = 1;
                  blur = 0;
                } else if (slot === 1) {
                  // Next
                  x = xOffsets.next;
                  scale = 0.92;
                  zIndex = 10;
                  opacity = 0.55;
                  blur = 6;
                } else if (slot === 2) {
                  // Buffer
                  x = xOffsets.buffer;
                  scale = 0.82;
                  zIndex = 5;
                  opacity = 0.25;
                  blur = 10;
                } else if (slot === studios.length - 1) {
                  // Previous (Exiting)
                  x = xOffsets.prev;
                  scale = 0.92;
                  zIndex = 9;
                  opacity = 0;
                  blur = 6;
                } else {
                  // Hidden
                  x = xOffsets.hidden;
                  opacity = 0;
                  scale = 0.5;
                }

                return (
                  <motion.div
                    key={studio.id}
                    initial={false}
                    animate={{
                      x,
                      scale,
                      opacity,
                      filter: `blur(${blur}px)`,
                      zIndex,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '10%', // ✅ lift cards up
                      transform: 'translateY(-10%)',
                      width: slot === 0 ? ACTIVE_W : SIDE_W,
                      height: slot === 0 ? ACTIVE_H : SIDE_H,
                      background: '#fff',
                      borderRadius: 24,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      transformOrigin: 'center center',
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img
                        src={getStudioImage(studio) || 'https://via.placeholder.com/540x330?text=Studio'}
                        alt={studio.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Price Badge on Active Card */}
                      {slot === 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            background: '#F6B100',
                            color: '#000',
                            padding: '8px 16px',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          ₹{studio.hourlyRate?.toLocaleString() ?? '0'}/hr
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFBEB 100%)',
          zIndex: -1,
        }}
      />

      <style>{`
        .fs-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .fs-content-wrapper {
          display: flex;
          flex-direction: row;
          gap: 40px;
          position: relative;
          align-items: center;
          flex-wrap: nowrap;
        }
        .fs-info-col {
          flex: 0 0 42%;
          min-width: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .fs-carousel-col {
          flex: 1 1 58%;
          min-width: 0;
          position: relative;
          display: flex;
          align-items: flex-start;
          overflow: visible;
          border-radius: 24px;
        }
        .fs-meta-row {
          display: flex;
          align-items: flex-start;
          gap: 32px;
          margin-bottom: 24px;
        }
        .fs-price-box {
          text-align: left;
          min-width: 110px;
        }

        @media (max-width: 1024px) {
           .fs-header {
             flex-direction: column;
             align-items: flex-start;
             gap: 16px;
           }
           .fs-content-wrapper {
             flex-direction: column;
             gap: 24px;
           }
           .fs-info-col {
             width: 100%;
             flex: 1 1 auto;
           }
           .fs-carousel-col {
             width: 100%;
             flex: 1 1 auto;
             align-items: center;
             justify-content: center;
             overflow: hidden;
           }
        }

        @media (max-width: 480px) {
          .fs-meta-row {
             flex-direction: column;
             gap: 16px;
          }
          .fs-price-box {
             display: flex;
             align-items: baseline;
             gap: 12px;
             width: 100%;
             margin-top: 8px;
             border-top: 1px solid #eee;
             padding-top: 12px;
          }
        }
      `}</style>
    </section>
  );
}

// --- Hook Definition relative to component ---
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}
