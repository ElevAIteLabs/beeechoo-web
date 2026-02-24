// src/pages/Events.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { listEvents } from "../lib/events";
import { theme } from "../theme";
import { EventCard } from "../components/ui/event-card";
import { Filter, X } from "lucide-react";

/** ---- Types ---- */
type EventDto = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  status: "scheduled" | "cancelled" | "completed";
  banner?: string;
  bannerUrl?: string | null;
  categories: string[];
  ticketLink?: string;
  sponsorships?: any;
  organizerName?: string | null;
};

/** ---- Banner Helpers ---- */
const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  "https://api.beeechoo.com";

function normalizeBannerPath(raw?: string | null): string | null {
  if (!raw) return null;
  const p = raw.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${path}`;
}

/** ---- Helpers ---- */
function toTitleCase(input?: string | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function splitLocation(location?: string | null): { venue: string; city: string } {
  if (!location) return { venue: "", city: "" };
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { venue: "", city: "" };
  if (parts.length === 1) return { venue: "", city: parts[0] };
  const city = parts[parts.length - 1];
  const venue = parts.slice(0, -1).join(", ");
  return { venue, city };
}

/** ---- Filter Dropdown (collapsible) with checkbox list ---- */
function FilterDropdown({
  title,
  options,
  selected,
  onToggle,
  onClear,
  defaultOpen = true,
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
                    <span style={{ fontWeight: 900, fontSize: 13, color: "#111827" }}>{opt}</span>
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

export default function Events(): JSX.Element {
  const nav = useNavigate();

  const [rows, setRows] = React.useState<EventDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");

  const [selectedCities, setSelectedCities] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await listEvents(50);
        setRows((res?.data as EventDto[]) || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cityOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((e) => {
      if (e.location) {
        const { city } = splitLocation(e.location);
        if (city) set.add(toTitleCase(city));
      }
    });
    return Array.from(set).sort();
  }, [rows]);

  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((e) => {
      (e.categories || []).forEach((c) => {
        if (c) set.add(toTitleCase(c));
      });
    });
    return Array.from(set).sort();
  }, [rows]);

  const toggleCity = (c: string) => {
    setSelectedCities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const filteredEvents = React.useMemo(() => {
    const q = search.toLowerCase();

    return rows.filter((e) => {
      if (selectedCities.length > 0) {
        const { city } = splitLocation(e.location);
        const normalized = toTitleCase(city);
        if (!selectedCities.includes(normalized)) return false;
      }

      if (selectedCategories.length > 0) {
        const hasCat = (e.categories || []).some((c) =>
          selectedCategories.includes(toTitleCase(c))
        );
        if (!hasCat) return false;
      }

      if (q) {
        const haystack = `${e.title} ${e.location || ""} ${e.description || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, search, selectedCities, selectedCategories]);

  const clearAll = () => {
    setSearch("");
    setSelectedCities([]);
    setSelectedCategories([]);
  };

  if (loading) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Events & Shows</h2>
          <div style={{ marginTop: 12, color: theme.colors.subtext, fontSize: 13 }}>Loading events…</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Events & Shows</h2>
          <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13 }}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Events & Shows</h2>
        </div>

        <div className="events-layout">
          {isMobile && (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#111827",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                {showFilters ? <X size={18} /> : <Filter size={18} />}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          )}

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
                height: "fit-content",
                zIndex: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 10 }}>
                Search
              </div>
              <input
                type="text"
                placeholder="Search events..."
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

              <FilterDropdown
                title="Cities"
                options={cityOptions}
                selected={selectedCities}
                onToggle={toggleCity}
                onClear={() => setSelectedCities([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Categories"
                options={categoryOptions}
                selected={selectedCategories}
                onToggle={toggleCategory}
                onClear={() => setSelectedCategories([])}
                defaultOpen={false}
              />

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

          <div>
            {/* ✅ Grid now responsive via CSS below */}
            <div className="be-grid cols-3" style={{ alignItems: "stretch" }}>
              {filteredEvents.map((e) => {
                const bannerSrc = normalizeBannerPath((e as any).bannerUrl ?? e.banner ?? null);
                const { venue, city } = splitLocation(e.location);
                const date = e.startAt ? new Date(e.startAt) : new Date();

                const imageUrl =
                  bannerSrc ?? "https://via.placeholder.com/400x225?text=Bee+Echoo+Event";

                const venueLabel = venue?.trim() ? toTitleCase(venue) : "Venue TBA";
                const addressLabel = city?.trim() ? toTitleCase(city) : "Address TBA";

                const mainCategory = e.categories?.[0];

                const organizerName =
                  e.organizerName && e.organizerName.trim()
                    ? toTitleCase(e.organizerName)
                    : undefined;

                return (
                  <div key={e.id} className="event-grid-item" style={{ width: "100%", height: "100%" }}>
                    <EventCard
                      heading={mainCategory ? toTitleCase(mainCategory) : "Event"}
                      description=""
                      date={date}
                      imageUrl={imageUrl}
                      imageAlt={toTitleCase(e.title)}
                      eventName={toTitleCase(e.title)}
                      venue={venueLabel}
                      address={addressLabel}
                      time={
                        e.startAt
                          ? new Date(e.startAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""
                      }
                      actionLabel="Get Details"
                      organizerName={organizerName}
                      onActionClick={() => nav(`/events/${e.id}`, { state: { event: e } })}
                    />
                  </div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
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
                No events match your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .events-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .events-layout {
            grid-template-columns: 270px 1fr;
          }
        }

        /* ✅ MOBILE CARD SIZING + GRID */
        /* Assumption: .be-grid is display:grid. We override columns safely. */
        .be-grid.cols-3 {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr; /* default = mobile: 1 card per row */
        }

        /* tablets: 2 cards */
        @media (min-width: 640px) {
          .be-grid.cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* desktop: 3 cards */
        @media (min-width: 1024px) {
          .be-grid.cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* prevent card overflow inside grid */
        .event-grid-item {
          min-width: 0;
        }

        /* optional: slightly tighter padding in container for very small phones */
        @media (max-width: 420px) {
          .be-grid.cols-3 {
            gap: 12px;
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
