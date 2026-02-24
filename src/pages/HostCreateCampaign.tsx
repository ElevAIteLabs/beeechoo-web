// src/pages/HostCreateCampaign.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../lib/auth";
import {
  createCampaign,
  updateCampaign,
  updateCampaignImage,
  listCampaignInterests,
  type CampaignDto,
  type CampaignInterestDto,
  type Gender,
  type CampaignPlatform,
} from "../lib/campaigns";

const theme = {
  border: "#E5E7EB",
  text: "#111827",
  sub: "#6B7280",
  primary: "#F6B100",
  green: "#10B981",
  red: "#EF4444",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

const CATEGORY_OPTIONS = [
  "Influencers",
  "Talent management agencies",
  "Influencer agencies",
  "Photographers/Videographers",
  "General marketing services",
  "Other",
] as const;

type ExistingCampaign = Pick<
  CampaignDto,
  | "id"
  | "title"
  | "category"
  | "description"
  | "expiresAt"
  | "imageUrl"
  | "status"
  | "payPerCreator"
  | "payTotal"
  | "currency"
  | "openings"
  | "preferredGender"
  | "platform"
  | "location"
  | "language"
>;

function toLocalInput(isoOrDateLike: string) {
  // expects ISO from backend; returns YYYY-MM-DDTHH:mm for datetime-local
  try {
    return new Date(isoOrDateLike).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function HostCreateCampaign() {
  const nav = useNavigate();
  const location = useLocation() as { state?: { campaign?: ExistingCampaign } };
  const existing = location.state?.campaign;
  const isEdit = !!existing?.id;

  // Core fields
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<(typeof CATEGORY_OPTIONS)[number] | "">("");
  const [otherCategory, setOtherCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");

  // Extra fields (from your DTO)
  const [payPerCreator, setPayPerCreator] = React.useState<string>("");
  const [payTotal, setPayTotal] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<string>("INR");
  const [openings, setOpenings] = React.useState<string>("");
  const [preferredGender, setPreferredGender] = React.useState<Gender | "">("");
  const [platform, setPlatform] = React.useState<CampaignPlatform | "">("");
  const [locationText, setLocationText] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>("");

  // Image
  const [image, setImage] = React.useState<File | null>(null);

  // UI states
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  // Interested list
  const [interestsLoading, setInterestsLoading] = React.useState(false);
  const [interests, setInterests] = React.useState<CampaignInterestDto[]>([]);

  // Prefill when editing (like NewEvent)
  React.useEffect(() => {
    if (!existing) return;

    setTitle(existing.title || "");
    setDescription(existing.description || "");
    setExpiresAt(existing.expiresAt ? toLocalInput(existing.expiresAt) : "");

    // category: if not in dropdown -> Other
    const cat = existing.category || "";
    if ((CATEGORY_OPTIONS as readonly string[]).includes(cat)) {
      setCategory(cat as any);
      setOtherCategory("");
    } else {
      setCategory("Other");
      setOtherCategory(cat);
    }

    setPayPerCreator(existing.payPerCreator != null ? String(existing.payPerCreator) : "");
    setPayTotal(existing.payTotal != null ? String(existing.payTotal) : "");
    setCurrency(existing.currency || "INR");
    setOpenings(existing.openings != null ? String(existing.openings) : "");
    setPreferredGender(existing.preferredGender || "");
    setPlatform(existing.platform || "");
    setLocationText(existing.location || "");
    setLanguage(existing.language || "");
  }, [existing]);

  // Load interested users (edit mode only)
  React.useEffect(() => {
    if (!isEdit || !existing?.id) return;
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        setInterestsLoading(true);
        const res = await listCampaignInterests(token, existing.id);
        setInterests(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setInterests([]);
      } finally {
        setInterestsLoading(false);
      }
    })();
  }, [isEdit, existing?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    const token = getToken();
    if (!token) return alert("Sign in required");

    const finalCategory = category === "Other" ? otherCategory.trim() : category;

    if (!title.trim()) return setError("Title is required");
    if (!finalCategory) return setError("Category is required");
    if (!expiresAt) return setError("Expiry time is required");

    try {
      setSaving(true);

      if (!isEdit) {
        // ✅ CREATE (multipart) — your backend expects FormData
        const form = new FormData();
        form.append("title", title.trim());
        form.append("category", finalCategory);
        form.append("description", description);
        form.append("expiresAt", expiresAt);

        if (payPerCreator.trim()) form.append("payPerCreator", payPerCreator.trim());
        if (payTotal.trim()) form.append("payTotal", payTotal.trim());
        if (currency.trim()) form.append("currency", currency.trim());
        if (openings.trim()) form.append("openings", openings.trim());
        if (preferredGender) form.append("preferredGender", preferredGender);
        if (platform) form.append("platform", platform);
        if (locationText.trim()) form.append("location", locationText.trim());
        if (language.trim()) form.append("language", language.trim());

        if (image) form.append("image", image);

        await createCampaign(token, form);
        setMsg("✅ Campaign posted!");
        setTimeout(() => nav("/profile"), 500);
        return;
      }

      // ✅ EDIT MODE
      // 1) update JSON fields
      const payload: Partial<CampaignDto> = {
        title: title.trim(),
        category: finalCategory,
        description: description,
        // expiresAt: backend expects string? (your update API is JSON)
        // If backend expects ISO, convert:
        expiresAt: new Date(expiresAt).toISOString(),

        payPerCreator: payPerCreator.trim() ? Number(payPerCreator.trim()) : null,
        payTotal: payTotal.trim() ? Number(payTotal.trim()) : null,
        currency: currency.trim() || null,
        openings: openings.trim() ? Number(openings.trim()) : null,
        preferredGender: preferredGender || null,
        platform: platform || "online",
        location: locationText.trim() || null,
        language: language.trim() || null,
      };

      await updateCampaign(token, existing!.id, payload);

      // 2) update image separately if selected
      if (image) {
        await updateCampaignImage(token, existing!.id, image);
      }

      setMsg("✅ Campaign updated!");
      setTimeout(() => nav("/profile"), 500);
    } catch (err: any) {
      setError(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, padding: 16 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: theme.text }}>
              {isEdit ? "Campaign Details" : "Create Campaign"}
            </div>
            <div style={{ color: theme.sub, marginTop: 6 }}>
              {isEdit ? "Edit the campaign and see who is interested." : "Post a gig requirement like a LinkedIn post."}
            </div>
          </div>

          <button
            onClick={() => nav("/profile")}
            style={{
              border: `1px solid ${theme.border}`,
              background: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>

        <div className="hcc-layout">
          {/* LEFT */}
          <form
            onSubmit={onSubmit}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: 18,
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Title *</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Need 10 creators for brand shoot"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  padding: "0 12px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Category *</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                    background: "#fff",
                  }}
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Expiry *</div>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>
            </div>

            {category === "Other" && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>
                  Other Category *
                </div>
                <input
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  placeholder="Enter category"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>
            )}

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe your requirement clearly..."
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  padding: 12,
                  resize: "vertical",
                }}
              />
            </div>

            {/* Extra fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Openings</div>
                <input
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  placeholder="E.g., 10"
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Preferred Gender</div>
                <select
                  value={preferredGender}
                  onChange={(e) => setPreferredGender(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                    background: "#fff",
                  }}
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Platform</div>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                    background: "#fff",
                  }}
                >
                  <option value="">Select</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Language</div>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="E.g., Tamil, English"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Location</div>
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="E.g., Coimbatore"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  padding: "0 12px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>
                  Pay per Creator
                </div>
                <input
                  value={payPerCreator}
                  onChange={(e) => setPayPerCreator(e.target.value)}
                  placeholder="E.g., 500"
                  inputMode="decimal"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Total Pay</div>
                <input
                  value={payTotal}
                  onChange={(e) => setPayTotal(e.target.value)}
                  placeholder="E.g., 5000"
                  inputMode="decimal"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    padding: "0 12px",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>Currency</div>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="INR"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  padding: "0 12px",
                }}
              />
            </div>

            {/* Image */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: theme.text }}>
                Campaign Image {isEdit ? "(optional replace)" : "(optional)"}
              </div>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>

            {error && (
              <div style={{ padding: 10, borderRadius: 10, background: "#FEE2E2", color: "#991B1B", fontWeight: 800 }}>
                {error}
              </div>
            )}
            {msg && (
              <div style={{ padding: 10, borderRadius: 10, background: "#D1FAE5", color: "#065F46", fontWeight: 800 }}>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                height: 46,
                borderRadius: 12,
                background: theme.primary,
                border: "none",
                color: "#111827",
                fontWeight: 900,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? (isEdit ? "Saving…" : "Posting…") : isEdit ? "Save Changes" : "Publish"}
            </button>
          </form>

          {/* RIGHT */}
          <div style={{ position: "sticky", top: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 14, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ fontWeight: 900, color: theme.text, fontSize: 15 }}>Interested Users</div>
                <div style={{ color: theme.sub, fontSize: 12, marginTop: 4 }}>
                  {isEdit ? "Users who clicked Interested." : "Create the campaign to see interest."}
                </div>
              </div>

              <div style={{ padding: 14 }}>
                {!isEdit ? (
                  <div style={{ color: theme.sub, fontSize: 13 }}>Not available in create mode.</div>
                ) : interestsLoading ? (
                  <div style={{ color: theme.sub, fontSize: 13 }}>Loading…</div>
                ) : interests.length === 0 ? (
                  <div style={{ color: theme.sub, fontSize: 13 }}>No interest yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {interests.map((u) => {
                      const displayName = u.name || u.userProfileName || "Unknown";
                      const city = u.city || u.userProfileCity || "—";
                      const when = new Date(u.createdAt).toLocaleString();

                      return (
                        <div
                          key={u.id}
                          style={{
                            borderRadius: 10,
                            border: `1px solid ${theme.border}`,
                            padding: 10,
                            background: "#F9FAFB",
                            fontSize: 12,
                          }}
                        >
                          <div style={{ fontWeight: 900, color: theme.text }}>{displayName}</div>
                          <div style={{ color: theme.sub }}>{u.email || "—"} • {city}</div>
                          <div style={{ color: theme.sub }}>Phone: {u.phone || "—"}</div>
                          <div style={{ color: theme.sub, marginTop: 4 }}>{when}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {isEdit && (
              <div style={{ marginTop: 10, color: theme.sub, fontSize: 12 }}>
                If this stays empty but interestCount is &gt; 0, your backend needs <b>GET /campaigns/:id/interests</b>.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .hcc-layout {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 1024px) {
          .hcc-layout {
            grid-template-columns: 1fr 380px;
          }
        }
      `}</style>
    </div>
  );
}
