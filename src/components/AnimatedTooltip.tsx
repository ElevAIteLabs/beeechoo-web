import  { useState, type MouseEvent } from 'react';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { Link } from 'react-router-dom';

type TooltipItem = {
  id: string | number;
  name: string;
  designation: string;
  image?: string | null;
  href?: string;
};

export function AnimatedTooltip({
  items,
  className,
  background = 'hsla(43, 97%, 60%, 1.00)', // 🔥 default yellow
  textColor = '#000000',                      // 🔥 default black text
}: {
  items: TooltipItem[];
  className?: string;
  background?: string;
  textColor?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | string | null>(null);

  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);

  const rotate = useSpring(
    useTransform(x, [-150, 150], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-150, 150], [-60, 60]),
    springConfig
  );

  const handleMouseMove = (event: MouseEvent<any>) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const half = rect.width / 2;
    x.set(offsetX - half);
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      {items.map((item, index) => {
        const avatarSize = 120; // ⬅ your larger avatars

        const avatarContent = item.image ? (
          <img
            onMouseMove={handleMouseMove}
            src={item.image}
            alt={item.name}
            style={{
              objectFit: 'cover',
              width: avatarSize,
              height: avatarSize,
              borderRadius: '999px',
              border: '4px solid #FFFFFF',
              boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          />
        ) : (
          <div
            onMouseMove={handleMouseMove}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '999px',
              border: '4px solid #FFFFFF',
              background: 'linear-gradient(135deg,#111827,#374151)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F9FAFB',
              fontSize: 34,
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
            }}
          >
            {item.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map(w => w[0]?.toUpperCase())
              .join('')}
          </div>
        );

        return (
          <div
            key={item.id}
            style={{
              position: 'relative',
              cursor: 'pointer',
              marginRight: index === items.length - 1 ? 0 : -40, // overlap
            }}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 15,
                    },
                  }}
                  exit={{ opacity: 0, y: 30, scale: 0.7 }}
                  style={{
                    translateX,
                    rotate,
                    position: 'absolute',
                    top: -110,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background,          // 🎨 uses prop
                    color: textColor,    // 🎨 uses prop
                    padding: '10px 18px',
                    borderRadius: 12,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    zIndex: 50,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      marginBottom: 2,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: 'rgba(0,0,0,0.7)', // slightly softer black
                    }}
                  >
                    {item.designation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {item.href ? (
              <Link to={item.href} style={{ textDecoration: 'none' }}>
                {avatarContent}
              </Link>
            ) : (
              avatarContent
            )}
          </div>
        );
      })}
    </div>
  );
}
