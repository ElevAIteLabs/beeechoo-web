// components/ui/event-card.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Home } from "lucide-react";

export interface EventCardProps {
  heading?: string;
  description?: string;

  date: Date;
  imageUrl: string;
  imageAlt: string;
  eventName: string;
  venue: string;
  address: string;
  time: string;
  actionLabel: string;
  onActionClick: () => void;
  className?: string;

  organizerName?: string;
  style?: React.CSSProperties;

  /** 🔽 NEW: use this to replace date with pricing */
  pricingPrimary?: string;   // e.g. "₹1,500"
  pricingSecondary?: string; // e.g. "Per hour" or "Package starts at"
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      date,
      imageUrl,
      imageAlt,
      eventName,
      venue,
      address,
      time,
      actionLabel,
      onActionClick,
      organizerName,
      style,
      className,
      pricingPrimary,
      pricingSecondary,
    },
    ref
  ) => {
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();

    const showPricing = !!pricingPrimary;

    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid #E5E7EB",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'Caudex', serif",
          color: "#000000",
          ...style,
        }}
        aria-label={eventName}
      >
        {/* HEADER */}
        <div
          style={{
            background: "hsla(43, 97%, 60%, 0.80)",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: organizerName ? "space-between" : "center",
                height: 72,
              }}
            >
              <h2
                className="be-event-title"
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#060606ff",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.2",
                }}
                title={eventName}
              >
                {eventName}
              </h2>

              {organizerName && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(1, 1, 1, 0.9)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  by <span style={{ fontWeight: 600 }}>{organizerName}</span>
                </p>
              )}
            </div>

            {/* RIGHT: Date OR Pricing */}
            <div style={{ textAlign: "right" }}>
              {showPricing ? (
                <>
                  {pricingSecondary && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        color: "rgba(6, 5, 5, 0.8)",
                        textTransform: "uppercase",
                      }}
                    >
                      {pricingSecondary}
                    </p>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#000000ff",
                    }}
                  >
                    {pricingPrimary}
                  </p>
                </>
              ) : (
                <>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      color: "rgba(6, 5, 5, 0.8)",
                    }}
                  >
                    {dayOfWeek}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#000000ff",
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{month}</span>
                    <span>{day}</span>
                  </p>

                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 4,
                      fontSize: 12,
                      color: "rgba(8, 8, 8, 0.9)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {time}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div
          style={{
            margin: "16px",
            marginTop: 12,
            width: "calc(100% - 32px)",
            height: "min(220px, 45vw)",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* DETAILS */}
        <div style={{ flex: 1, padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 13,
              color: "#374151",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Home size={14} style={{ color: "#000000" }} />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 500,
                }}
              >
                {venue}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} style={{ color: "#000000" }} />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 500,
                }}
              >
                {address}
              </span>
            </div>
          </div>
        </div>

        {/* CTA BUTTON */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "center",
            paddingBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={onActionClick}
            style={{
              background: "hsla(43, 97%, 60%, 0.80)",
              color: "#000000",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              fontFamily: "Poppins, sans-serif",
              boxShadow: "0 2px 6px rgba(246, 177, 0, 0.4)",
              cursor: "pointer",
            }}
          >
            {actionLabel}
          </button>
        </div>
      </motion.div>
    );
  }
);

EventCard.displayName = "EventCard";

export { EventCard };
