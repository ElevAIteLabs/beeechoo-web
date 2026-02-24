// src/pages/MediaDetails.tsx
import  { type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { theme } from "../theme";

type MediaCompany = {
  id: string;
  name: string;
  city: string;
  focus: string;
  services: string[];
  image?: string;
  pricing?: string;
  description?: string;
  contact?: string;
  website?: string;
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
    description: "Professional production studio with state-of-the-art equipment and experienced crew.",
    contact: "+91 98765 43210",
    website: "brightframe.com"
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
    description: "Digital-first media agency specializing in online content creation and distribution.",
    contact: "+91 98765 43211",
    website: "urbanreach.com"
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
    description: "Full-service creative agency with expertise in brand storytelling and influencer marketing.",
    contact: "+91 98765 43212",
    website: "pixelstory.com"
  },
];

export default function MediaDetails(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const media = DUMMY_MEDIA_ROWS.find((m) => m.id === id);

  if (!media) {
    return (
      <section style={{ padding: "24px 16px 48px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#111827", fontSize: 24, fontWeight: 800 }}>
            Media Partner Not Found
          </h2>
          <button
            onClick={() => nav("/media")}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: theme.colors.primary,
              color: "#111827",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to Media
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Back button */}
        <button
          onClick={() => nav("/media")}
          style={{
            background: "transparent",
            border: "none",
            color: theme.colors.primary,
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          ← Back to Media
        </button>

        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginBottom: 40,
            alignItems: "start",
          }}
        >
          {/* Image */}
          <div>
            <img
              src={media.image || "https://via.placeholder.com/400x300?text=Media+House"}
              alt={media.name}
              style={{
                width: "100%",
                borderRadius: 14,
                objectFit: "cover",
                height: 400,
              }}
            />
          </div>

          {/* Details */}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 8,
              }}
            >
              {media.name}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ color: theme.colors.subtext, fontSize: 12 }}>
                  FOCUS AREA
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    marginTop: 4,
                  }}
                >
                  {media.focus}
                </div>
              </div>

              <div>
                <div style={{ color: theme.colors.subtext, fontSize: 12 }}>
                  LOCATION
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    marginTop: 4,
                  }}
                >
                  {media.city}
                </div>
              </div>

              <div>
                <div style={{ color: theme.colors.subtext, fontSize: 12 }}>
                  PRICING
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: theme.colors.primary,
                    marginTop: 4,
                  }}
                >
                  {media.pricing}
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                background: "#FFFBEB",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {media.description}
              </p>
            </div>

            {/* Services */}
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Services
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {media.services.map((service) => (
                  <span
                    key={service}
                    style={{
                      background: theme.colors.primary,
                      color: "#111827",
                      padding: "8px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div
              style={{
                display: "grid",
                gap: 12,
                padding: 16,
                background: "#F9FAFB",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
              }}
            >
              <div>
                <div style={{ color: theme.colors.subtext, fontSize: 12 }}>
                  CONTACT
                </div>
                <a
                  href={`tel:${media.contact}`}
                  style={{
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontWeight: 600,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {media.contact}
                </a>
              </div>

              <div>
                <div style={{ color: theme.colors.subtext, fontSize: 12 }}>
                  WEBSITE
                </div>
                <a
                  href={`https://${media.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontWeight: 600,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {media.website}
                </a>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: theme.colors.primary,
                  color: "#111827",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Inquire Now
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#F9FAFB",
                  color: "#111827",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}