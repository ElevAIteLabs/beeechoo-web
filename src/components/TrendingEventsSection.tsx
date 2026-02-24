import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { type EventDto } from '../lib/events';
import { MapPin, ArrowRight } from 'lucide-react';

// --- Helpers (duplicated from Home.tsx/utils to ensure isolation) ---

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

function primaryBannerSrc(
  e:
    | { bannerUrl?: string | null; banner?: string | null }
    | { avatarUrl?: string | null }
): string | null {
  if ('avatarUrl' in e && e.avatarUrl) return normalizeBannerPath(e.avatarUrl);
  const event = e as { bannerUrl?: string | null; banner?: string | null };
  return normalizeBannerPath(event.bannerUrl) ?? normalizeBannerPath(event.banner) ?? null;
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

interface TrendingEventsSectionProps {
  events: EventDto[];
  loading: boolean;
}

export function TrendingEventsSection({ events, loading }: TrendingEventsSectionProps) {
  const nav = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive hook - MUST be at the top level
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // Auto-scroll logic
  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 2000); // 2 seconds
    return () => clearInterval(timer);
  }, [events.length]);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
        Loading trending events...
      </div>
    );
  }

  if (!events || events.length === 0) {
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
                Trending Events
              </h2>
              <p style={{ margin: '8px 0 0', color: '#4B5563', fontSize: 16 }}>
                Discover the most popular creative events near you
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
            No trending events found at the moment.
          </div>
        </div>
      </section>
    );
  }



  const currentEvent = events[currentIndex];

  // Date parts
  const dateObj = currentEvent.startAt ? new Date(currentEvent.startAt) : new Date();
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const time = currentEvent.startAt
    ? new Date(currentEvent.startAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'TIME TBA';

  // --- Responsive Carousel Config ---
  // Mobile / Tablet / Desktop dimensions
  let ACTIVE_W = 540;
  let ACTIVE_H = 340;
  let SIDE_W = 430;
  let SIDE_H = 300;
  let xOffsets = {
    active: 40,
    next: 260,
    buffer: 500,
    prev: -160,
    hidden: 900
  };

  if (isMobile) {
    // Mobile adjustments
    ACTIVE_W = 300;
    ACTIVE_H = 200;
    SIDE_W = 260; // smaller side cards
    SIDE_H = 180;
    xOffsets = {
      active: 20, // closer to left or center depending on container
      next: 160,  // peek next
      buffer: 300,
      prev: -50,
      hidden: 400
    };
  } else if (isTablet) {
    // Tablet adjustments
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
      style={{
        padding: '24px 16px 48px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div
          className="trending-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 40,
          }}
        >
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
              Trending Events
            </h2>
            <p style={{ margin: '8px 0 0', color: '#4B5563', fontSize: 16 }}>
              Discover the most popular creative events near you
            </p>
          </div>

          <button
            onClick={() => nav('/events')}
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
        <div className="trending-content-wrapper">
          {/* LEFT: Active Event Details */}
          <div className="trending-info-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentEvent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3
                    className="subheading-responsive"
                    style={{
                      fontWeight: 700,
                      lineHeight: 1.1,
                      margin: '0 0 16px',
                      color: '#000',
                    }}
                  >
                    {toTitleCase(currentEvent.title)}
                  </h3>

                  <div className="trending-meta-row">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>
                        by {currentEvent.organizerName || 'Bee Echoo'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#4B5563' }}>
                        <MapPin size={18} fill="#F6B100" stroke="none" />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                          {currentEvent.location || 'Venue TBA'}
                        </span>
                      </div>
                    </div>

                    <div className="trending-date-box">
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: '#000', marginBottom: 4 }}>
                        {dayName}
                      </div>
                      <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1, color: '#000', marginBottom: 4 }}>
                        {month}
                        {day}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>{time}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => nav(`/events/${currentEvent.id}`)}
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
                  Get More Details
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Carousel */}
          <div className="trending-carousel-col" style={{ height: isMobile ? 240 : 420 }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', perspective: 1000 }}>
              {events.map((event, index) => {
                const slot = (index - currentIndex + events.length) % events.length;

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
                } else if (slot === events.length - 1) {
                  // Prev
                  x = xOffsets.prev;
                  scale = 0.92;
                  zIndex = 9;
                  opacity = 0;
                  blur = 6;
                } else {
                  x = xOffsets.hidden;
                  opacity = 0;
                  scale = 0.5;
                }

                return (
                  <motion.div
                    key={event.id}
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
                      top: '10%', // keep some top padding
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
                        src={primaryBannerSrc(event) || 'https://via.placeholder.com/540x340'}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
        .trending-content-wrapper {
          display: flex;
          flex-direction: row;
          gap: 40px;
          position: relative;
          align-items: center;
          flex-wrap: nowrap;
        }
        .trending-info-col {
          flex: 0 0 42%;
          min-width: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .trending-carousel-col {
          flex: 1 1 58%;
          min-width: 0;
          position: relative;
          display: flex;
          align-items: flex-start;
          overflow: visible; /* changed from hidden to let shadows breathe */
          border-radius: 24px;
        }
        .trending-meta-row {
          display: flex;
          align-items: flex-start;
          gap: 32px;
          margin-bottom: 24px;
        }
        .trending-date-box {
          text-align: left;
          min-width: 110px;
        }

        /* Mobile / Tablet Overrides */
        @media (max-width: 1024px) {
          .trending-content-wrapper {
            flex-direction: column-reverse; /* Carousel on top (visual), Info below? Or Info top? */
            /* Let's try regular column first: Info Top, Carousel Bottom */
            flex-direction: column;
            gap: 24px;
          }
          .trending-info-col {
            flex: 1 1 auto;
            width: 100%;
          }
          .trending-carousel-col {
            width: 100%;
            flex: 1 1 auto;
            /* On mobile, center aligned items might look better */
            align-items: center;
            justify-content: center;
            overflow: hidden; /* clip overflow on mobile width */
          }
          .trending-header {
             flex-direction: column;
             align-items: flex-start !important;
             gap: 16px;
          }
        }
        
        @media (max-width: 480px) {
           .trending-meta-row {
             flex-direction: column;
             gap: 16px;
           }
           .trending-date-box {
             display: flex;
             align-items: flex-end;
             gap: 16px;
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
