// src/pages/Studios.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import { EventCard } from "../components/ui/event-card";
import { Filter, X } from "lucide-react";
import { listStudios, type StudioDto } from "../lib/studios";

/** ------------------------- Helpers ------------------------- **/
const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) || "https://api.beeechoo.com";

function normalizeBannerPath(raw?: string | null): string | null {
  if (!raw) return null;
  const p = raw.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${path}`;
}

function getStudioImage(s: StudioDto): string | null {
  return (
    normalizeBannerPath((s as any).coverImage) ??
    ((s as any).photos && (s as any).photos.length > 0
      ? normalizeBannerPath((s as any).photos[0])
      : null)
  );
}

function toTitleCase(input?: string | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function norm(input?: string | null): string {
  return (input ?? "").trim();
}

// ✅ fallback that never fails (no DNS like via.placeholder)
const STUDIO_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <rect width="100%" height="100%" fill="#FFFBEB"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial" font-size="30" fill="#6B7280">
      Studio
    </text>
  </svg>
`);

/** ---- Filter Dropdown (collapsible) with checkbox list ---- */
function FilterDropdown({
  title,
  options,
  selected,
  onToggle,
  onClear,
  defaultOpen = false,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  defaultOpen?: boolean;
}): JSX.Element {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        marginTop: 12,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 12px",
          background: open ? "#FFFBEB" : "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 900,
          color: "#111827",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#FFFBEB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = open ? "#FFFBEB" : "#fff";
        }}
      >
        <span style={{ fontSize: 13 }}>
          {title}
          {selected.length > 0 ? (
            <span style={{ marginLeft: 8, color: "#6B7280", fontWeight: 800 }}>
              ({selected.length})
            </span>
          ) : null}
        </span>
        <span style={{ fontSize: 12, color: "#6B7280" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6B7280" }}>
              Select {title.toLowerCase()}
            </div>
            <button
              type="button"
              onClick={onClear}
              style={{
                border: "none",
                background: "transparent",
                fontWeight: 900,
                fontSize: 12,
                cursor: "pointer",
                color: "#6B7280",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              Clear
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 8, maxHeight: 260, overflow: "auto" }}>
            {options.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>No options</div>
            ) : (
              options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 10px",
                      borderRadius: 12,
                      cursor: "pointer",
                      userSelect: "none",
                      border: checked ? "1px solid #F6B100" : "1px solid #E5E7EB",
                      background: checked ? "#FFFBEB" : "#fff",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.borderColor = "#F6B100";
                        e.currentTarget.style.background = "#FFFBEB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(opt)}
                      style={{
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                        accentColor: theme.colors.primary,
                      }}
                    />
                    <span style={{ fontWeight: 900, fontSize: 13, color: "#111827" }}>
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Studios(): JSX.Element {
  const nav = useNavigate();

  const [studios, setStudios] = React.useState<StudioDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search
  const [search, setSearch] = React.useState("");

  // ✅ New filters
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);
  const [sortPrice, setSortPrice] = React.useState<"none" | "low" | "high">("none");

  // Responsive: Filter visibility
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listStudios(100);
        setStudios(res.data || []);
      } catch (err) {
        console.error("Failed to load studios", err);
        setError("Unable to load studios right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Location options (city)
  const locationOptions = React.useMemo(() => {
    const set = new Set<string>();
    studios.forEach((s: any) => {
      const city = norm(s.city);
      if (city) set.add(toTitleCase(city));
    });
    return Array.from(set).sort();
  }, [studios]);

  // Amenities options (attempt to read from common fields; no backend change)
  // Supports: s.amenities (string[]), s.features (string[]), s.facilities (string[]), s.tags (string[])
  const amenitiesOptions = React.useMemo(() => {
    const set = new Set<string>();
    studios.forEach((s: any) => {
      const raw =
        s.amenities ?? s.features ?? s.facilities ?? s.tags ?? s.studioAmenities ?? [];
      const arr = Array.isArray(raw)
        ? raw
        : String(raw)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

      arr.forEach((a: string) => {
        const v = toTitleCase(norm(a));
        if (v) set.add(v);
      });
    });
    return Array.from(set).sort();
  }, [studios]);

  const toggle = (value: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
    setFn((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const filteredStudios = React.useMemo(() => {
    const q = search.toLowerCase().trim();

    const base = studios.filter((s: any) => {
      // location filter
      if (selectedLocations.length > 0) {
        const city = toTitleCase(norm(s.city));
        if (!selectedLocations.includes(city)) return false;
      }

      // amenities filter
      if (selectedAmenities.length > 0) {
        const raw =
          s.amenities ?? s.features ?? s.facilities ?? s.tags ?? s.studioAmenities ?? [];
        const arr = Array.isArray(raw)
          ? raw
          : String(raw)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

        const normalized = arr.map((x: string) => toTitleCase(norm(x)));
        const ok = selectedAmenities.every((a) => normalized.includes(a));
        if (!ok) return false;
      }

      // search
      if (q) {
        const haystack = `${s.title ?? ""} ${s.city ?? ""} ${s.venueName ?? ""} ${(s.categories ?? []).join(" ")}`
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    // price sort (client-side)
    const sorted = [...base].sort((a: any, b: any) => {
      const pa = Number(a.hourlyRate ?? a.pricePerHour ?? 0) || 0;
      const pb = Number(b.hourlyRate ?? b.pricePerHour ?? 0) || 0;
      if (sortPrice === "low") return pa - pb;
      if (sortPrice === "high") return pb - pa;
      return 0;
    });

    return sorted;
  }, [studios, search, selectedLocations, selectedAmenities, sortPrice]);

  const clearAll = () => {
    setSearch("");
    setSelectedLocations([]);
    setSelectedAmenities([]);
    setSortPrice("none");
  };

  /** ---- Loading / Error ---- */
  if (loading) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            backgroundColor: "#FFFBEB",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: "32px 24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
            Explore Studios & Spaces
          </h2>
          <div style={{ marginTop: 12, color: theme.colors.subtext, fontSize: 13 }}>
            Loading studios…
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            backgroundColor: "#FFFBEB",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: "32px 24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
            Explore Studios & Spaces
          </h2>
          <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13 }}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div
        style={{
          maxWidth: 1360, // ✅ expanded width
          margin: "0 auto",
          backgroundColor: "#FFFBEB",
          borderRadius: 16,
          border: "1px solid #E5E7EB",
          padding: "32px 24px",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
            Explore Studios & Spaces
          </h2>
          <div style={{ color: theme.colors.subtext, fontSize: 13, marginTop: 4 }}>
            Discover buzzing photography, video and recording studios
          </div>
        </div>

        {/* LAYOUT: sidebar + content */}
        <div className="studios-layout">
          {/* MOBILE FILTER TOGGLE */}
          {isMobile && (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#111827',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                {showFilters ? <X size={18} /> : <Filter size={18} />}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          )}

          {/* LEFT SIDEBAR */}
          {(!isMobile || showFilters) && (
            <aside
              style={{
                position: isMobile ? "relative" : "sticky",
                top: 16,
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                zIndex: 10,
                height: 'fit-content'
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 10 }}>
                Search
              </div>
              <input
                type="text"
                placeholder="Search studios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #D1D5DB",
                  background: "#F9FAFB",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary;
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,177,0,0.18)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#D1D5DB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Location */}
              <FilterDropdown
                title="Location"
                options={locationOptions}
                selected={selectedLocations}
                onToggle={(v) => toggle(v, setSelectedLocations)}
                onClear={() => setSelectedLocations([])}
                defaultOpen={false}
              />

              {/* Amenities */}
              <FilterDropdown
                title="Amenities"
                options={amenitiesOptions}
                selected={selectedAmenities}
                onToggle={(v) => toggle(v, setSelectedAmenities)}
                onClear={() => setSelectedAmenities([])}
                defaultOpen={false}
              />

              {/* Price sort */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 8 }}>
                  Sort By Price
                </div>
                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #D1D5DB",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="none">Default</option>
                  <option value="low">Low → High</option>
                  <option value="high">High → Low</option>
                </select>
              </div>

              {/* Clear all */}
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    if (isMobile) setShowFilters(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${theme.colors.primary}`,
                    background: "#FFFBEB",
                    color: "#111827",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            </aside>
          )}

          {/* RIGHT CONTENT */}
          <div>
            <div style={{ marginBottom: 12, color: "#6B7280", fontSize: 13, fontWeight: 800 }}>
              Showing {filteredStudios.length} studio{filteredStudios.length === 1 ? "" : "s"}
            </div>

            {/* ✅ 3 cards per row always */}
            <div className="be-grid cols-3" style={{ alignItems: "stretch" }}>
              {filteredStudios.map((s: any) => {
                const imageUrl = getStudioImage(s) ?? STUDIO_FALLBACK;

                const categoryName = s.categories?.[0] ? toTitleCase(s.categories[0]) : "Studio";

                const hourly = Number(s.hourlyRate ?? s.pricePerHour ?? 0) || 0;
                const pricingPrimary = hourly ? `₹${hourly.toLocaleString()}` : undefined;
                const pricingSecondary = hourly ? "/ hour" : undefined;

                return (
                  <div key={s.id} style={{ width: "100%", height: "100%" }}>
                    <EventCard
                      heading={categoryName}
                      description=""
                      date={new Date()}
                      imageUrl={imageUrl}
                      imageAlt={s.title}
                      eventName={toTitleCase(s.title)}
                      venue={s.venueName ? toTitleCase(s.venueName) : toTitleCase(s.address)}
                      address={s.city ? toTitleCase(s.city) : ""}
                      time=""
                      actionLabel="View Studio"
                      organizerName="Verified Studio"
                      pricingPrimary={pricingPrimary}
                      pricingSecondary={pricingSecondary}
                      onActionClick={() => nav(`/studios/${s.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {filteredStudios.length === 0 && (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 14,
                  border: "1px dashed #E5E7EB",
                  background: "#fff",
                  color: "#6B7280",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                No studios match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .studios-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .studios-layout {
            grid-template-columns: 270px 1fr;
          }
        }
      `}</style>
    </section>
  );
}

// --- Hook Definition ---
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}
