import React, { type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

/* --- Dummy Data for Magazines --- */
const MAGAZINE_DB: Record<string, any> = {
    "mag-vogue": {
        name: "Vogue India",
        category: "Lifestyle",
        circulation: "73.5K",
        frequency: "Bi-Monthly",
        image: "https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg",
        description: "When it comes to fashion, beauty, and lifestyle, no other magazine comes close to the prestige Vogue holds. Known for its unparalleled focus on high fashion, luxury, and style, Vogue caters to the affluent crowd who are fashion-conscious. Using Vogue Ads, brands can benefit from this high-quality content and align themselves with the magazine's reputation and build visibility delivering a high impact.",
        options: [
            { type: "Full Page", base: "₹ 3,39,480" },
            { type: "Article", base: "₹ 3,76,913" },
            { type: "Cover Page", base: "₹ 4,41,324" },
            { type: "Double Spread", base: "₹ 6,78,960" }
        ]
    },
    "mag-forbes": {
        name: "Forbes India",
        category: "Business",
        circulation: "75K",
        frequency: "Bi-Weekly",
        image: "https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg",
        description: "Forbes India is the premier destination for business and financial news. It is a highly respected publication targeting top executives, investors, and entrepreneurs. Advertising in Forbes provides high credibility and premium placement among decision-makers.",
        options: [
            { type: "Full Page", base: "₹ 3,80,000" },
            { type: "Article", base: "₹ 4,10,000" },
            { type: "Inside Cover", base: "₹ 4,60,000" }
        ]
    },
    "mag-india-today": {
        name: "India Today",
        category: "News",
        circulation: "550.0K",
        frequency: "Weekly",
        image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg",
        description: "India Today is a leading weekly news magazine covering politics, business, and current events. With massive reach and deep penetration across India, it is a top media choice for national campaigns and broad audience targeting.",
        options: [
            { type: "Full Page", base: "₹ 2,90,000" },
            { type: "Half Page", base: "₹ 1,50,000" },
            { type: "Cover Page", base: "₹ 4,50,000" }
        ]
    },
    "mag-femina": {
        name: "Femina",
        category: "Lifestyle",
        circulation: "178.0K",
        frequency: "Bi-Weekly",
        image: "https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg",
        description: "Femina has been India's most read women's English magazine for over six decades. It covers a wide range of topics including relationships, beauty, fashion, and careers, making it the perfect platform to connect with urban Indian women.",
        options: [
            { type: "Full Page", base: "₹ 1,80,000" },
            { type: "Article", base: "₹ 2,10,000" },
            { type: "Double Spread", base: "₹ 3,50,000" }
        ]
    },
    "mag-business-today": {
        name: "Business Today",
        category: "Business",
        circulation: "195.0K",
        frequency: "Bi-Weekly",
        image: "https://images.pexels.com/photos/6335/man-coffee-cup-pen.jpg",
        description: "Business Today is the largest-circulated business fortnightly in India. It guarantees advertisers reach to the corporate elite, business leaders, and investors who make critical financial decisions.",
        options: [
            { type: "Full Page", base: "₹ 1,75,000" },
            { type: "Article", base: "₹ 2,00,000" },
            { type: "Cover Page", base: "₹ 3,25,000" }
        ]
    },
    "mag-inflight": {
        name: "Air India Inflight",
        category: "Inflight",
        circulation: "158.0K",
        frequency: "Monthly",
        image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
        description: "Air India's inflight magazine reaches a captive audience of frequent flyers, corporate executives, and leisure travelers. It provides unmatched visibility and high brand recall among premium demographics.",
        options: [
            { type: "Full Page", base: "₹ 4,50,000" },
            { type: "Double Spread", base: "₹ 8,50,000" },
            { type: "Cover Page", base: "₹ 10,00,000" }
        ]
    }
};

function FaqItem({ q, a }: { q: string, a: string }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{q}</h4>
                {open ? <ChevronUp size={20} color="#F6B100" /> : <ChevronDown size={20} color="#F6B100" />}
            </button>
            {open && <p style={{ margin: "12px 0 0", fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>{a}</p>}
        </div>
    );
}

export default function MagazineDetails(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const mag = id ? MAGAZINE_DB[id] : null;

    if (!mag) {
        return (
            <div style={{ padding: "64px 20px", textAlign: "center", backgroundColor: "#FFFBEB", minHeight: "80vh" }}>
                <h2>Magazine Not Found</h2>
                <button onClick={() => nav("/media")} style={{ marginTop: 20, padding: "10px 20px", background: "#F6B100", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Back to Media</button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
            {/* Hero Section */}
            <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", paddingTop: 40, paddingBottom: 40 }}>
                <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
                    <button
                        onClick={() => nav("/media/category/magazines")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#6B7280", cursor: "pointer", fontWeight: 600, fontSize: 14, marginBottom: 24, padding: 0 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Magazines
                    </button>

                    <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                        <div style={{ width: 200, height: 260, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                            <img src={mag.image} alt={mag.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 300 }}>
                            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Advertising in {mag.name}</h1>
                            <div style={{ display: "inline-block", background: "#FEF3C7", color: "#B45309", padding: "6px 14px", borderRadius: 20, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>{mag.category}</div>

                            <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{mag.circulation}</div>
                                    <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Circulation</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{mag.frequency}</div>
                                    <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Frequency</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", color: "#111827" }}>About Advertising in {mag.name}</h3>
                            <p style={{ margin: 0, color: "#4B5563", fontSize: 15, lineHeight: 1.6 }}>{mag.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section style={{ maxWidth: 1120, margin: "40px auto 80px", padding: "0 16px" }}>

                {/* Top Choices Grid */}
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>Top Choice</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20, marginBottom: 48 }}>
                    {mag.options.map((opt: any, i: number) => (
                        <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 24px" }}>{opt.type}</h3>
                            <div style={{ marginTop: "auto" }}>
                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Base Rate</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>{opt.base} Per Insert</div>
                                <button style={{ width: "100%", background: "#F6B100", color: "#111827", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                                    Add to Bag
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Blocks mimicking TheMediaAnt SEO copy */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 40, border: "1px solid #E5E7EB", marginBottom: 48 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>{mag.name} Advertising Cost</h2>
                    <p style={{ color: "#4B5563", lineHeight: 1.7, marginBottom: 24 }}>
                        Advertising Option costs may vary on the popular media option chosen like Cover Page, Full Page Ads, Half Page Ads and more. Our pricing models for {mag.name} Advertising Cost are according to the media options selected by the advertisers. Add your requirements to bag for discounted rates.
                    </p>

                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>Why Advertise In {mag.name}?</h2>
                    <p style={{ color: "#4B5563", lineHeight: 1.7, marginBottom: 16 }}>
                        {mag.name} advertising provides a unique opportunity for brand owners. The magazine itself is produced by a quality publisher and is utilized by many prestigious, high-end brands to support their advertising campaigns. It is a proven method to target decision-makers, affluent consumers, and opinion leaders.
                    </p>
                    <ul style={{ paddingLeft: 20, color: "#4B5563", lineHeight: 1.8, marginBottom: 0 }}>
                        <li><strong>Message Impact:</strong> Full-page Print Magazine ads are rich with color and visual imagery.</li>
                        <li><strong>Audience Interest:</strong> Readers typically have a strong interest in the theme or topic of the Magazine.</li>
                        <li><strong>Repeated Exposure:</strong> Gives you the potential to reach a large number of people with one copy and the same reader multiple times.</li>
                    </ul>
                </div>

                {/* FAQs */}
                <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 40, border: "1px solid #E5E7EB", marginBottom: 48 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>{mag.name} Advertising FAQs</h2>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <FaqItem q={`What Is The Effectiveness Of ${mag.name} Advertising?`} a="Full-page print ads are rich with visual imagery and attract strong audience interest. Since magazines are static and have a long shelf life, your ad gets repeated exposure over weeks or months." />
                        <FaqItem q={`How Can BeeEchoo Help You?`} a="BeeEchoo is uniquely positioned to help you grow your business with highly effective, targeted media buying. We provide the best discounted rates and campaign execution." />
                        <FaqItem q={`Which Ways Does ${mag.name} Deliver Engagement?`} a={`The positive brand values of ${mag.name} transfer onto the advertisements. Readers trust the content, meaning ad clutter is not a problem, leading to direct action from the targeting without wastage.`} />
                    </div>
                </div>

            </section>
        </div>
    );
}
