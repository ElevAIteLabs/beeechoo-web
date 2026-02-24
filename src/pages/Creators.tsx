// src/pages/Creators.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { listCreators, type CreatorDto } from "../lib/creators";
import { theme } from "../theme";
import { EventCard } from "../components/ui/event-card";
import { Filter, X } from "lucide-react";

const CREATOR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <rect width="100%" height="100%" fill="#FFFBEB"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial" font-size="30" fill="#6B7280">
      Creator
    </text>
  </svg>
`);

function toTitleCase(input?: string | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
function norm(input?: string | null): string {
  return (input ?? "").trim();
}
function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : null;
}

/** ---- Filter Dropdown (collapsible) with checkbox list ---- */
function FilterDropdown({
  title,
  options,
  selected,
  onToggle,
  onClear,
  defaultOpen = false, // ✅ closed by default
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

function FollowersRange({
  min,
  max,
  onChangeMin,
  onChangeMax,
  onClear,
  defaultOpen = false,
}: {
  min: string;
  max: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
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
          Followers
          {(min || max) ? (
            <span style={{ marginLeft: 8, color: "#6B7280", fontWeight: 800 }}>
              ({min || "0"} - {max || "∞"})
            </span>
          ) : null}
        </span>
        <span style={{ fontSize: 12, color: "#6B7280" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6B7280" }}>
              Set min / max followers
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <input
              inputMode="numeric"
              placeholder="Min"
              value={min}
              onChange={(e) => onChangeMin(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #D1D5DB",
                background: "#F9FAFB",
                outline: "none",
              }}
            />
            <input
              inputMode="numeric"
              placeholder="Max"
              value={max}
              onChange={(e) => onChangeMax(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #D1D5DB",
                background: "#F9FAFB",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Creators(): JSX.Element {
  const navigate = useNavigate();

  const [allCreators, setAllCreators] = React.useState<CreatorDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = React.useState<string[]>([]);
  const [selectedSocial, setSelectedSocial] = React.useState<string[]>([]);

  const [minFollowers, setMinFollowers] = React.useState<string>("");
  const [maxFollowers, setMaxFollowers] = React.useState<string>("");

  // Responsive: Filter visibility
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ IMPORTANT: revert to 100 like your working page
        const data = await listCreators(100);
        setAllCreators(data.data || []);
      } catch (e: any) {
        console.error("Creators load error", e);
        setError("Unable to load creators right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const socialOptions = ["Instagram", "YouTube"];
  const genderOptions = ["Male", "Female", "Other"];

  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    allCreators.forEach((c: any) => {
      set.add(toTitleCase(norm(c.category) || "Other"));
    });
    return Array.from(set).sort();
  }, [allCreators]);

  const locationOptions = React.useMemo(() => {
    const set = new Set<string>();
    allCreators.forEach((c: any) => {
      const parts: string[] = [];
      if (norm(c.area)) parts.push(norm(c.area));
      if (norm(c.city)) parts.push(norm(c.city));
      if (!parts.length && norm(c.location)) parts.push(norm(c.location));
      const joined = parts.join(" • ");
      if (joined.trim()) set.add(toTitleCase(joined));
    });
    return Array.from(set).sort();
  }, [allCreators]);

  const languageOptions = React.useMemo(() => {
    const set = new Set<string>();
    allCreators.forEach((c: any) => {
      const langs = c.languages ?? c.language ?? [];
      if (Array.isArray(langs)) {
        langs.forEach((l: any) => {
          const s = norm(String(l));
          if (s) set.add(toTitleCase(s));
        });
      } else {
        const s = norm(String(langs));
        if (s) s.split(",").map((x) => x.trim()).filter(Boolean).forEach((x) => set.add(toTitleCase(x)));
      }
    });
    return Array.from(set).sort();
  }, [allCreators]);

  const toggle = (value: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
    setFn((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const filteredCreators = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const minF = minFollowers.trim() ? Number(minFollowers) : null;
    const maxF = maxFollowers.trim() ? Number(maxFollowers) : null;

    return allCreators.filter((c: any) => {
      const cat = toTitleCase(norm(c.category) || "Other");

      if (q) {
        const hay = `${c.name ?? ""} ${c.bio ?? ""} ${c.category ?? ""} ${c.city ?? ""} ${c.area ?? ""} ${c.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(cat)) return false;

      if (selectedLocations.length > 0) {
        const parts: string[] = [];
        if (norm(c.area)) parts.push(norm(c.area));
        if (norm(c.city)) parts.push(norm(c.city));
        if (!parts.length && norm(c.location)) parts.push(norm(c.location));
        const loc = toTitleCase(parts.join(" • "));
        if (!selectedLocations.includes(loc)) return false;
      }

      if (selectedLanguages.length > 0) {
        const langs = c.languages ?? c.language ?? [];
        const normalized: string[] = Array.isArray(langs)
          ? langs.map((x: any) => toTitleCase(norm(String(x)))).filter(Boolean)
          : norm(String(langs))
            .split(",")
            .map((x) => toTitleCase(x.trim()))
            .filter(Boolean);

        if (!selectedLanguages.some((l) => normalized.includes(l))) return false;
      }

      if (selectedGenders.length > 0) {
        const g = toTitleCase(norm(c.gender || ""));
        if (!g || !selectedGenders.includes(g)) return false;
      }

      if (selectedSocial.length > 0) {
        const hasInstagram = !!(norm(c.instagram) || norm(c.instagramUrl) || norm(c.instagramHandle) || norm(c?.socials?.instagram));
        const hasYouTube = !!(norm(c.youtube) || norm(c.youtubeUrl) || norm(c.youtubeChannel) || norm(c?.socials?.youtube));

        if (selectedSocial.includes("Instagram") && !hasInstagram) return false;
        if (selectedSocial.includes("YouTube") && !hasYouTube) return false;
      }

      if (minF !== null || maxF !== null) {
        const followers =
          toNum(c.followersCount) ??
          toNum(c.followers) ??
          toNum(c.followerCount) ??
          toNum(c.instagramFollowers) ??
          toNum(c.youtubeSubscribers);

        if (followers === null) return false;
        if (minF !== null && followers < minF) return false;
        if (maxF !== null && followers > maxF) return false;
      }

      return true;
    });
  }, [
    allCreators,
    search,
    selectedCategories,
    selectedLocations,
    selectedLanguages,
    selectedGenders,
    selectedSocial,
    minFollowers,
    maxFollowers,
  ]);

  const clearAll = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedLanguages([]);
    setSelectedGenders([]);
    setSelectedSocial([]);
    setMinFollowers("");
    setMaxFollowers("");
  };

  if (loading) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Explore Creators</h2>
          <div style={{ marginTop: 12, color: theme.colors.subtext, fontSize: 13 }}>Loading creators…</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Explore Creators</h2>
          <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13 }}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", backgroundColor: "#FFFBEB", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Explore Creators</h2>
          <div style={{ color: theme.colors.subtext, fontSize: 13, marginTop: 4 }}>
            Discover real creators hosting unique experiences on BeeEchoo.
          </div>
        </div>

        <div className="creators-layout">
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

          {(!isMobile || showFilters) && (
            <aside style={{ position: isMobile ? "relative" : "sticky", top: 16, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", height: 'fit-content', zIndex: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 10 }}>Search</div>
              <input
                type="text"
                placeholder="Search creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #D1D5DB", background: "#F9FAFB", outline: "none" }}
              />

              <FilterDropdown
                title="Social Media"
                options={socialOptions}
                selected={selectedSocial}
                onToggle={(v) => toggle(v, setSelectedSocial)}
                onClear={() => setSelectedSocial([])}
                defaultOpen={false}
              />

              <FollowersRange
                min={minFollowers}
                max={maxFollowers}
                onChangeMin={setMinFollowers}
                onChangeMax={setMaxFollowers}
                onClear={() => { setMinFollowers(""); setMaxFollowers(""); }}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Gender"
                options={genderOptions}
                selected={selectedGenders}
                onToggle={(v) => toggle(v, setSelectedGenders)}
                onClear={() => setSelectedGenders([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Languages"
                options={languageOptions}
                selected={selectedLanguages}
                onToggle={(v) => toggle(v, setSelectedLanguages)}
                onClear={() => setSelectedLanguages([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Location"
                options={locationOptions}
                selected={selectedLocations}
                onToggle={(v) => toggle(v, setSelectedLocations)}
                onClear={() => setSelectedLocations([])}
                defaultOpen={false}
              />

              <FilterDropdown
                title="Category"
                options={categoryOptions}
                selected={selectedCategories}
                onToggle={(v) => toggle(v, setSelectedCategories)}
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
            <div style={{ marginBottom: 12, color: "#6B7280", fontSize: 13, fontWeight: 800 }}>
              Showing {filteredCreators.length} creator{filteredCreators.length === 1 ? "" : "s"}
            </div>

            <div className="be-grid cols-3" style={{ alignItems: "stretch" }}>
              {filteredCreators.map((c: any) => {
                const imageUrl = c.avatarUrl || c.profileImageUrl || CREATOR_FALLBACK;
                const categoryLabel = norm(c.category) ? toTitleCase(c.category) : "Creator";

                const locationParts: string[] = [];
                if (norm(c.area)) locationParts.push(norm(c.area));
                if (norm(c.city)) locationParts.push(norm(c.city));
                if (!locationParts.length && norm(c.location)) locationParts.push(norm(c.location));
                const location = locationParts.join(" • ") || "Based in India";

                return (
                  <div key={c.id} style={{ width: "100%", height: "100%" }}>
                    <EventCard
                      heading={categoryLabel}
                      description={c.bio ?? ""}
                      date={new Date()}
                      imageUrl={imageUrl}
                      imageAlt={c.name ?? ""}
                      eventName={c.name ?? ""}
                      venue={categoryLabel}
                      address={location}
                      time={categoryLabel}
                      actionLabel="View Creator"
                      organizerName={categoryLabel}
                      onActionClick={() => navigate(`/creators/${c.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {filteredCreators.length === 0 && (
              <div style={{ marginTop: 18, padding: 16, borderRadius: 14, border: "1px dashed #E5E7EB", background: "#fff", color: "#6B7280", fontWeight: 800, fontSize: 13 }}>
                No creators match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .creators-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .creators-layout {
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
