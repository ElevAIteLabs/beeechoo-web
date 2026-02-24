// src/components/Footer.tsx

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

// const LOGO_IMG = './src/assets/bee_logo.png';
import beeLogo from '../assets/bee_logo.png';
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 64,
        borderTop: '2px solid #F6B100',
        background:
          'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 60%, #FFFFFF 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: 'clamp(1.5rem, 5vw, 2rem) 1rem',
        }}
      >
        {/* 4-column layout - responsive */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(1.5rem, 5vw, 1.5rem)',
          }}
        >
          {/* About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Link to="/" className="be-logo" style={{ textDecoration: 'none' }}>
               <img
  src={beeLogo}          // 👈 use the imported variable
  alt="Bee Echoo"
  className="be-logoImg"
  style={{ width: 140, height: 80 }}
/>
              </Link>
            </div>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: '#6B7280',
                margin: '0 0 12px',
              }}
            >
              The ultimate marketplace connecting creators, studios, advertisers,
              and event organizers.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111827',
                    textDecoration: 'none',
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontWeight: 600,
                marginBottom: 12,
                fontSize: 16,
                color: '#111827',
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 14,
                color: '#6B7280',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {['About Us', 'How It Works', 'Become a Host', 'Pricing', 'Blog'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        textDecoration: 'none',
                        color: '#6B7280',
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              style={{
                fontWeight: 600,
                marginBottom: 12,
                fontSize: 16,
                color: '#111827',
              }}
            >
              Support
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 14,
                color: '#6B7280',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {[
                'Help Center',
                'Terms of Service',
                'Privacy Policy',
                'Trust & Safety',
                'Contact Us',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      textDecoration: 'none',
                      color: '#6B7280',
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontWeight: 600,
                marginBottom: 12,
                fontSize: 16,
                color: '#111827',
              }}
            >
              Contact
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 14,
                color: '#6B7280',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Mail size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>hello@beeechoo.com</span>
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Phone size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>+91 93814 01197</span>
              </li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>The Skyview, Sy no 83/1, Hitech City Main Rd, Raidurgam, Hyderabad - 500081</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            marginTop: 24,
            paddingTop: 16,
            textAlign: 'center',
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          © {currentYear} Bee Echoo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
