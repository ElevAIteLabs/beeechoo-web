// src/pages/Media.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/ui/event-card";
import { theme } from "../theme";

type MediaCompany = {
  id: string;
  name: string;
  city: string;
  focus: string;
  services: string[];
  image?: string;
  pricing?: string; // e.g. "from ₹50,000"
};

const DUMMY_MEDIA_ROWS: MediaCompany[] = [
  {
    id: "media-1",
    name: "BrightFrame Media House",
    city: "Bengaluru",
    focus: "Production Studio",
    services: ["Brand films", "Ad shoots", "Social reels"],
    image:
      "https://vgstudios.in/wp-content/uploads/2020/01/Studio-on-rent-for-photography-vgstudios.jpg",
    pricing: "from ₹50,000",
  },
  {
    id: "media-2",
    name: "Urban Reach Advertising",
    city: "Mumbai",
    focus: "Digital Media",
    services: ["YouTube shows", "Podcast production", "Livestreams"],
    image:
      "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
    pricing: "from ₹25,000",
  },
  {
    id: "media-3",
    name: "PixelStory Creative Studio",
    city: "New Delhi",
    focus: "Creative Agency",
    services: ["Campaign planning", "Influencer collabs", "Editing"],
    image:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
    pricing: "from ₹1,50,000",
  },
];

export default function Media(): JSX.Element {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState("all");
  const [focusFilter, setFocusFilter] = React.useState("all");

  const cityOptions = React.useMemo(() => {
    const set = new Set<string>();
    DUMMY_MEDIA_ROWS.forEach((m) => set.add(m.city));
    return Array.from(set).sort();
  }, []);

  const focusOptions = React.useMemo(() => {
    const set = new Set<string>();
    DUMMY_MEDIA_ROWS.forEach((m) => set.add(m.focus));
    return Array.from(set).sort();
  }, []);

  const filteredRows = React.useMemo(() => {
    const q = search.toLowerCase();

    return DUMMY_MEDIA_ROWS.filter((m) => {
      if (cityFilter !== "all" && m.city !== cityFilter) return false;
      if (focusFilter !== "all" && m.focus !== focusFilter) return false;

      if (q) {
        const hay = `${m.name} ${m.city} ${m.focus} ${m.services.join(
          " "
        )}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [search, cityFilter, focusFilter]);

  const clearFilters = () => {
    setSearch("");
    setCityFilter("all");
    setFocusFilter("all");
  };

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Media & Production
            </h2>
            <div
              style={{
                color: theme.colors.subtext,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Partner with buzzing media houses and production teams
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
              placeholder="Search media partners..."
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

            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #D1D5DB",
                background: "#fff",
              }}
            >
              <option value="all">All Focus Areas</option>
              {focusOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
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
        <div
          className="be-grid cols-3"
          style={{ gap: 20, alignItems: "stretch" }}
        >
          {filteredRows.map((m) => {
            const pricing = m.pricing ?? "";

            // extract ₹X,XXX
            const amountMatch = pricing.match(/₹[\d,]+/);
            const amount = amountMatch?.[0] ?? pricing.trim();

            const pricingSecondary = " starts at";

            return (
              <EventCard
                key={m.id}
                heading={m.focus}
                description={m.services.join(" • ")}
                date={new Date()} // required but visually replaced by pricing
                imageUrl={
                  m.image ??
                  "https://via.placeholder.com/400x225?text=Media+House"
                }
                imageAlt={m.name}
                eventName={m.name}
                venue={m.city}
                address="Main Road"
                time="" // ignored when pricingPrimary is set
                actionLabel="View Profile"
                organizerName="Media Partner"
                pricingPrimary={amount}
                pricingSecondary={pricingSecondary}
                onActionClick={() => nav(`/media/${m.id}`)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
