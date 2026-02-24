import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { type CreatorDto } from '../lib/creators';

// --- Helpers ---
const API_BASE =
    ((import.meta as any).env?.VITE_API_BASE as string) ||
    'https://api.beeechoo.com';

function normalizeBannerPath(raw?: string | null): string | null {
    if (!raw) return null;
    const p = raw.trim();
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    const path = p.startsWith('/') ? p : `/${p}`;
    return `${API_BASE}${path}`;
}

function toTitleCase(input?: string | null): string {
    if (!input) return '';
    return input
        .toLowerCase()
        .split(/[\s_]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// --- Component ---
interface TrendingCreatorsSectionProps {
    creators: CreatorDto[];
    loading: boolean;
}

export function TrendingCreatorsSection({ creators, loading }: TrendingCreatorsSectionProps) {
    const nav = useNavigate();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (loading) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                Loading trending creators...
            </div>
        );
    }

    if (!creators || creators.length === 0) {
        return (
            <section style={{
                padding: '60px 24px',
                background: 'linear-gradient(180deg, #FEF9E7 0%, #FFFDF5 100%)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 42, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'serif' }}>
                        Trending Creators
                    </h2>
                    <p style={{ margin: '8px 0 40px', color: '#4B5563', fontSize: 14 }}>
                        Explore buzzing photography, video and recording studioMeet the most buzzing creators on the platform
                    </p>
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        color: '#6B7280',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: 24,
                    }}>
                        No creators found.
                    </div>
                </div>
            </section>
        );
    }

    const getCreatorImage = (c: CreatorDto): string => {
        return normalizeBannerPath(c.avatarUrl) ||
            normalizeBannerPath(c.coverPhotoUrl) ||
            'https://via.placeholder.com/200x280?text=Creator';
    };

    const getCreatorName = (c: CreatorDto): string => {
        return c.brandName ? toTitleCase(c.brandName) : toTitleCase(c.name);
    };

    const getCreatorCategory = (c: CreatorDto): string => {
        return c.category ? toTitleCase(c.category) : 'Creator';
    };


    return (
        <section className="hero-banner" style={{
            padding: "60px 16px 100px",
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Container with overflow hidden to prevent cards from going outside */}
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px 0 80px',
            }}>

                {/* Header Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 50,
                    padding: '0 20px',
                }}>
                    {/* Left: Title */}
                    <div>
                        <h2 style={{
                            fontSize: 42,
                            fontWeight: 800,
                            color: '#111827',
                            margin: 0,
                        }}>
                            Trending Creators
                        </h2>
                        <p style={{
                            margin: '4px 0 0',
                            color: '#4B5563',
                            fontSize: 13,
                        }}>
                            Meet the most buzzing creators on the platform
                        </p>
                    </div>

                    {/* Right: View All Button */}
                    <button
                        onClick={() => nav('/creators')}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#111827',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 14,
                        }}
                    >
                        view all →
                    </button>
                </div>

                {/* Creator Cards Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: 20,
                    paddingTop: 60,
                    flexWrap: 'wrap',
                }}>
                    {creators.slice(0, 8).map((creator, idx) => (
                        <CreatorCard
                            key={creator.id}
                            creator={creator}
                            index={idx}
                            isHovered={hoveredIndex === idx}
                            onHover={() => setHoveredIndex(idx)}
                            onLeave={() => setHoveredIndex(null)}
                            onClick={() => nav(`/creators/${creator.id}`)}
                            getImage={getCreatorImage}
                            getName={getCreatorName}
                            getCategory={getCreatorCategory}
                            anyHovered={hoveredIndex !== null}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Creator Card Component ---
interface CreatorCardProps {
    creator: CreatorDto;
    index: number;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    getImage: (c: CreatorDto) => string;
    getName: (c: CreatorDto) => string;
    getCategory: (c: CreatorDto) => string;
    anyHovered: boolean;
}

function CreatorCard({
    creator,
    //index,
    isHovered,
    onHover,
    onLeave,
    onClick,
    getImage,
    getName,
    getCategory,
    anyHovered,
}: CreatorCardProps) {
    // All cards are oval/pill shaped - consistent sizing
    const baseWidth = 110;
    const baseHeight = 170;

    // Border radius: Oval (pill) normally, circle on hover
    // For oval/pill: use large px value for rounded ends
    // For circle: use 50%
    const normalRadius = `${baseHeight / 2}px`;
    const hoverRadius = '50%';

    // Scale and depth effects
    const scale = isHovered ? 1.2 : (anyHovered && !isHovered ? 0.92 : 1);
    const zIndex = isHovered ? 20 : 1;
    const shadowIntensity = isHovered ? 0.3 : 0.12;

    return (
        <motion.div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            animate={{
                scale,
                zIndex,
                opacity: anyHovered && !isHovered ? 0.6 : 1,
            }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
            }}
            style={{
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            {/* Tooltip ABOVE the card on Hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: -70,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#F6B100',
                            borderRadius: 14,
                            padding: '12px 18px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                            zIndex: 30,
                        }}
                    >
                        <div style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#000',
                            marginBottom: 3,
                        }}>
                            {getName(creator)}
                        </div>
                        <div style={{
                            fontSize: 12,
                            color: '#000',
                            fontWeight: 500,
                        }}>
                            {getCategory(creator)}
                        </div>
                        {/* Arrow pointing down */}
                        <div style={{
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid #F6B100',
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Container - Oval/Pill that morphs to Circle */}
            <motion.div
                animate={{
                    borderRadius: isHovered ? hoverRadius : normalRadius,
                    width: isHovered ? baseHeight : baseWidth,
                    height: baseHeight,
                    boxShadow: `0 ${isHovered ? 20 : 10}px ${isHovered ? 40 : 20}px rgba(0,0,0,${shadowIntensity})`,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 22,
                }}
                style={{
                    overflow: 'hidden',
                    background: '#fff',
                    border: isHovered ? '3px solid #F6D365' : 'none',
                }}
            >
                <img
                    src={getImage(creator)}
                    alt={getName(creator)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                    }}
                />
            </motion.div>
        </motion.div>
    );
}
