// src/pages/Campaigns.tsx
import React, { type JSX } from "react";
//import { useNavigate } from "react-router-dom";
import { listCampaigns, markInterested, type CampaignDto } from "../lib/campaigns";
import { getToken } from "../lib/auth";
import { theme } from "../theme";
import { EventCard } from "../components/ui/event-card";
import { Filter, X } from "lucide-react";

/** ---- Helpers (same spirit as your working code) ---- */
function toTitleCase(input?: string | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function clampText(text: string, max = 90): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

function remainingLabel(expiresAt: string): string {
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Expired";

  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m left`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h left`;

  const days = Math.floor(hrs / 24);
  return `${days}d left`;
}

// ✅ Safe fallback (no external image request)
const CAMPAIGN_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <rect width="100%" height="100%" fill="#FFFBEB"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial" font-size="30" fill="#6B7280">
      Bee Echoo Campaign
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
        onMouseEnter={(e) => (e.currentTarget.style.background = "#FFFBEB")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "#FFFBEB" : "#fff")}
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

export default function Campaigns(): JSX.Element {
  //const nav = useNavigate();

  const [rows, setRows] = React.useState<CampaignDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Search stays same
  const [search, setSearch] = React.useState("");

  // ✅ Sidebar checkbox filters
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = React.useState<string[]>([]);
  const [selectedInterest, setSelectedInterest] = React.useState<string[]>([]);

  // Responsive: Filter visibility
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showFilters, setShowFilters] = React.useState(false);

  const [busyId, setBusyId] = React.useState<string | null>(null);

  /** ---- Load Campaigns (same as your working code) ---- */
  React.useEffect(() => {
    (async () => {
      try {
        const res = await listCampaigns(50);
        setRows((res?.data as CampaignDto[]) || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** ---- Filter options ---- */
  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((c) => {
      if (c.category) set.add(toTitleCase(c.category));
    });
    return Array.from(set).sort();
  }, [rows]);

  const expiryOptions = React.useMemo(() => {
    // buckets (derived, no backend)
    return ["Ends ≤ 1 day", "Ends ≤ 3 days", "Ends ≤ 7 days", "Ends > 7 days"];
  }, []);

  const interestOptions = React.useMemo(() => {
    return ["0–10 interested", "11–50 interested", "51+ interested"];
  }, []);

  const toggleInList = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  /** ---- Apply filters (keeps your old logic + adds side filters) ---- */
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();

    return rows.filter((c) => {
      // category multi
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(toTitleCase(c.category))) return false;
      }

      // expiry bucket
      if (selectedExpiry.length > 0) {
        const end = new Date(c.expiresAt).getTime();
        const now = Date.now();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        const bucket =
          diffDays <= 1 && diffDays >= 0
            ? "Ends ≤ 1 day"
            : diffDays <= 3 && diffDays >= 0
              ? "Ends ≤ 3 days"
              : diffDays <= 7 && diffDays >= 0
                ? "Ends ≤ 7 days"
                : "Ends > 7 days";

        if (!selectedExpiry.includes(bucket)) return false;
      }

      // interest bucket
      if (selectedInterest.length > 0) {
        const n = c.interestCount || 0;
        const bucket = n <= 10 ? "0–10 interested" : n <= 50 ? "11–50 interested" : "51+ interested";
        if (!selectedInterest.includes(bucket)) return false;
      }

      // search (same idea)
      if (q) {
        const haystack = `${c.title} ${c.category} ${c.description || ""} ${c.hostName || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, search, selectedCategories, selectedExpiry, selectedInterest]);

  const clearAll = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedExpiry([]);
    setSelectedInterest([]);
  };

  /** ---- Interested (same as your working code) ---- */
  async function onInterested(campaignId: string) {
    const token = getToken();
    if (!token) {
      alert("Please sign in to mark interest.");
      return;
    }

    try {
      setBusyId(campaignId);
      await markInterested(token, campaignId);

      setRows((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, interestCount: (c.interestCount || 0) + 1 } : c
        )
      );

      alert("✅ Interest submitted. The host will reach out!");
    } catch (e: any) {
      alert(e?.message || "Failed");
    } finally {
      setBusyId(null);
    }
  }

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
            Live Campaigns
          </h2>
          <div style={{ marginTop: 12, color: theme.colors.subtext, fontSize: 13 }}>
            Loading campaigns…
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
            Live Campaigns
          </h2>
          <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13 }}>{error}</div>
        </div>
      </section>
    );
  }

  /** ---- MAIN UI (left sidebar + 3 grid) ---- */
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
        {/* HEADER */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
            Live Campaigns
          </h2>
          <div style={{ color: theme.colors.subtext, fontSize: 13, marginTop: 4 }}>
            Find gigs posted by hosts and tap Interested to join
          </div>
        </div>

        <div className="campaigns-layout">
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
                height: 'fit-content',
                zIndex: 10
              }}
            >
              {/* Search */}
              <div style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 10 }}>
                Search
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
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
                title="Categories"
                options={categoryOptions}
                selected={selectedCategories}
                onToggle={(v) => toggleInList(setSelectedCategories, v)}
                onClear={() => setSelectedCategories([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Expiry"
                options={expiryOptions}
                selected={selectedExpiry}
                onToggle={(v) => toggleInList(setSelectedExpiry, v)}
                onClear={() => setSelectedExpiry([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Interest"
                options={interestOptions}
                selected={selectedInterest}
                onToggle={(v) => toggleInList(setSelectedInterest, v)}
                onClear={() => setSelectedInterest([])}
                defaultOpen={false}
              />

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
            {/* ✅ 3 cards per row fixed -> Now Responsive */}
            <div className="be-grid cols-3" style={{ alignItems: "stretch" }}>
              {filtered.map((c) => {
                const expiresDate = c.expiresAt ? new Date(c.expiresAt) : new Date();
                const time = c.expiresAt
                  ? new Date(c.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";

                const imageUrl = c.imageUrl || CAMPAIGN_FALLBACK;

                const heading = c.category ? toTitleCase(c.category) : "Campaign";
                const organizerName =
                  c.hostName && c.hostName.trim() ? toTitleCase(c.hostName) : undefined;

                const interestCount = c.interestCount || 0;
                const desc =
                  (c.description && clampText(c.description, 90)) ||
                  `Tap Interested to join • ${interestCount} interested`;

                const venueLabel = organizerName ? `Posted by ${organizerName}` : "Posted by Host";
                const addressLabel = `${remainingLabel(c.expiresAt)} • ${interestCount} interested`;

                return (
                  <div key={c.id} style={{ width: "100%", height: "100%" }}>
                    <EventCard
                      heading={heading}
                      description={desc}
                      date={expiresDate}
                      imageUrl={imageUrl}
                      imageAlt={toTitleCase(c.title)}
                      eventName={toTitleCase(c.title)}
                      venue={venueLabel}
                      address={addressLabel}
                      time={time}
                      actionLabel={busyId === c.id ? "Saving…" : "Interested"}
                      organizerName={organizerName}
                      onActionClick={() => onInterested(c.id)}
                    />
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
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
                No campaigns match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .campaigns-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .campaigns-layout {
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
