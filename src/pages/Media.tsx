// src/pages/Media.tsx
import React, { type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EventCard } from "../components/ui/event-card";
import { theme } from "../theme";
import MagazineCategory from "./MagazineCategory";

/* ─── category definitions ─── */
type MediaCategory = {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
  gradient: string;
  color: string;
};

const MEDIA_CATEGORIES: MediaCategory[] = [
  {
    id: "magazines",
    label: "Magazines",
    description: "Print & digital magazine advertising",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Stacked magazine pages */}
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
        <rect x="11" y="12" width="6" height="4" rx="0.5" />
        <line x1="11" y1="18" x2="17" y2="18" />
      </svg>
    ),
  },
  {
    id: "newspapers",
    label: "Newspapers",
    description: "National & regional newspaper ads",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Newspaper with fold */}
        <path d="M4 4h16a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="7" y1="12" x2="11" y2="12" />
        <line x1="7" y1="15" x2="11" y2="15" />
        <rect x="13" y="11" width="4" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "television",
    label: "Television",
    description: "TV commercials & sponsored content",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Classic TV with antenna */}
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M8 7l4-5 4 5" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <polygon points="10,11 10,17 15,14" />
      </svg>
    ),
  },
  {
    id: "cinema",
    label: "Cinema",
    description: "In-theater ads & movie promotions",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Clapperboard */}
        <path d="M4 4l3 3" />
        <path d="M9 4l3 3" />
        <path d="M14 4l3 3" />
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M2 7h20V4H2v3z" />
        <circle cx="12" cy="14" r="3" />
        <circle cx="12" cy="14" r="1" />
      </svg>
    ),
  },
  {
    id: "outdoor",
    label: "Outdoor",
    description: "Billboards, hoardings & transit ads",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Billboard on post */}
        <rect x="2" y="3" width="20" height="11" rx="1.5" />
        <line x1="9" y1="14" x2="9" y2="21" />
        <line x1="15" y1="14" x2="15" y2="21" />
        <line x1="6" y1="21" x2="18" y2="21" />
        <line x1="5" y1="7" x2="13" y2="7" />
        <line x1="5" y1="10" x2="10" y2="10" />
        <rect x="15" y="5" width="4" height="4" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "digital",
    label: "Digital",
    description: "Social media, web & app advertising",
    gradient: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
    color: "#D97706",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Globe with cursor */}
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
        <path d="M17 17l4 4" strokeWidth="2.2" />
      </svg>
    ),
  },
];

/* ─── dummy products mapped to categories ─── */
type MediaCompany = {
  id: string;
  name: string;
  city: string;
  focus: string;
  services: string[];
  image?: string;
  pricing?: string;
  category: string; // which category this belongs to
};

const DUMMY_MEDIA_ROWS: MediaCompany[] = [
  // Magazines
  {
    id: "media-mag-1", name: "India Today Group", city: "New Delhi", focus: "Print Advertising",
    services: ["Full-page ads", "Half-page ads", "Sponsored features"],
    image: "https://images.pexels.com/photos/6335/man-coffee-cup-pen.jpg",
    pricing: "from ₹2,50,000", category: "magazines",
  },
  {
    id: "media-mag-2", name: "Vogue India Media", city: "Mumbai", focus: "Fashion & Lifestyle",
    services: ["Cover inserts", "Ad placements", "Brand stories"],
    image: "https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg",
    pricing: "from ₹5,00,000", category: "magazines",
  },
  {
    id: "media-mag-3", name: "Business World Publications", city: "Bengaluru", focus: "Business & Finance",
    services: ["Advertorials", "Brand mentions", "Cover page ads"],
    image: "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg",
    pricing: "from ₹1,50,000", category: "magazines",
  },

  // Newspapers
  {
    id: "media-news-1", name: "Times of India Network", city: "Mumbai", focus: "National Newspaper",
    services: ["Front-page ads", "Classified ads", "Supplement inserts"],
    image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
    pricing: "from ₹3,00,000", category: "newspapers",
  },
  {
    id: "media-news-2", name: "The Hindu Group", city: "Chennai", focus: "Regional Newspaper",
    services: ["Display ads", "Obituary ads", "Event announcements"],
    image: "https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg",
    pricing: "from ₹1,00,000", category: "newspapers",
  },
  {
    id: "media-news-3", name: "Deccan Herald Press", city: "Bengaluru", focus: "City Newspaper",
    services: ["City supplement ads", "Real estate pages", "Education specials"],
    image: "https://images.pexels.com/photos/6335/man-coffee-cup-pen.jpg",
    pricing: "from ₹75,000", category: "newspapers",
  },

  // Television
  {
    id: "media-tv-1", name: "Star Network Advertising", city: "Mumbai", focus: "Entertainment Channel",
    services: ["Ad spots (10s, 20s, 30s)", "Sponsored segments", "Product placement"],
    image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
    pricing: "from ₹10,00,000", category: "television",
  },
  {
    id: "media-tv-2", name: "Zee Media Solutions", city: "Mumbai", focus: "News & Entertainment",
    services: ["Breaking ticker ads", "Show sponsorships", "Brand integrations"],
    image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
    pricing: "from ₹8,00,000", category: "television",
  },
  {
    id: "media-tv-3", name: "Sun TV Promotions", city: "Chennai", focus: "Regional Television",
    services: ["Regional ad spots", "Festival specials", "Serial sponsorships"],
    image: "https://images.pexels.com/photos/5412001/pexels-photo-5412001.jpeg",
    pricing: "from ₹5,00,000", category: "television",
  },

  // Cinema
  {
    id: "media-cin-1", name: "PVR Cinemas Advertising", city: "New Delhi", focus: "Multiplex Advertising",
    services: ["Pre-show ads", "Lobby branding", "Ticket jacket ads"],
    image: "https://images.pexels.com/photos/7991464/pexels-photo-7991464.jpeg",
    pricing: "from ₹4,00,000", category: "cinema",
  },
  {
    id: "media-cin-2", name: "INOX Media House", city: "Mumbai", focus: "Cinema Hall Branding",
    services: ["Screen ads", "Popcorn bucket branding", "Foyer displays"],
    image: "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg",
    pricing: "from ₹3,50,000", category: "cinema",
  },
  {
    id: "media-cin-3", name: "Cinepolis Ad Solutions", city: "Bengaluru", focus: "In-Cinema Advertising",
    services: ["Curtain-raiser ads", "Experience zone branding", "Combo offers"],
    image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
    pricing: "from ₹2,00,000", category: "cinema",
  },

  // Outdoor
  {
    id: "media-out-1", name: "Times OOH", city: "Mumbai", focus: "Outdoor Advertising",
    services: ["Billboards", "Bus shelters", "Metro station branding"],
    image: "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
    pricing: "from ₹6,00,000", category: "outdoor",
  },
  {
    id: "media-out-2", name: "JCDecaux India", city: "New Delhi", focus: "Street Furniture",
    services: ["Airport displays", "Mall kiosks", "Highway hoardings"],
    image: "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg",
    pricing: "from ₹4,50,000", category: "outdoor",
  },
  {
    id: "media-out-3", name: "Selvel Outdoor Ads", city: "Chennai", focus: "Transit Advertising",
    services: ["Auto wraps", "Bus branding", "Railway station ads"],
    image: "https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg",
    pricing: "from ₹1,50,000", category: "outdoor",
  },

  // Digital
  {
    id: "media-dig-1", name: "BrightFrame Digital", city: "Bengaluru", focus: "Social Media Marketing",
    services: ["Instagram campaigns", "YouTube ads", "Facebook promotions"],
    image: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg",
    pricing: "from ₹50,000", category: "digital",
  },
  {
    id: "media-dig-2", name: "Urban Reach Advertising", city: "Mumbai", focus: "Performance Marketing",
    services: ["Google Ads", "SEO campaigns", "Influencer collaborations"],
    image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
    pricing: "from ₹25,000", category: "digital",
  },
  {
    id: "media-dig-3", name: "PixelStory Creative Studio", city: "New Delhi", focus: "Content Marketing",
    services: ["Blog writing", "Video production", "Podcast creation"],
    image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
    pricing: "from ₹1,50,000", category: "digital",
  },
];

/* ─── Category Grid Component ─── */
function CategoryGrid({ onSelect }: { onSelect: (id: string) => void }): JSX.Element {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          backgroundColor: "#FFFBEB",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          padding: "32px 24px",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Media & Advertising
          </h2>
          <p
            style={{
              color: theme.colors.subtext,
              fontSize: 15,
              marginTop: 8,
              maxWidth: 500,
              margin: "8px auto 0",
              lineHeight: 1.5,
            }}
          >
            Choose a media category to explore advertising partners and opportunities
          </p>
        </div>

        {/* CATEGORY GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {MEDIA_CATEGORIES.map((cat) => {
            const isHovered = hoveredId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isHovered ? "#FFFDF0" : "#FFFBEB",
                  borderRadius: 16,
                  border: isHovered ? "2px solid #F6B100" : "2px solid #FDE68A",
                  padding: "28px 20px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: isHovered
                    ? "0 20px 40px rgba(251,191,36,0.18), 0 0 0 1px #F6B10022"
                    : "0 2px 8px rgba(251,191,36,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Gradient accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)",
                    borderRadius: "16px 16px 0 0",
                    opacity: isHovered ? 1 : 0.5,
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Icon circle */}
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: isHovered ? "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)" : "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    transition: "all 0.3s ease",
                    color: isHovered ? "#FFFFFF" : "#B45309",
                    boxShadow: isHovered
                      ? "0 8px 24px rgba(251,191,36,0.35)"
                      : "0 2px 6px rgba(251,191,36,0.15)",
                  }}
                >
                  {cat.icon}
                </div>

                {/* Label */}
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111827",
                    transition: "color 0.2s ease",
                  }}
                >
                  {cat.label}
                </h3>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#6B7280",
                    lineHeight: 1.4,
                  }}
                >
                  {cat.description}
                </p>

                {/* Explore arrow */}
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    color: isHovered ? "#B45309" : "#9CA3AF",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  Explore
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Products list for a category ─── */
function CategoryProducts({ categoryId }: { categoryId: string }): JSX.Element {
  const nav = useNavigate();

  const category = MEDIA_CATEGORIES.find((c) => c.id === categoryId);
  const products = DUMMY_MEDIA_ROWS.filter((m) => m.category === categoryId);

  const [search, setSearch] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState("all");

  const cityOptions = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((m) => set.add(m.city));
    return Array.from(set).sort();
  }, [products]);

  const filteredRows = React.useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((m) => {
      if (cityFilter !== "all" && m.city !== cityFilter) return false;
      if (q) {
        const hay = `${m.name} ${m.city} ${m.focus} ${m.services.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, cityFilter, products]);

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          backgroundColor: "#FFFBEB",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          padding: "32px 24px",
        }}
      >
        {/* BREADCRUMB & BACK */}
        <button
          onClick={() => nav("/media")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            color: category?.color || theme.colors.primary,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 20,
            padding: 0,
            transition: "opacity 0.2s",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Categories
        </button>

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Category icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: category?.gradient || "#F6B100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: `0 4px 12px ${category?.color || "#F6B100"}33`,
              }}
            >
              {category?.icon}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {category?.label || "Media"} Partners
              </h2>
              <div
                style={{
                  color: theme.colors.subtext,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {category?.description || "Explore media partners"}
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: 14,
            border: "1px solid #E5E7EB",
            marginBottom: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder={`Search ${category?.label || "media"} partners...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 300px",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #D1D5DB",
                background: "#F9FAFB",
              }}
            />

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #D1D5DB",
                background: "#fff",
              }}
            >
              <option value="all">All Cities</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setCityFilter("all");
              }}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                padding: "10px 12px",
                color: "#6B7280",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* GRID OF EVENTCARDS */}
        {filteredRows.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
              color: "#6B7280",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>
              No partners found
            </p>
            <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            className="be-grid cols-3"
            style={{ gap: 20, alignItems: "stretch" }}
          >
            {filteredRows.map((m) => {
              const pricing = m.pricing ?? "";
              const amountMatch = pricing.match(/₹[\d,]+/);
              const amount = amountMatch?.[0] ?? pricing.trim();
              const pricingSecondary = " starts at";

              return (
                <EventCard
                  key={m.id}
                  heading={m.focus}
                  description={m.services.join(" • ")}
                  date={new Date()}
                  imageUrl={
                    m.image ??
                    "https://via.placeholder.com/400x225?text=Media+House"
                  }
                  imageAlt={m.name}
                  eventName={m.name}
                  venue={m.city}
                  address="Main Road"
                  time=""
                  actionLabel="View Profile"
                  organizerName="Media Partner"
                  pricingPrimary={amount}
                  pricingSecondary={pricingSecondary}
                  onActionClick={() => nav(`/media/${m.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Main exported component ─── */
export default function Media(): JSX.Element {
  const nav = useNavigate();
  const { category } = useParams<{ category?: string }>();

  // If a category is selected via the URL, show products
  if (category) {
    const validCategory = MEDIA_CATEGORIES.find((c) => c.id === category);
    if (!validCategory) {
      // Invalid category — redirect back to categories
      nav("/media", { replace: true });
      return <></>;
    }

    if (category === "magazines") {
      return <MagazineCategory />;
    }

    return <CategoryProducts categoryId={category} />;
  }

  // Otherwise, show the category grid
  return <CategoryGrid onSelect={(id) => nav(`/media/category/${id}`)} />;
}
