// src/pages/BecomeCreator.tsx
import React, { type JSX } from "react";
import { getMe, submitKyc, type Me as ApiMe } from "../lib/kyc";
import { getToken } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE as string;

// Extend ApiMe with fields we actually use.
type Me = ApiMe & {
  brandName: string | null;
  avatarUrl: string | null;
  email: string | null;
  gender: "male" | "female" | "other" | null;
  city: string | null;
  bio: string | null;

  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  whatsapp: string | null;
  category: string | null;

  creatorKycStatus: "pending" | "verified" | "rejected" | null;
  creatorKycReason: string | null;
};

const theme = {
  text: "#111827",
  subtext: "#6B7280",
  primary: "#F6B100",
  border: "#E5E7EB",
  green: "#10B981",
  red: "#EF4444",
};

// ✅ Reuse same UI styles from BecomeHost
const uploadCardStyle: React.CSSProperties = {
  background: "#F9FAFB",
  borderRadius: 14,
  border: `1.5px dashed ${theme.border}`,
  padding: 14,
  textAlign: "left",
  boxSizing: "border-box",
  minWidth: 0,
};

const uploadTopRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const uploadHintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: theme.subtext,
  lineHeight: 1.4,
};

const uploadButtonStyle: React.CSSProperties = {
  background: theme.primary,
  color: "#111",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(246, 177, 0, 0.25)",
  whiteSpace: "nowrap",
};

const fileNamePillStyle: React.CSSProperties = {
  marginTop: 10,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#ECFDF5",
  color: "#065F46",
  fontSize: 12,
  fontWeight: 600,
  maxWidth: "100%",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  display: "block",
  padding: "14px 16px",
  borderRadius: 12,
  border: `1.5px solid ${theme.border}`,
  fontSize: 14,
  transition: "all 0.2s ease",
  background: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginBottom: 8,
  fontSize: 14,
  color: theme.text,
};

// Page / container / card (same vibe)
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #FFF7E6 0%, #FFFFFF 55%)",
  padding: "24px 12px",
  boxSizing: "border-box",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
  width: "100%",
  boxSizing: "border-box",
};

const formCardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  border: `1px solid ${theme.border}`,
  padding: "28px",
  overflow: "hidden",
  boxSizing: "border-box",
  width: "100%",
};

export default function BecomeCreator(): JSX.Element {
  const [me, setMe] = React.useState<Me | null>(null);

  // Basic profile
  const [fullName, setFullName] = React.useState("");
  const [brandName, setBrandName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [gender, setGender] = React.useState<"male" | "female" | "other" | "">("");

  // Creator profile / KYC fields
  const [instagram, setInstagram] = React.useState("");
  const [facebook, setFacebook] = React.useState("");
  const [youtube, setYoutube] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [category, setCategory] = React.useState("");

  // Files
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string>("");

  React.useEffect(() => {
    getMe()
      .then((userMe) => {
        const u = userMe as Me;
        setMe(u);

        if (u.name) setFullName(u.name);
        if (u.brandName) setBrandName(u.brandName);
        if (u.email) setEmail(u.email);
        if (u.city) setCity(u.city);
        if (u.bio) setBio(u.bio);
        if (u.gender) setGender(u.gender);

        if (u.instagram) setInstagram(u.instagram);
        if (u.facebook) setFacebook(u.facebook);
        if (u.youtube) setYoutube(u.youtube);
        if (u.whatsapp) setWhatsapp(u.whatsapp);
        if (u.category) setCategory(u.category);
      })
      .catch(() =>
        setMe({
          isHost: false,
          isCreator: false,
          kycStatus: null,
          creatorKycStatus: null,
          creatorKycReason: null,
          brandName: null,
          avatarUrl: null,
          email: null,
          gender: null,
          city: null,
          bio: null,
          instagram: null,
          facebook: null,
          youtube: null,
          whatsapp: null,
          category: null,
        } as Me)
      );
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documentFile) return setMsg("Please upload an ID document");
    if (!fullName.trim()) return setMsg("Full name is required");

    setMsg("");
    setSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        setMsg("You must be signed in to submit KYC.");
        return;
      }

      // 1) Update /me profile
      const profilePayload = {
        name: fullName,
        email: email || undefined,
        city: city || undefined,
        bio: bio || undefined,
        brandName: brandName || undefined,
        gender: gender || undefined,

        instagram: instagram || undefined,
        facebook: facebook || undefined,
        youtube: youtube || undefined,
        whatsapp: whatsapp || undefined,
        category: category || undefined,
      };

      const rProfile = await fetch(`${API}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profilePayload),
      });

      if (!rProfile.ok) {
        const je = await rProfile.json().catch(() => ({} as any));
        throw new Error(je?.error || "Failed to save profile information");
      }

      // 2) Submit creator KYC
      const form = new FormData();
      form.append("fullName", fullName);
      if (brandName) form.append("brandName", brandName);

      if (instagram) form.append("instagram", instagram);
      if (facebook) form.append("facebook", facebook);
      if (youtube) form.append("youtube", youtube);

      form.append("document", documentFile);
      if (selfieFile) form.append("selfie", selfieFile);

      await submitKyc(form, "creator");

      setMsg("Creator KYC submitted! Awaiting admin approval.");
      setMe((prev) => (prev ? { ...prev, creatorKycStatus: "pending" } : prev));
    } catch (err: any) {
      setMsg(err?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (!me) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: "center" }}>
            <div style={{ fontSize: 16, color: theme.subtext }}>Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  const creatorStatus = me.creatorKycStatus ?? null;
  const creatorReason = me.creatorKycReason ?? null;

  // Already creator
  if (me.isCreator) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 12px" }}>
              You're already a Creator!
            </h2>
            <p style={{ color: theme.subtext, marginBottom: 24, fontSize: 15 }}>
              You can now participate in creator programs and campaigns.
            </p>
            <a
              href="/campaigns"
              style={{
                display: "inline-block",
                background: theme.primary,
                color: "#000",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(246, 177, 0, 0.3)",
              }}
            >
              Explore Campaigns →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Pending
  if (creatorStatus === "pending") {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 10px" }}>
              Creator KYC Submitted
            </h2>
            <p style={{ color: theme.subtext, fontSize: 15, margin: 0 }}>
              We’re reviewing your details. You’ll get creator access once approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verified
  if (creatorStatus === "verified") {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...formCardStyle, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 10px" }}>
              Creator Approved
            </h2>
            <p style={{ color: theme.subtext, fontSize: 15, margin: 0 }}>
              You can now use the platform as a verified creator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected
  if (creatorStatus === "rejected") {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={formCardStyle}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.text }}>
              Creator KYC Rejected
            </h2>

            {creatorReason ? (
              <div
                style={{
                  marginTop: 14,
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#7F1D1D",
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                <b>Reason:</b> {creatorReason}
              </div>
            ) : null}

            <p style={{ marginTop: 14, color: theme.subtext, fontSize: 15 }}>
              Please correct details and resubmit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No creator KYC yet → form (Same UI as BecomeHost)
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: "0 0 8px" }}>
            Become a Creator
          </h2>
          <p style={{ color: theme.subtext, fontSize: 15, margin: 0 }}>
            Submit your details to request creator access.
          </p>
        </div>

        {/* Form Card */}
        <div style={formCardStyle}>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your legal full name"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Brand / Channel Name</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your brand or channel"
                style={inputStyle}
              />
            </div>

            <div className="be-grid cols-2" style={{ width: "100%" }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  type="email"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="E.g., Travel Vlogger, Tech Reviewer"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about you as a creator"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
              />
            </div>

            {/* Social Links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Instagram</label>
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>WhatsApp (public/contact)</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Facebook Page</label>
                <input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>YouTube Channel</label>
                <input
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/yourchannel"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* File uploads in a grid (same as BecomeHost) */}
            <div className="be-grid cols-2" style={{ width: "100%", alignItems: "start" }}>
              {/* ID Document */}
              <div style={uploadCardStyle}>
                <div style={uploadTopRowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...labelStyle, marginBottom: 0 }}>
                      ID Document <span style={{ color: theme.red }}>*</span>
                    </div>
                    <div style={uploadHintStyle}>PNG/JPG/PDF • Max ~10MB</div>
                  </div>

                  <input
                    id="creator-kyc-document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    required
                    style={{ display: "none" }}
                  />
                  <label htmlFor="creator-kyc-document" style={uploadButtonStyle}>
                    Upload
                  </label>
                </div>

                {documentFile ? (
                  <div style={fileNamePillStyle} title={documentFile.name}>
                    <span>✓</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {documentFile.name}
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: theme.subtext }}>No file selected</div>
                )}
              </div>

              {/* Selfie */}
              <div style={uploadCardStyle}>
                <div style={uploadTopRowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...labelStyle, marginBottom: 0 }}>Selfie (optional)</div>
                    <div style={uploadHintStyle}>Clear face photo • JPG/PNG</div>
                  </div>

                  <input
                    id="creator-kyc-selfie"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="creator-kyc-selfie" style={uploadButtonStyle}>
                    Upload
                  </label>
                </div>

                {selfieFile ? (
                  <div style={fileNamePillStyle} title={selfieFile.name}>
                    <span>✓</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selfieFile.name}
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: theme.subtext }}>No file selected</div>
                )}
              </div>
            </div>

            <button
              disabled={submitting}
              type="submit"
              style={{
                background: theme.primary,
                color: "#000",
                padding: "16px 24px",
                border: "none",
                borderRadius: 12,
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 15,
                boxShadow: "0 4px 12px rgba(246, 177, 0, 0.3)",
                opacity: submitting ? 0.7 : 1,
                marginTop: 8,
              }}
            >
              {submitting ? "Submitting…" : "Submit Creator KYC"}
            </button>

            {msg && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: msg.includes("submitted") ? "#ECFDF5" : "#FEF2F2",
                  color: msg.includes("submitted") ? "#065F46" : "#991B1B",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
