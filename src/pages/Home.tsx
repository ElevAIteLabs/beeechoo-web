// src/pages/Home.tsx
import React, { type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { listEvents, type EventDto } from '../lib/events';
import { listCreators, type CreatorDto } from '../lib/creators';
import { motion, useMotionValue } from 'framer-motion';
import LoginModal from '../components/LoginModal';

//import { EventCard } from '../components/ui/event-card';
import { listStudios, type StudioDto } from '../lib/studios';
import { TrendingEventsSection } from '../components/TrendingEventsSection';
import { TrendingCreatorsSection } from '../components/TrendingCreatorsSection';
import { FeaturedStudiosSection } from '../components/FeaturedStudiosSection';


/** ---- Theme ---- */
// const theme = {
//     bg: '#F8FAFC',
//     card: '#FFFFFF',
//     text: '#111827',
//     subtext: '#6B7280',
//     primary: '#F6B100',
//     border: '#E5E7EB',
//     shadow: '0 6px 24px rgba(0,0,0,0.06)',
// };

/** ------------------------- Image/Path helpers ------------------------- **/
// const API_BASE =
//     ((import.meta as any).env?.VITE_API_BASE as string) ||
//     'https://api.beeechoo.com';

// function normalizeBannerPath(raw?: string | null): string | null {
//     if (!raw) return null;
//     const p = raw.trim();
//     if (!p) return null;
//     if (/^https?:\/\//i.test(p)) return p;
//     const path = p.startsWith('/') ? p : `/${p}`;
//     return `${API_BASE}${path}`;
// }
// Add this near primaryBannerSrc
// function getStudioImage(s: StudioDto): string | null {
//     // Try cover image first, then first photo in gallery
//     return normalizeBannerPath(s.coverImage) ??
//         (s.photos && s.photos.length > 0 ? normalizeBannerPath(s.photos[0]) : null);
// }






/** ---- Dummy Studios ---- */


// const DUMMY_MEDIA = [
//     {
//         id: 'mh1',
//         name: 'BrightFrame Media House',
//         area: 'Koramangala',
//         city: 'Bengaluru',
//         // Shown in the pill – now ad budget focused
//         category: 'from ₹50,000',
//         displayImage:
//             'data:image/jpeg;base64,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',
//     },
//     {
//         id: 'mh2',
//         name: 'Urban Reach Advertising',
//         area: 'Lower Parel',
//         city: 'Mumbai',
//         category: ' from ₹25,000',
//         displayImage:
//             'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
//     },
//     {
//         id: 'mh3',
//         name: 'PixelStory Creative Studio',
//         area: 'Connaught Place',
//         city: 'New Delhi',
//         category: ' from ₹1,50,000',
//         displayImage:
//             'data:image/jpeg;base64,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',
//     },
// ];

// Generic card image (Events / Creators use primaryBannerSrc, Studios/Media use displayImage)


/** --------------------------- Bee Animation --------------------------- **/

function BeeAnimation({ bannerWidth }: { bannerWidth: number }) {
    const x = useMotionValue(50);
    const y = useMotionValue(80);
    const prevX = React.useRef(50);
    const [rotation, setRotation] = React.useState(180);
    const [key, setKey] = React.useState(0);

    const maxWidth = bannerWidth - 100;

    React.useEffect(() => {
        let hasReachedRight = false;

        const unsubscribeX = x.on('change', latest => {
            const dx = latest - prevX.current;

            if (latest >= maxWidth * 0.85 && !hasReachedRight) {
                hasReachedRight = true;
                setRotation(0);
                setKey(k => k + 1);
            }

            if (latest <= 150 && hasReachedRight && dx > 0) {
                hasReachedRight = false;
                setRotation(180);
                setKey(k => k + 1);
            }

            prevX.current = latest;
        });

        return () => {
            unsubscribeX();
        };
    }, [x, maxWidth]);

    return (
        <motion.div
            style={{
                x,
                y,
                position: 'absolute',
                zIndex: 2,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 4px 12px rgba(255, 184, 0, 0.3))',
            }}
            animate={{
                x: [
                    50, 150, 280, 420, 580, 720, maxWidth * 0.7, maxWidth * 0.85, maxWidth * 0.95,
                    maxWidth * 0.9, maxWidth * 0.75, maxWidth * 0.6, 480, 320, 180, 80, 50,
                ],
                y: [
                    80, 120, 100, 140, 120, 160, 140, 180, 160,
                    200, 170, 140, 110, 150, 120, 90, 80,
                ],
            }}
            transition={{
                duration: 16,
                ease: 'easeInOut',
                repeat: Infinity,
                times: [
                    0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.36, 0.42, 0.48,
                    0.56, 0.64, 0.72, 0.8, 0.86, 0.92, 0.96, 1,
                ],
            }}
        >
            <motion.div
                key={key}
                initial={{ rotateY: rotation }}
                animate={{ rotateY: rotation }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                <SideProfileBee />
            </motion.div>
        </motion.div>
    );
}

function SideProfileBee() {
    return (
        <motion.div
            animate={{ y: [0, -3, 0, -2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
            <svg
                width="60"
                height="60"
                viewBox="0 0 120 80"
                style={{ overflow: 'visible' }}
            >

                {/* Back wing - reduced size */}
                <motion.g
                    style={{ transformOrigin: '30px 35px' }}
                    animate={{ scaleY: [1, 1.4, 1, 1.3, 1], rotate: [-10, -15, -10, -13, -10] }}
                    transition={{ duration: 0.1, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ellipse
                        cx="35"
                        cy="30"
                        rx="18"   // smaller
                        ry="12"   // smaller
                        fill="rgba(255, 255, 255, 0.75)"
                        stroke="rgba(200, 200, 200, 0.5)"
                        strokeWidth="1"
                    />
                    <ellipse cx="32" cy="28" rx="8" ry="5" fill="rgba(255, 255, 255, 0.4)" /> {/* smaller */}
                </motion.g>

                {/* Body */}
                <ellipse cx="60" cy="40" rx="35" ry="18" fill="#FFB800" />
                <ellipse cx="45" cy="40" rx="8" ry="16" fill="#2B2B2B" opacity="0.9" />
                <ellipse cx="60" cy="40" rx="8" ry="18" fill="#2B2B2B" opacity="0.9" />
                <ellipse cx="75" cy="40" rx="8" ry="16" fill="#2B2B2B" opacity="0.9" />

                {/* Thorax */}
                <ellipse cx="35" cy="38" rx="15" ry="14" fill="#FFB800" />
                <ellipse cx="35" cy="38" rx="15" ry="14" fill="#2B2B2B" opacity="0.15" />

                {/* Head */}
                <circle cx="20" cy="35" r="11" fill="#FFB800" />
                <circle cx="20" cy="35" r="11" fill="url(#beeGradient)" opacity="0.3" />

                {/* Eye */}
                <motion.ellipse
                    cx="17"
                    cy="33"
                    rx="4"
                    ry={4.5}
                    fill="#2B2B2B"
                    animate={{ ry: [4.5, 1, 4.5] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <ellipse cx="16" cy="31.5" rx="1.5" ry="2" fill="white" opacity="0.8" />

                {/* Antenna */}
                <motion.g
                    animate={{ rotate: [-8, 8, -8] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '18px 26px' }}
                >
                    <path
                        d="M 18 26 Q 14 18 12 12"
                        stroke="#2B2B2B"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="2.5" fill="#2B2B2B" />
                </motion.g>

                {/* Front wing - reduced size */}
                <motion.g
                    style={{ transformOrigin: '45px 30px' }}
                    animate={{ scaleY: [1, 1.4, 1, 1.3, 1], rotate: [-5, -10, -5, -8, -5] }}
                    transition={{
                        duration: 0.1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.05,
                    }}
                >
                    <ellipse
                        cx="50"
                        cy="25"
                        rx="20"  // smaller
                        ry="14"  // smaller
                        fill="rgba(255, 255, 255, 0.9)"
                        stroke="rgba(200, 200, 200, 0.6)"
                        strokeWidth="1"
                    />
                    <ellipse cx="48" cy="23" rx="10" ry="7" fill="rgba(255, 255, 255, 0.5)" /> {/* smaller */}
                    <path
                        d="M 35 25 L 60 25 M 40 20 L 58 30 M 40 30 L 58 20"
                        stroke="rgba(200, 200, 200, 0.4)"
                        strokeWidth="0.5"
                        fill="none"
                    />
                </motion.g>

                {/* Legs */}
                <motion.g
                    animate={{ rotate: [0, 3, 0, 2, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '35px 50px' }}
                >
                    <path
                        d="M 28 45 L 22 52 L 20 58"
                        stroke="#2B2B2B"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 38 48 L 35 56 L 33 62"
                        stroke="#2B2B2B"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 55 48 L 58 56 L 60 62"
                        stroke="#2B2B2B"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />
                </motion.g>

                {/* Stinger */}
                <path
                    d="M 90 40 L 98 40 L 100 40"
                    stroke="#2B2B2B"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.7"
                />

                <defs>
                    <radialGradient id="beeGradient" cx="40%" cy="30%">
                        <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>
        </motion.div>
    );
}


/** --------------------------- Home Page --------------------------- **/

export default function Home(): JSX.Element {
    //const nav = useNavigate();
    const location = useLocation();
    const [events, setEvents] = React.useState<EventDto[]>([]);
    const [creators, setCreators] = React.useState<CreatorDto[]>([]);
    const [studios, setStudios] = React.useState<StudioDto[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loginModalOpen, setLoginModalOpen] = React.useState(
        (location.state as any)?.loginModal ?? window.location.hash === '#login-modal'
    );

    const bannerRef = React.useRef<HTMLDivElement | null>(null);
    const [bannerWidth, setBannerWidth] = React.useState(1200);
    // 👇 rotating word for hero title
    const rotatingWords = ['Creative', 'Studios', 'Creators', 'Media', 'Brands'];
    const [wordIndex, setWordIndex] = React.useState(0);

    React.useEffect(() => {
        const id = window.setInterval(() => {
            setWordIndex(prev => (prev + 1) % rotatingWords.length);
        }, 1800); // change every 1.8s

        return () => window.clearInterval(id);
    }, []); // rotatingWords is constant here

    const currentWord = rotatingWords[wordIndex];

    React.useEffect(() => {
        if (bannerRef.current) {
            setBannerWidth(bannerRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (bannerRef.current) {
                setBannerWidth(bannerRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    React.useEffect(() => {
        (async () => {
            try {
                const eventRes = await listEvents(6);
                setEvents(eventRes?.data ?? []);

                const creatorRes = await listCreators(8);
                setCreators(creatorRes?.data ?? []);

                // --- NEW: Fetch Studios ---
                const studioRes = await listStudios(6);
                setStudios(studioRes?.data ?? []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // function toTitleCase(input?: string | null): string {
    //     if (!input) return '';
    //     return input
    //         .toLowerCase()
    //         .split(/[\s_]+/)
    //         .filter(Boolean)
    //         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    //         .join(' ');
    // }



    return (
        <div className="home-root">
            {/* HERO */}
            <div
                ref={bannerRef}
                className="hero-banner"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '72px 16px 80px',
                }}
            >
                <BeeAnimation bannerWidth={bannerWidth} />

                {/* Decorative blobs + dots (kept as-is) */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 40,
                            right: 40,
                            width: 280,
                            height: 280,
                            borderRadius: '999px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            filter: 'blur(40px)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            left: 40,
                            width: 340,
                            height: 340,
                            borderRadius: '999px',
                            background: 'rgba(234, 179, 8, 0.08)',
                            filter: 'blur(40px)',
                        }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '25%',
                            width: 8,
                            height: 8,
                            borderRadius: '999px',
                            background: 'rgba(245, 158, 11, 0.4)',
                        }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '30%',
                            right: '30%',
                            width: 8,
                            height: 8,
                            borderRadius: '999px',
                            background: 'rgba(250, 204, 21, 0.4)',
                        }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            bottom: '25%',
                            right: '25%',
                            width: 8,
                            height: 8,
                            borderRadius: '999px',
                            background: 'rgba(245, 158, 11, 0.4)',
                        }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                    />
                </div>

                <div
                    style={{
                        maxWidth: 1120,
                        margin: '0 auto',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 48,
                        }}
                    >
                        {/* LEFT: text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ flex: '1 1 340px', maxWidth: 560 }}
                        >

                            <h1
                                className="heading-responsive"
                                style={{
                                    fontWeight: 800,
                                    color: '#111827',
                                    margin: 0,
                                    marginBottom: 16,
                                    display: 'inline-block',
                                }}
                            >
                                <span>Your&nbsp;</span>
                                <motion.span
                                    key={currentWord}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    style={{
                                        display: 'inline-block',
                                    }}
                                >
                                    {currentWord}
                                </motion.span>
                                <span style={{ display: 'block', color: '#F6B100' }}>Marketplace</span>
                            </h1>

                            <p
                                className="text-responsive"
                                style={{
                                    color: '#4B5563',
                                    margin: 0,
                                    marginBottom: 28,
                                    maxWidth: 520,
                                }}
                            >
                                Connect with creators, studios, equipment, and events — all in one buzzing
                                ecosystem. Plan your marketing strategy and bring your vision to life.
                            </p>

                            {/* Stats */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 'clamp(1rem, 4vw, 1.5rem)',
                                }}
                            >
                                {[
                                    { value: '10K+', label: 'Studios' },
                                    { value: '25K+', label: 'Creators' },
                                    { value: '10K+', label: 'Bookings' },
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                                        style={{ minWidth: 80 }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
                                                fontWeight: 800,
                                                color: '#111827',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {stat.value}
                                        </div>
                                        <div style={{ fontSize: 13, color: '#4B5563' }}>{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* RIGHT: cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ flex: '1 1 280px', position: 'relative' }}
                        >
                            <div style={{ position: 'relative', maxWidth: 360, margin: '0 auto' }}>
                                {/* Card 1 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: 18,
                                        padding: 18,
                                        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                                        border: '1px solid #E5E7EB',
                                        marginBottom: 12,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 14,
                                                background: 'rgba(245, 158, 11, 0.12)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFB800" />
                                                <path
                                                    d="M2 17L12 22L22 17"
                                                    stroke="#FFB800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M2 12L12 17L22 12"
                                                    stroke="#FFB800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    marginBottom: 2,
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    color: '#111827',
                                                }}
                                            >
                                                Studios & Spaces
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 13, color: '#4B5563' }}>
                                                Book creative studios
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Card 2 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: 18,
                                        padding: 18,
                                        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                                        border: '1px solid #E5E7EB',
                                        marginBottom: 12,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 14,
                                                background: 'rgba(250, 204, 21, 0.12)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="8" r="4" fill="#FFD54F" />
                                                <path
                                                    d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                                                    stroke="#FFD54F"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    marginBottom: 2,
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    color: '#111827',
                                                }}
                                            >
                                                Creators & Influencers
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 13, color: '#4B5563' }}>
                                                Hire talented professionals
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Card 3 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: 18,
                                        padding: 18,
                                        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                                        border: '1px solid #E5E7EB',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 14,
                                                background: 'rgba(245, 158, 11, 0.12)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect
                                                    x="3"
                                                    y="6"
                                                    width="18"
                                                    height="12"
                                                    rx="2"
                                                    stroke="#FFB800"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    d="M7 3V6M17 3V6M3 10H21"
                                                    stroke="#FFB800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    marginBottom: 2,
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    color: '#111827',
                                                }}
                                            >
                                                Events
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 13, color: '#4B5563' }}>
                                                Join creative events, shows and sponsorships
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* -------------------- Trending Creators -------------------- */}
            <TrendingCreatorsSection creators={creators} loading={loading} />

            {/* -------------------- Trending Events -------------------- */}
            <TrendingEventsSection events={events} loading={loading} />

            {/* -------------------- Featured Studios -------------------- */}
            <FeaturedStudiosSection studios={studios} loading={loading} />

            {/* Featured Media Houses - COMMENTED OUT
            (Move this section to a separate file if needed later)
            */}

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => {
                    setLoginModalOpen(false);
                    window.location.hash = '';
                }}
            />
        </div>
    );
}
