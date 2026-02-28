// src/pages/MagazineCategory.tsx
import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/ui/event-card";
import { ChevronDown, ChevronUp } from "lucide-react";

/* --- Dummy Data for Magazines --- */
const MAGAZINE_LIST = [
    {
        id: "mag-vogue",
        name: "Vogue India",
        category: "Lifestyle",
        readership: "73,500",
        spend: "₹ 2,53,000",
        image: "https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg",
    },
    {
        id: "mag-forbes",
        name: "Forbes India",
        category: "Business",
        readership: "75,000",
        spend: "₹ 3,30,000",
        image: "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg",
    },
    {
        id: "mag-india-today",
        name: "India Today",
        category: "News",
        readership: "550,000",
        spend: "₹ 2,81,750",
        image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
    },
    {
        id: "mag-femina",
        name: "Femina",
        category: "Lifestyle",
        readership: "178,000",
        spend: "₹ 1,49,500",
        image: "https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg",
    },
    {
        id: "mag-business-today",
        name: "Business Today",
        category: "Business",
        readership: "195,000",
        spend: "₹ 1,60,000",
        image: "https://images.pexels.com/photos/6335/man-coffee-cup-pen.jpg",
    },
    {
        id: "mag-inflight",
        name: "Air India Inflight",
        category: "Inflight",
        readership: "158,000",
        spend: "₹ 4,00,000",
        image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
    }
];

const PRICING_TABLE = [
    { option: "Half Page", rates: "₹ 22,000 - ₹ 4,60,000" },
    { option: "Full Page", rates: "₹ 33,000 - ₹ 8,05,000" },
    { option: "Article", rates: "₹ 1,60,000 - ₹ 4,41,788" },
    { option: "e-Magazine", rates: "₹ 82,500 - ₹ 82,500" },
    { option: "Popular Inflight", rates: "₹ 10,05,000 - ₹ 10,05,000" },
];

const TOP_SPEND = [
    { name: "Indigo Hello 6E", desc: "Leader with highest total Q4 spend of ₹14L. Ideal for premium launches and national campaigns.", amount: "₹14L" },
    { name: "Air India Inflight", desc: "Top choice for corporate branding with ₹10.7L spend. Highly impactful reach.", amount: "₹10.7L" },
    { name: "Conde Nast Traveller", desc: "Unprecedented total spend of ₹2.8L in Q4. Premium lifestyle branding.", amount: "₹2.8L" },
];

const FAQS = [
    { q: "How much does it cost to advertise in magazines?", a: "Costs vary based on circulation, ad size, placement, and publication category. Rates start from ₹10,000 for regional and go up to ₹10,00,000+ for national cover ads." },
    { q: "How do I know the readership of a magazine?", a: "Readership data is provided by the Indian Readership Survey (IRS) or self-reported by publishers. We provide verified estimates." },
    { q: "Will I get help designing my ad?", a: "Yes! BeeEchoo offers creative design support including layout and copywriting to maximize impact." },
    { q: "How long will my ad remain visible?", a: "Your ad remains visible for one full print cycle. 30 days for monthlies, 7 days for weeklies. Magazines have a high shelf life." },
];

/* --- Components --- */

function FaqItem({ q, a }: { q: string, a: string }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div style={{ borderBottom: "1px solid #FDE68A", padding: "16px 0" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#B45309" }}>{q}</h4>
                {open ? <ChevronUp size={20} color="#B45309" /> : <ChevronDown size={20} color="#B45309" />}
            </button>
            {open && <p style={{ margin: "12px 0 0", fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>{a}</p>}
        </div>
    );
}

export default function MagazineCategory(): JSX.Element {
    const nav = useNavigate();
    const [search, setSearch] = React.useState("");

    const filteredMags = React.useMemo(() => {
        return MAGAZINE_LIST.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <div style={{ backgroundColor: "#FFFBEB", minHeight: "100vh" }}>
            <section style={{ padding: "32px 16px 64px" }}>
                <div style={{ maxWidth: 1120, margin: "0 auto" }}>

                    {/* Back Button */}
                    <button
                        onClick={() => nav("/media")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "transparent",
                            border: "none",
                            color: "#D97706",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            marginBottom: 24,
                            padding: 0,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Categories
                    </button>

                    {/* Hero Header */}
                    <div style={{ background: "linear-gradient(135deg, #F6B100 0%, #FACC15 100%)", borderRadius: 24, padding: "48px 32px", color: "#111827", marginBottom: 40, boxShadow: "0 10px 30px rgba(246, 177, 0, 0.2)" }}>
                        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Magazine Advertising</h1>
                        <p style={{ fontSize: 18, margin: 0, maxWidth: 600, fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>
                            Reach premium audiences through India's top magazines. Targeted reach, high engagement, and credible environments for your brand.
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                        <input
                            type="text"
                            placeholder="Search by publication or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, padding: "14px 20px", borderRadius: 12, border: "1px solid #FDE68A", fontSize: 15, outline: "none" }}
                        />
                        <button style={{ padding: "0 24px", borderRadius: 12, background: "#111827", color: "#F6B100", fontWeight: 600, border: "none", cursor: "pointer" }}>Search</button>
                    </div>

                    {/* Magazine Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginBottom: 64 }}>
                        {filteredMags.map(mag => (
                            <EventCard
                                key={mag.id}
                                heading={mag.category}
                                description={`Readership: ${mag.readership}`}
                                date={new Date()}
                                imageUrl={mag.image}
                                imageAlt={mag.name}
                                eventName={mag.name}
                                venue={mag.category}
                                address={`Readership: ${mag.readership}`}
                                time=""
                                actionLabel="View Details"
                                pricingPrimary={mag.spend}
                                pricingSecondary="Min Spend"
                                onActionClick={() => nav(`/media/magazine/${mag.id}`)}
                            />
                        ))}
                    </div>

                    {/* Pricing Table Section */}
                    <div style={{ background: "#FFFFFF", borderRadius: 24, padding: 32, border: "1px solid #FDE68A", marginBottom: 64, boxShadow: "0 4px 20px rgba(251,191,36,0.1)" }}>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>Magazine Advertising Cost</h2>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ background: "#FEF3C7", color: "#B45309" }}>
                                        <th style={{ padding: "16px 20px", fontWeight: 700, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>Ad Option</th>
                                        <th style={{ padding: "16px 20px", fontWeight: 700 }}>Rates</th>
                                        <th style={{ padding: "16px 20px", fontWeight: 700, borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PRICING_TABLE.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i < PRICING_TABLE.length - 1 ? "1px solid #FEF3C7" : "none" }}>
                                            <td style={{ padding: "20px", fontWeight: 600, color: "#111827" }}>{row.option}</td>
                                            <td style={{ padding: "20px", color: "#4B5563" }}>{row.rates}</td>
                                            <td style={{ padding: "20px" }}>
                                                <button style={{ padding: "8px 16px", background: "#FFFBEB", border: "1px solid #F6B100", color: "#B45309", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Book Ads</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Insights Section */}
                    <div style={{ marginBottom: 64 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>Top Medias with Highest Ad Spend</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                            {TOP_SPEND.map((top, i) => (
                                <div key={i} style={{ background: "#FFFDF0", padding: 24, borderRadius: 16, border: "2px solid #FDE68A" }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginBottom: 12 }}>{top.amount}</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{top.name}</h3>
                                    <p style={{ margin: 0, color: "#4B5563", fontSize: 14, lineHeight: 1.5 }}>{top.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info & Why Choose Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 64 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>Why Choose Magazine Advertising?</h2>
                            <ul style={{ paddingLeft: 20, color: "#4B5563", lineHeight: 1.8, fontSize: 15 }}>
                                <li><strong>Targeted reach</strong> — cater to specific demographics and income groups.</li>
                                <li><strong>High engagement</strong> — readers spend quality time, leading to deeper brand recall.</li>
                                <li><strong>Premium audience</strong> — ideal for affluent, educated, and niche segments.</li>
                                <li><strong>Longevity</strong> — magazines have a longer shelf life and are seen multiple times.</li>
                                <li><strong>Visual impact</strong> — high-quality print allows stunning visuals.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>Types of Magazine Ads</h2>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {["Full Page", "Half Page", "Cover Page", "Inside Front Cover", "Inside Back Cover", "Inflight Ads", "Advertorial", "Jacket / Insert Ads"].map(type => (
                                    <span key={type} style={{ background: "#FEF3C7", color: "#B45309", padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{type}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FAQs Section */}
                    <div style={{ background: "#FFFFFF", borderRadius: 24, padding: 40, border: "1px solid #FDE68A", marginBottom: 64 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 24px", textAlign: "center" }}>Frequently Asked Questions</h2>
                        <div style={{ maxWidth: 800, margin: "0 auto" }}>
                            {FAQS.map((faq, i) => (
                                <FaqItem key={i} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>

                    {/* CTA Banner */}
                    <div style={{ background: "#111827", borderRadius: 24, padding: "48px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "#F6B100", opacity: 0.1, borderRadius: "50%" }}></div>
                        <div style={{ position: "absolute", bottom: -100, left: -50, width: 300, height: 300, background: "#F6B100", opacity: 0.1, borderRadius: "50%" }}></div>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px", position: "relative", zIndex: 1 }}>Ready to Reach Premium Audiences?</h2>
                        <p style={{ fontSize: 16, color: "#D1D5DB", margin: "0 auto 32px", maxWidth: 500, position: "relative", zIndex: 1 }}>Book Magazine Ads across India with BeeEchoo for unmatched visibility and return on investment.</p>
                        <button style={{ background: "#F6B100", color: "#111827", padding: "16px 32px", fontSize: 16, fontWeight: 700, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", zIndex: 1, boxShadow: "0 10px 25px rgba(246, 177, 0, 0.3)" }}>Get Your Free Quote</button>
                    </div>

                </div>
            </section>
        </div>
    );
}
