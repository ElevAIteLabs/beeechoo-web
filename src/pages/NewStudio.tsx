// src/pages/NewStudio.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Users, Plus, X } from "lucide-react";
import { getToken } from "../lib/auth";
import { createStudio } from "../lib/studios";
import { theme } from "../theme";

type ExistingStudio = {
  id: string;
  title: string;
  description?: string | null;
  categories: string[];

  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  mapLink?: string | null;

  maxPeople?: number | null;
  hourlyRate: number;
  minHours: number;

  amenities: string[];
  houseRules?: string | null;
  cancellationPolicy: "flexible" | "standard" | "strict";

  coverImage?: string | null;
  photos: string[];

  status: "active" | "inactive";
  approved: boolean;
};

const API = import.meta.env.VITE_API_BASE as string;

const DEFAULT_CATEGORIES = [
  "Photography",
  "Videography",
  "Podcast",
  "Dance",
  "Music",
  "Fitness",
  "Workshop",
  "Other",
];

const DEFAULT_AMENITIES = [
  "AC",
  "Parking",
  "Restroom",
  "Changing Room",
  "Lighting",
  "Sound System",
  "WiFi",
  "Green Screen",
  "Props",
  "Mirror Wall",
];

async function fetchMe(token: string) {
  const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("Unauthorized");
  return r.json();
}

export default function NewStudio() {
  const nav = useNavigate();
  const location = useLocation() as { state?: { studio?: ExistingStudio } };
  const existingStudio = location.state?.studio;
  const isEdit = !!existingStudio;

  // fields (schema-aligned)
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [venueName, setVenueName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [mapLink, setMapLink] = React.useState("");

  const [maxPeople, setMaxPeople] = React.useState<string>("");
  const [hourlyRate, setHourlyRate] = React.useState<string>(""); // REQUIRED
  const [minHours, setMinHours] = React.useState<string>("1");

  const [mainCategory, setMainCategory] = React.useState("");
  const [customCategory, setCustomCategory] = React.useState("");

  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [amenitySearch, setAmenitySearch] = React.useState("");

  const [houseRules, setHouseRules] = React.useState("");
  const [cancellationPolicy, setCancellationPolicy] = React.useState<"flexible" | "standard" | "strict">(
    "standard",
  );

  // media (schema has coverImage + photos[])
  const [cover, setCover] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);

  // UX
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!existingStudio) return;

    setTitle(existingStudio.title || "");
    setDescription(existingStudio.description || "");

    setVenueName(existingStudio.venueName || "");
    setAddress(existingStudio.address || "");
    setCity(existingStudio.city || "");
    setMapLink(existingStudio.mapLink || "");

    setMaxPeople(existingStudio.maxPeople == null ? "" : String(existingStudio.maxPeople));
    setHourlyRate(existingStudio.hourlyRate == null ? "" : String(existingStudio.hourlyRate));
    setMinHours(existingStudio.minHours == null ? "1" : String(existingStudio.minHours));

    const firstCat = existingStudio.categories?.[0] || "";
    if (firstCat) {
      if (DEFAULT_CATEGORIES.includes(firstCat)) {
        setMainCategory(firstCat);
        setCustomCategory("");
      } else {
        setMainCategory("Other");
        setCustomCategory(firstCat);
      }
    }

    setAmenities(existingStudio.amenities || []);
    setHouseRules(existingStudio.houseRules || "");
    setCancellationPolicy(existingStudio.cancellationPolicy || "standard");

    if (existingStudio.coverImage) setCoverPreview(existingStudio.coverImage);
  }, [existingStudio]);

  React.useEffect(() => {
    if (!cover) return;
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) return;

    setError(null);
    setMsg(null);

    const token = getToken();
    if (!token) {
      alert("Please login again.");
      nav("/", { replace: true });
      return;
    }

    // ✅ KYC rule you asked:
    // If user is already verified host -> allow studio submission without another KYC.
    // If not verified host -> redirect to become-host.
    try {
      const meRes = await fetchMe(token);
      const me = meRes.user;

      const hostKycStatus = me?.hostKycStatus ?? null;
      const isVerifiedHost = me?.isHost === true || hostKycStatus === "verified";

      if (!isVerifiedHost) {
        alert(
          hostKycStatus === "pending"
            ? "Your Host verification is under review. You can list a studio once it is approved."
            : "You must become a verified Host before listing a studio.",
        );
        nav("/become-host");
        return;
      }
    } catch {
      alert("Please login again.");
      nav("/", { replace: true });
      return;
    }

    // validation (schema-aligned)
    if (!title.trim()) return setError("Studio title is required");
    if (!mainCategory) return setError("Please select a category");
    if (!hourlyRate.trim()) return setError("Hourly rate is required");
    const nHourlyRate = Number(hourlyRate);
    if (!Number.isFinite(nHourlyRate) || nHourlyRate <= 0) return setError("Hourly rate must be a valid number > 0");

    const nMinHours = Number(minHours || "1");
    if (!Number.isFinite(nMinHours) || nMinHours <= 0) return setError("Min hours must be a valid number > 0");

    let categoryToSend = mainCategory;
    if (mainCategory === "Other") {
      if (!customCategory.trim()) return setError("Please enter your category");
      categoryToSend = customCategory.trim();
    }

    const nMaxPeople =
      maxPeople.trim() === "" ? null : Number.isFinite(Number(maxPeople)) ? Number(maxPeople) : null;

    if (!cover) return setError("Please upload a cover image");

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append("title", title.trim());
      if (description.trim()) form.append("description", description.trim());

      if (venueName.trim()) form.append("venueName", venueName.trim());
      if (address.trim()) form.append("address", address.trim());
      if (city.trim()) form.append("city", city.trim());
      if (mapLink.trim()) form.append("mapLink", mapLink.trim());

      if (nMaxPeople != null) form.append("maxPeople", String(nMaxPeople));

      // ✅ REQUIRED by backend: hourlyRate
      form.append("hourlyRate", String(nHourlyRate));

      // ✅ optional but schema has it (default=1)
      form.append("minHours", String(nMinHours));

      // categories in your event is sent as single string.
      // For studio schema, categories is String[] -> send as JSON array.
      form.append("categories", JSON.stringify([categoryToSend]));

      // amenities is String[] -> send JSON array
      form.append("amenities", JSON.stringify(amenities));

      if (houseRules.trim()) form.append("houseRules", houseRules.trim());
      form.append("cancellationPolicy", cancellationPolicy);

      // ✅ cover image key should match your schema name "coverImage"
      // Backend should store file path in Studio.coverImage
      form.append("coverImage", cover);

      const res = await createStudio(token, form);
      console.log("[NewStudio] createStudio response:", res);

      setMsg("Studio submitted successfully! Pending admin approval.");
      setTimeout(() => nav("/profile", { replace: true }), 600);
    } catch (err: any) {
      console.error("[NewStudio] save failed:", err);
      setError(err?.message || "Failed to create studio");
    } finally {
      setSubmitting(false);
    }
  }

  const readOnly = isEdit;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>{isEdit ? "Studio Details" : "List Your Studio"}</h1>
          <p style={styles.pageSubtitle}>
            {isEdit ? "Review your studio details." : "Submit your studio. Admin will review & approve."}
          </p>
        </div>
      </div>

      <div style={styles.formWrapper}>
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>

          {error && <div style={styles.errorMessage}>{error}</div>}
          {msg && <div style={styles.successMessage}>{msg}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Studio Title *</label>
            <input
              value={title}
              onChange={(e) => !readOnly && setTitle(e.target.value)}
              placeholder="Enter studio name"
              style={styles.input}
              disabled={readOnly || submitting}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              value={mainCategory}
              onChange={(e) => {
                if (readOnly) return;
                const v = e.target.value;
                setMainCategory(v);
                if (v !== "Other") setCustomCategory("");
              }}
              style={styles.select}
              disabled={readOnly || submitting}
            >
              <option value="">Select a category</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {mainCategory === "Other" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Custom Category</label>
              <input
                value={customCategory}
                onChange={(e) => !readOnly && setCustomCategory(e.target.value)}
                placeholder="Enter your category"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => !readOnly && setDescription(e.target.value)}
              placeholder="Tell us about your studio..."
              rows={4}
              style={styles.textarea}
              disabled={readOnly || submitting}
            />
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Location</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Venue Name</label>
            <input
              value={venueName}
              onChange={(e) => !readOnly && setVenueName(e.target.value)}
              placeholder="e.g., BeeEcho Studio"
              style={styles.input}
              disabled={readOnly || submitting}
            />
          </div>

          <div className="ns-row-grid">
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                value={city}
                onChange={(e) => !readOnly && setCity(e.target.value)}
                placeholder="e.g., Chennai"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MapPin size={16} style={{ marginRight: 6 }} />
                Address
              </label>
              <input
                value={address}
                onChange={(e) => !readOnly && setAddress(e.target.value)}
                placeholder="Full address"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Google Map Link</label>
            <input
              value={mapLink}
              onChange={(e) => !readOnly && setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              style={styles.input}
              disabled={readOnly || submitting}
            />
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Capacity & Pricing</h3>

          <div className="ns-row-grid">
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Users size={16} style={{ marginRight: 6 }} />
                Max People
              </label>
              <input
                value={maxPeople}
                onChange={(e) => !readOnly && setMaxPeople(e.target.value)}
                placeholder="e.g., 20"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Hourly Rate (₹) *</label>
              <input
                value={hourlyRate}
                onChange={(e) => !readOnly && setHourlyRate(e.target.value)}
                placeholder="e.g., 1200"
                inputMode="numeric"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Min Hours</label>
              <input
                value={minHours}
                onChange={(e) => !readOnly && setMinHours(e.target.value)}
                placeholder="1"
                inputMode="numeric"
                style={styles.input}
                disabled={readOnly || submitting}
              />
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Amenities & Policies</h3>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              value={amenitySearch}
              onChange={(e) => setAmenitySearch(e.target.value)}
              placeholder="Search amenities…"
              style={styles.input}
              disabled={readOnly || submitting}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {DEFAULT_AMENITIES.filter((a) =>
              amenitySearch.trim() ? a.toLowerCase().includes(amenitySearch.trim().toLowerCase()) : true,
            ).map((a) => {
              const on = amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  disabled={submitting || readOnly}
                  onClick={() => toggleAmenity(a)}
                  style={{
                    border: `1px solid ${on ? theme.colors.success : theme.colors.border}`,
                    background: on ? "rgba(16,185,129,0.08)" : "#fff",
                    color: on ? "#065f46" : theme.colors.text,
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>House Rules</label>
            <textarea
              value={houseRules}
              onChange={(e) => !readOnly && setHouseRules(e.target.value)}
              placeholder="Any rules (no smoking, no outside food, etc.)"
              rows={3}
              style={styles.textarea}
              disabled={readOnly || submitting}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cancellation Policy</label>
            <select
              value={cancellationPolicy}
              onChange={(e) => !readOnly && setCancellationPolicy(e.target.value as any)}
              style={styles.select}
              disabled={readOnly || submitting}
            >
              <option value="flexible">Flexible</option>
              <option value="standard">Standard</option>
              <option value="strict">Strict</option>
            </select>
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Cover Image</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Cover Image *</label>

            {coverPreview ? (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={coverPreview}
                  alt="preview"
                  style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 10 }}
                />
                {!readOnly && (
                  <button type="button" onClick={() => setCover(null)} disabled={submitting} style={styles.smallBtn}>
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
            ) : (
              !readOnly && (
                <label style={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files?.[0] || null)}
                    disabled={submitting}
                    style={{ display: "none" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Plus size={16} />
                    <div>
                      <div style={{ fontWeight: 800 }}>Upload cover image</div>
                      <div style={{ fontSize: 12, color: theme.colors.subtext }}>PNG/JPG recommended</div>
                    </div>
                  </div>
                </label>
              )
            )}
          </div>
        </section>

        {!isEdit && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onSubmit} disabled={submitting} style={styles.actionButton}>
              {submitting ? "Submitting..." : "Submit Studio"}
            </button>
            <button type="button" disabled={submitting} onClick={() => nav("/profile")} style={styles.secondaryBtn}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <style>{`
        .ns-row-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .ns-row-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#F9FAFB", padding: 24 },
  header: { maxWidth: 1100, margin: "0 auto 18px" },

  pageTitle: { fontSize: 28, fontWeight: 800, color: theme.colors.text, margin: 0 },
  pageSubtitle: { fontSize: 14, color: theme.colors.subtext, margin: "4px 0 0" },

  formWrapper: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },

  section: { background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 800, color: theme.colors.text, margin: "0 0 14px" },

  formGroup: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 700, color: "#374151" },

  input: { padding: "12px 14px", borderRadius: 12, fontSize: 14, outline: "none", backgroundColor: "#FFFFFF" },
  select: { padding: "12px 14px", borderRadius: 12, fontSize: 14, outline: "none", backgroundColor: "#FFFFFF" },
  textarea: {
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    backgroundColor: "#FFFFFF",
  },

  rowGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  uploadBox: {
    border: "2px dashed #D1D5DB",
    borderRadius: 12,
    padding: 18,
    cursor: "pointer",
    backgroundColor: "#FAFAFA",
  },

  smallBtn: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#fff",
    color: theme.colors.text,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  actionButton: {
    padding: "12px 24px",
    backgroundColor: "#EAB308",
    color: "#111827",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    flex: 1,
  },

  secondaryBtn: {
    padding: "12px 24px",
    backgroundColor: "#fff",
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },

  errorMessage: { padding: 12, backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 14 },
  successMessage: { padding: 12, backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: 8, fontSize: 14 },
};
