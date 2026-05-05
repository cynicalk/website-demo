import { useState, useEffect, useMemo, useRef } from "react";

// ---- CONSTANTS ----
const WA_NUMBER = "919XXXXXXXXX";
const waUrl = (msg = "") =>
  `https://wa.me/${WA_NUMBER}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;

const GRADIENTS = {
  "#6B1F2A": "linear-gradient(135deg, #6B1F2A 30%, #8B3040 100%)",
  "#EFE9DF": "linear-gradient(135deg, #EFE9DF 30%, #D4C8B8 100%)",
  "#2D7D7D": "linear-gradient(135deg, #2D7D7D 30%, #3A9A9A 100%)",
  "#1F2A4A": "linear-gradient(135deg, #1F2A4A 30%, #2D3F70 100%)",
  "#F0EBE0": "linear-gradient(135deg, #F0EBE0 30%, #E0D8C8 100%)",
  "#8B3040": "linear-gradient(135deg, #8B3040 30%, #B84060 100%)",
};

// ---- CURRENCIES ----
const CURRENCIES = {
  INR: { symbol: "₹", label: "INR", rate: 1,      locale: "en-IN" },
  USD: { symbol: "$", label: "USD", rate: 0.012,   locale: "en-US" },
  GBP: { symbol: "£", label: "GBP", rate: 0.0095, locale: "en-GB" },
  AED: { symbol: "AED ", label: "AED", rate: 0.044, locale: "en-AE" },
  EUR: { symbol: "€", label: "EUR", rate: 0.011,   locale: "de-DE" },
  SGD: { symbol: "S$", label: "SGD", rate: 0.016,  locale: "en-SG" },
};
function formatPrice(priceVal, currency = "INR") {
  const { symbol, rate, locale } = CURRENCIES[currency];
  const val = Math.round(priceVal * rate);
  const formatted = val.toLocaleString(locale);
  return `${symbol}${formatted}`;
}

// ---- CRAFT GLOSSARY ----
const GLOSSARY = {
  "Sozni":    "Fine needle embroidery stitched by hand on silk or organza. A single shawl can take 3–6 months. The name comes from the Kashmiri word for 'needle'.",
  "Kani":     "Weaving done with small wooden sticks called kanis. Every colour change is a hand decision — no machine can replicate it. A single saree can take weeks.",
  "Tilla":    "Gold and silver metallic thread embroidery, originally a royal art from the Mughal era. Used on bridal and festive wear.",
  "Phiran":   "A long, loose traditional Kashmiri cloak worn by both men and women, often embroidered. Think of it as Kashmir's answer to the kaftan.",
  "Crewel":   "Wool-on-cotton embroidery depicting Kashmir's chinars, flowers and wildlife. Bold, colourful and distinctly Kashmiri.",
  "Pashmina": "Fine cashmere wool from the Changthangi goat, native to high-altitude Ladakh. Prized for exceptional softness — far finer than regular wool.",
  "Organza":  "A sheer, lightweight silk fabric — the classic base for Sozni embroidered sarees and dupattas.",
  "Anarkali": "A long, flared salwar suit silhouette — named after the legendary Mughal-era dancer Anarkali. Fitted at the top, flowing below.",
  "Wazwan":   "A grand multi-course ceremonial feast, central to Kashmiri culture and hospitality. A meal that can run 30+ dishes.",
};

// ---- STYLES ----
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ivory: #F9F6F0;
    --ivory-dark: #EFE9DF;
    --ivory-warm: #F2EDE4;
    --maroon: #6B1F2A;
    --maroon-light: #8B3040;
    --maroon-deep: #4A1019;
    --gold: #B8975A;
    --gold-light: #D4AF7A;
    --walnut: #3D2B1F;
    --walnut-mid: #5C4030;
    --walnut-pale: #8B6B58;
    --text: #1C1410;
    --text-mid: #4A3728;
    --text-light: #7A6458;
    --white: #FFFFFF;
    --border: rgba(107,31,42,0.12);
    --shadow: 0 4px 32px rgba(60,20,20,0.10);
    --shadow-card: 0 2px 16px rgba(60,20,20,0.08);
    --font-head: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'Jost', sans-serif;
    --transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  }

  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }

  body {
    font-family: var(--font-body);
    background: var(--ivory);
    color: var(--text);
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: var(--ivory);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 60px;
    transition: var(--transition);
  }
  .nav.scrolled { box-shadow: 0 2px 20px rgba(60,20,20,0.08); }
  .nav-logo {
    font-family: var(--font-head);
    font-size: 26px; font-weight: 500; letter-spacing: 0.06em;
    color: var(--maroon); cursor: pointer; text-decoration: none;
  }
  .nav-logo span { color: var(--gold); font-style: italic; }
  .nav-actions { display: flex; align-items: center; gap: 16px; }
  .nav-menu-btn {
    background: none; border: none; cursor: pointer;
    display: flex; flex-direction: column; gap: 5px; padding: 4px;
  }
  .nav-menu-btn span {
    display: block; width: 22px; height: 1.5px; background: var(--maroon);
    transition: var(--transition);
  }
  .nav-icon {
    background: none; border: none; cursor: pointer;
    color: var(--maroon); font-size: 18px; padding: 4px;
    display: flex; align-items: center;
  }

  /* DRAWER NAV */
  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(28,20,16,0.5);
    z-index: 200; opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .drawer-overlay.open { opacity: 1; pointer-events: all; }
  .drawer {
    position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
    background: var(--ivory); z-index: 201;
    transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    display: flex; flex-direction: column; padding: 0;
    overflow-y: auto;
  }
  .drawer.open { transform: translateX(0); }
  .drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .drawer-logo { font-family: var(--font-head); font-size: 22px; color: var(--maroon); font-weight: 500; }
  .drawer-close {
    background: none; border: none; cursor: pointer; font-size: 22px;
    color: var(--text-light); padding: 4px;
  }
  .drawer-nav { padding: 24px 0; flex: 1; }
  .drawer-nav a, .drawer-nav button {
    display: block; width: 100%;
    padding: 14px 24px; text-align: left;
    font-family: var(--font-head); font-size: 20px; font-weight: 400; letter-spacing: 0.03em;
    color: var(--text); background: none; border: none; cursor: pointer;
    text-decoration: none;
    border-bottom: 1px solid rgba(107,31,42,0.06);
    transition: color 0.2s, padding-left 0.2s;
  }
  .drawer-nav a:hover, .drawer-nav button:hover { color: var(--maroon); padding-left: 32px; }
  .drawer-footer { padding: 24px; border-top: 1px solid var(--border); }
  .drawer-footer p { font-size: 12px; color: var(--text-light); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
  .drawer-social { display: flex; gap: 16px; }
  .drawer-social a { color: var(--maroon); font-size: 18px; text-decoration: none; }

  /* PAGE WRAPPER */
  .page { padding-top: 60px; min-height: 100vh; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* HERO */
  .hero {
    position: relative; height: calc(100svh - 60px);
    background: var(--maroon-deep);
    display: flex; flex-direction: column; justify-content: flex-end;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, #6B1F2A 0%, #3D1015 40%, #1C0A0E 100%);
  }
  .hero-pattern {
    position: absolute; inset: 0; opacity: 0.06;
    background-image: radial-gradient(circle at 2px 2px, var(--gold) 1px, transparent 0);
    background-size: 32px 32px;
  }
  .hero-embroidery {
    position: absolute; top: 0; right: -20px; width: 65%; height: 70%;
    background: linear-gradient(135deg, rgba(184,151,90,0.15) 0%, transparent 60%);
    border-radius: 0 0 0 60%;
  }
  .hero-chinar {
    position: absolute; top: 18px; right: 18px; width: 180px; height: 220px;
    opacity: 0.08; pointer-events: none;
  }
  .hero-content { position: relative; z-index: 2; padding: 40px 24px 48px; }
  .hero-label {
    font-family: var(--font-body); font-size: 11px; letter-spacing: 0.25em;
    text-transform: uppercase; color: var(--gold-light); margin-bottom: 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .hero-label::before { content: ''; display: block; width: 32px; height: 1px; background: var(--gold); }
  .hero-title {
    font-family: var(--font-head); font-size: 52px; font-weight: 300;
    line-height: 1.05; color: var(--white); margin-bottom: 12px;
    letter-spacing: -0.01em;
  }
  .hero-title em { color: var(--gold-light); font-style: italic; }
  .hero-sub {
    font-size: 13px; color: rgba(255,255,255,0.6);
    letter-spacing: 0.08em; margin-bottom: 36px;
    line-height: 1.8;
  }
  .hero-ctas { display: flex; flex-direction: column; gap: 12px; }
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--gold); color: var(--maroon-deep);
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 16px 32px; border: none; cursor: pointer;
    text-decoration: none; transition: var(--transition);
  }
  .btn-primary:hover { background: var(--gold-light); }
  .btn-outline {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; color: var(--white);
    font-family: var(--font-body); font-size: 12px; font-weight: 400;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 15px 32px; border: 1px solid rgba(255,255,255,0.3); cursor: pointer;
    text-decoration: none; transition: var(--transition);
  }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .hero-scroll {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .hero-scroll-line {
    width: 1px; height: 36px; background: linear-gradient(to bottom, var(--gold), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.4; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.1); }
  }

  /* MARQUEE */
  .marquee-wrap { background: var(--maroon); padding: 12px 0; overflow: hidden; }
  .marquee-inner {
    display: flex; gap: 0; white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .marquee-item {
    display: inline-flex; align-items: center; gap: 24px;
    padding: 0 32px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.75);
  }
  .marquee-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }

  /* SECTIONS */
  .section { padding: 60px 20px; }
  .section-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .section-title { font-family: var(--font-head); font-size: 36px; font-weight: 400; line-height: 1.15; color: var(--text); margin-bottom: 8px; }
  .section-title em { font-style: italic; color: var(--maroon); }
  .section-sub { font-size: 13px; color: var(--text-light); line-height: 1.8; margin-bottom: 36px; max-width: 340px; }
  .section-divider { width: 40px; height: 2px; background: linear-gradient(to right, var(--gold), var(--maroon)); margin: 16px 0 28px; }

  /* PRODUCT GRID */
  .filters-bar {
    display: flex; gap: 8px; overflow-x: auto; padding: 0 20px 20px;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .filters-bar::-webkit-scrollbar { display: none; }
  .filter-chip {
    flex-shrink: 0; padding: 8px 16px; border: 1px solid var(--border);
    background: var(--white); color: var(--text-mid);
    font-size: 11px; letter-spacing: 0.1em; cursor: pointer;
    transition: var(--transition); white-space: nowrap;
  }
  .filter-chip.active { background: var(--maroon); color: var(--white); border-color: var(--maroon); }
  .filter-chip:hover:not(.active) { border-color: var(--maroon); color: var(--maroon); }
  .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); margin: 0 20px; }
  .product-card { background: var(--white); cursor: pointer; transition: box-shadow 0.3s ease; position: relative; overflow: hidden; }
  .product-card:hover { box-shadow: var(--shadow-card); z-index: 1; }
  .product-img-wrap { position: relative; aspect-ratio: 3/4; overflow: hidden; }
  .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
  .product-card:hover .product-img { transform: scale(1.04); }
  .product-badge { position: absolute; top: 12px; left: 12px; background: var(--maroon); color: white; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 8px; }
  .product-badge.gold { background: var(--gold); color: var(--maroon-deep); }
  .product-wa-btn {
    position: absolute; bottom: 12px; right: 12px;
    width: 36px; height: 36px; border-radius: 50%;
    background: #25D366; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; border: none;
    opacity: 0; transform: translateY(4px);
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(37,211,102,0.4);
  }
  .product-card:hover .product-wa-btn { opacity: 1; transform: translateY(0); }
  .product-info { padding: 14px 14px 18px; }
  .product-info h4 { font-family: var(--font-head); font-size: 17px; font-weight: 400; color: var(--text); margin-bottom: 4px; line-height: 1.3; }
  .product-info .fabric { font-size: 10px; letter-spacing: 0.1em; color: var(--text-light); margin-bottom: 8px; }
  .product-price { font-size: 13px; color: var(--maroon); font-weight: 500; letter-spacing: 0.05em; }
  .product-price .old { text-decoration: line-through; color: var(--text-light); margin-left: 6px; font-weight: 400; font-size: 11px; }

  /* PRODUCT PAGE */
  .product-gallery { position: relative; }
  .product-gallery-nav { display: flex; gap: 8px; padding: 12px 20px; overflow-x: auto; scrollbar-width: none; }
  .product-gallery-nav::-webkit-scrollbar { display: none; }
  .product-thumb { flex-shrink: 0; width: 72px; height: 96px; object-fit: cover; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; border: 1.5px solid transparent; }
  .product-thumb.active { opacity: 1; border-color: var(--maroon); }
  .product-detail { padding: 24px 20px 40px; }
  .product-detail-header { margin-bottom: 20px; }
  .product-detail-header .category { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .product-detail-header h1 { font-family: var(--font-head); font-size: 30px; font-weight: 400; line-height: 1.2; margin-bottom: 8px; }
  .product-detail-header .price { font-size: 18px; color: var(--maroon); font-weight: 500; }
  .product-divider { height: 1px; background: var(--border); margin: 20px 0; }
  .size-selector { margin-bottom: 24px; }
  .size-selector label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-light); display: block; margin-bottom: 10px; }
  .size-options { display: flex; gap: 8px; flex-wrap: wrap; }
  .size-btn { width: 44px; height: 44px; border: 1px solid var(--border); background: var(--white); font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); font-family: var(--font-body); color: var(--text); }
  .size-btn:hover { border-color: var(--maroon); }
  .size-btn.active { background: var(--maroon); color: white; border-color: var(--maroon); }
  .craft-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(107,31,42,0.06); border: 1px solid rgba(107,31,42,0.15); padding: 8px 14px; margin-bottom: 20px; font-size: 11px; letter-spacing: 0.08em; color: var(--maroon); }
  .product-desc { font-size: 13px; color: var(--text-mid); line-height: 1.9; margin-bottom: 28px; }
  .product-details-list { margin-bottom: 28px; }
  .product-details-list li { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 12px; list-style: none; }
  .product-details-list li span:first-child { color: var(--text-light); letter-spacing: 0.08em; text-transform: uppercase; font-size: 10px; min-width: 90px; padding-top: 1px; }
  .product-ctas { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
  .btn-wa { display: flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: white; font-family: var(--font-body); font-size: 13px; font-weight: 500; letter-spacing: 0.08em; padding: 18px; border: none; cursor: pointer; transition: background 0.2s; }
  .btn-wa:hover { background: #22c55e; }
  .btn-maroon { display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--maroon); color: white; font-family: var(--font-body); font-size: 13px; font-weight: 500; letter-spacing: 0.08em; padding: 18px; border: none; cursor: pointer; transition: background 0.2s; }
  .btn-maroon:hover { background: var(--maroon-light); }
  .btn-outline-maroon { display: flex; align-items: center; justify-content: center; gap: 10px; background: transparent; color: var(--maroon); font-family: var(--font-body); font-size: 13px; font-weight: 400; letter-spacing: 0.08em; padding: 17px; border: 1px solid var(--maroon); cursor: pointer; transition: var(--transition); }
  .btn-outline-maroon:hover { background: var(--maroon); color: white; }

  /* INQUIRY FORM */
  .inquiry-form-section { background: var(--ivory-dark); padding: 32px 20px; margin-top: 8px; }
  .inquiry-form-section h3 { font-family: var(--font-head); font-size: 24px; font-weight: 400; margin-bottom: 6px; }
  .inquiry-form-section p { font-size: 12px; color: var(--text-light); margin-bottom: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-light); margin-bottom: 6px; }
  .form-control { width: 100%; padding: 12px 14px; border: 1px solid var(--border); background: var(--white); font-family: var(--font-body); font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; border-radius: 0; -webkit-appearance: none; }
  .form-control:focus { border-color: var(--maroon); }
  .form-control::placeholder { color: var(--text-light); }
  textarea.form-control { resize: vertical; min-height: 100px; }

  /* BRAND STORY */
  .brand-story { background: var(--maroon-deep); color: white; padding: 60px 20px; position: relative; overflow: hidden; }
  .brand-story::before { content: ''; position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; border: 1px solid rgba(184,151,90,0.15); border-radius: 50%; }
  .brand-story::after { content: ''; position: absolute; top: -80px; right: -80px; width: 320px; height: 320px; border: 1px solid rgba(184,151,90,0.08); border-radius: 50%; }
  .brand-story .section-label { color: var(--gold-light); }
  .brand-story .section-title { color: white; }
  .brand-story p { font-size: 13px; line-height: 1.9; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
  .brand-stat { display: flex; gap: 32px; margin-top: 32px; }
  .brand-stat-item .num { font-family: var(--font-head); font-size: 36px; color: var(--gold-light); line-height: 1; }
  .brand-stat-item .label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 4px; }

  /* CUSTOM ORDER */
  .custom-highlight { background: var(--gold); padding: 32px 20px; text-align: center; }
  .custom-highlight h3 { font-family: var(--font-head); font-size: 28px; font-weight: 400; color: var(--maroon-deep); margin-bottom: 8px; }
  .custom-highlight p { font-size: 12px; color: rgba(74,16,25,0.7); margin-bottom: 20px; line-height: 1.7; }

  /* TESTIMONIALS */
  .testimonials { padding: 60px 0; }
  .testimonials .section-head { padding: 0 20px; margin-bottom: 32px; }
  .testimonials-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 0 20px 16px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .testimonials-scroll::-webkit-scrollbar { display: none; }
  .testimonial-card { flex-shrink: 0; width: 280px; padding: 24px; background: var(--white); border: 1px solid var(--border); }
  .testimonial-stars { color: var(--gold); font-size: 13px; margin-bottom: 14px; letter-spacing: 3px; }
  .testimonial-text { font-family: var(--font-head); font-size: 16px; line-height: 1.6; color: var(--text); font-style: italic; margin-bottom: 16px; }
  .testimonial-author { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-light); }

  /* ABOUT */
  .about-hero { height: 50vw; min-height: 240px; max-height: 360px; background: var(--maroon-deep); position: relative; overflow: hidden; display: flex; align-items: flex-end; }
  .about-hero-content { position: relative; z-index: 2; padding: 32px 20px; }
  .about-hero h1 { font-family: var(--font-head); font-size: 40px; color: white; font-weight: 300; line-height: 1.1; }
  .about-hero p { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 8px; }
  .about-block { padding: 40px 20px; border-bottom: 1px solid var(--border); }
  .about-block h2 { font-family: var(--font-head); font-size: 28px; font-weight: 400; margin-bottom: 16px; color: var(--maroon); }
  .about-block p { font-size: 13px; color: var(--text-mid); line-height: 1.9; }
  .craft-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 40px 20px; }
  .craft-item { text-align: center; padding: 24px 12px; background: var(--white); border: 1px solid var(--border); }
  .craft-icon { font-size: 28px; margin-bottom: 12px; }
  .craft-item h4 { font-family: var(--font-head); font-size: 18px; margin-bottom: 6px; color: var(--maroon); }
  .craft-item p { font-size: 11px; color: var(--text-light); line-height: 1.7; }

  /* BLOG */
  .blog-grid { display: flex; flex-direction: column; gap: 0; }
  .blog-card { display: flex; gap: 16px; padding: 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; }
  .blog-card:hover { background: var(--ivory-dark); }
  .blog-img { flex-shrink: 0; width: 100px; height: 100px; background: var(--ivory-dark); object-fit: cover; }
  .blog-info .tag { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  .blog-info h4 { font-family: var(--font-head); font-size: 18px; font-weight: 400; line-height: 1.3; margin-bottom: 6px; }
  .blog-info p { font-size: 12px; color: var(--text-light); line-height: 1.6; }
  .blog-info .date { font-size: 10px; color: var(--text-light); margin-top: 8px; letter-spacing: 0.08em; }

  /* POLICIES */
  .policy-block { padding: 32px 20px; border-bottom: 1px solid var(--border); }
  .policy-block h2 { font-family: var(--font-head); font-size: 24px; font-weight: 400; color: var(--maroon); margin-bottom: 16px; }
  .policy-block p, .policy-block li { font-size: 13px; color: var(--text-mid); line-height: 1.9; margin-bottom: 8px; }
  .policy-block ul { padding-left: 16px; }
  .policy-notice { background: rgba(107,31,42,0.06); border-left: 3px solid var(--maroon); padding: 16px 20px; margin: 16px 0; }
  .policy-notice p { color: var(--maroon); font-size: 13px; line-height: 1.7; }

  /* FOOTER */
  .footer { background: var(--walnut); color: rgba(255,255,255,0.7); padding: 48px 20px 32px; }
  .footer-logo { font-family: var(--font-head); font-size: 30px; color: white; margin-bottom: 8px; }
  .footer-tagline { font-size: 11px; letter-spacing: 0.15em; color: var(--gold-light); margin-bottom: 32px; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
  .footer-col h5 { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: white; margin-bottom: 16px; }
  .footer-col a, .footer-col p { display: block; font-size: 13px; color: rgba(255,255,255,0.55); margin-bottom: 10px; text-decoration: none; cursor: pointer; transition: color 0.2s; }
  .footer-col a:hover { color: var(--gold-light); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; }

  /* FLOATING WA */
  .wa-float { position: fixed; bottom: 24px; right: 20px; z-index: 150; display: flex; align-items: center; gap: 10px; }
  .wa-float-btn { width: 56px; height: 56px; border-radius: 50%; background: #25D366; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(37,211,102,0.5); animation: waPulse 3s ease-in-out infinite; transition: transform 0.2s; }
  .wa-float-btn:hover { transform: scale(1.1); }
  @keyframes waPulse { 0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.5); } 50% { box-shadow: 0 4px 32px rgba(37,211,102,0.75), 0 0 0 8px rgba(37,211,102,0.1); } }
  .wa-float-label { background: var(--walnut); color: white; padding: 8px 14px; font-size: 11px; letter-spacing: 0.05em; border-radius: 2px; box-shadow: var(--shadow); white-space: nowrap; animation: fadeSlide 0.3s ease; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }

  /* UTILS */
  .text-center { text-align: center; }
  .mt-8 { margin-top: 8px; }
  .row { display: flex; gap: 12px; }
  .row > * { flex: 1; }
  .divider { height: 1px; background: var(--border); margin: 0 20px; }

  /* BOTTOM NAV */
  .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 99; background: var(--white); border-top: 1px solid var(--border); display: flex; height: 58px; padding-bottom: env(safe-area-inset-bottom); }
  .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; background: none; border: none; color: var(--text-light); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; position: relative; }
  .bottom-nav-item.active { color: var(--maroon); }
  .bottom-nav-item.active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 2px; background: var(--gold); border-radius: 0 0 2px 2px; }
  .bottom-nav-item svg { width: 20px; height: 20px; }

  /* COLLECTION PAGE */
  .collections-header { padding: 40px 20px 20px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
  .filter-sort-bar { display: flex; gap: 8px; padding: 0 20px 16px; align-items: center; }
  .sort-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--border); background: var(--white); font-size: 11px; letter-spacing: 0.08em; color: var(--text-mid); cursor: pointer; margin-left: auto; transition: var(--transition); }
  .sort-btn.active { border-color: var(--maroon); color: var(--maroon); }
  .count-label { font-size: 11px; color: var(--text-light); letter-spacing: 0.08em; }
  .shimmer { background: linear-gradient(90deg, var(--ivory-dark) 25%, var(--ivory) 50%, var(--ivory-dark) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  /* ═══════════════════════════════
     CATEGORY SECTIONS
  ═══════════════════════════════ */

  .afc-label {
    font-family: var(--font-body);
    font-size: 10px; font-weight: 300; letter-spacing: 0.28em;
    text-transform: uppercase; display: block; margin-bottom: 12px;
  }
  .afc-title { font-family: var(--font-head); font-weight: 300; line-height: 1.12; margin-bottom: 14px; }
  .afc-desc { font-family: var(--font-body); font-weight: 300; line-height: 1.75; letter-spacing: 0.01em; }
  .afc-cta {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-body); font-size: 11px; font-weight: 400;
    letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; background: none; border: none; padding: 0;
    transition: gap 0.35s ease;
  }
  .afc-cta::after { content: ''; display: block; width: 28px; height: 1px; background: currentColor; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
  .afc-cta:hover::after { width: 44px; }

  /* Scroll reveal */
  .afc-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1); }
  .afc-reveal.afc-visible { opacity: 1; transform: translateY(0); }
  .afc-d1 { transition-delay: 0.12s; }
  .afc-d2 { transition-delay: 0.24s; }
  .afc-d3 { transition-delay: 0.36s; }

  /* Image blocks */
  .afc-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .afc-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); filter: brightness(0.92) saturate(0.88); }
  .afc-img:hover img { transform: scale(1.04); }
  .afc-img-hint { font-family: var(--font-head); font-style: italic; font-size: 10px; color: rgba(255,255,255,0.15); letter-spacing: 0.05em; text-align: center; padding: 16px; line-height: 1.6; pointer-events: none; position: relative; z-index: 1; max-width: 180px; }

  /* Crafted strip */
  .afc-strip { background: var(--gold); padding: 11px 16px; display: flex; align-items: center; justify-content: center; gap: 18px; overflow: hidden; flex-wrap: wrap; }
  .afc-strip-text { font-family: var(--font-body); font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--walnut); white-space: nowrap; }
  .afc-strip-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--walnut); opacity: 0.4; flex-shrink: 0; }

  /* Ornament divider */
  .afc-ornament { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 40px 24px; color: var(--gold); }
  .afc-ornament::before, .afc-ornament::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(184,151,90,0.4), transparent); max-width: 110px; }
  .afc-ornament-g { font-family: var(--font-head); font-size: 18px; font-style: italic; opacity: 0.65; }

  /* Quote block */
  .afc-quote { background: var(--maroon-deep); padding: 56px 28px; text-align: center; position: relative; overflow: hidden; }
  .afc-quote::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center top, rgba(184,151,90,0.07), transparent 65%); }
  .afc-qmark { font-family: var(--font-head); font-size: 90px; color: rgba(184,151,90,0.1); line-height: 0.5; display: block; margin-bottom: -14px; position: relative; z-index: 2; }
  .afc-qtext { font-family: var(--font-head); font-style: italic; font-size: clamp(18px,4vw,32px); font-weight: 300; color: var(--ivory); line-height: 1.45; max-width: 600px; margin: 0 auto 16px; position: relative; z-index: 2; }
  .afc-qcite { font-family: var(--font-body); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); position: relative; z-index: 2; }

  /* §1 SAREES */
  .afc-sarees { position: relative; min-height: 90vh; background: var(--maroon-deep); display: flex; align-items: flex-end; overflow: hidden; }
  .afc-sarees-bg { position: absolute; inset: 0; background: linear-gradient(160deg,#6B1F2A 0%,#3D1015 55%,#1C0508 100%); }
  .afc-sarees-img { position: absolute; inset: 0; overflow: hidden; }
  .afc-sarees-img .afc-img { height: 100%; background: linear-gradient(160deg,#5a1520,#2a0a0e); }
  .afc-sarees-ov { position: absolute; inset: 0; background: linear-gradient(to top,rgba(26,6,9,0.92) 0%,rgba(26,6,9,0.5) 35%,rgba(26,6,9,0.08) 70%,transparent 100%); }
  .afc-sarees-pat { position: absolute; inset: 0; background-image: radial-gradient(circle at 2px 2px,rgba(184,151,90,0.1) 1px,transparent 0); background-size: 28px 28px; pointer-events: none; }
  .afc-sarees-cnt { position: relative; z-index: 3; padding: 40px 24px 52px; max-width: 520px; }
  .afc-sarees-cnt .afc-title { font-size: clamp(42px,9vw,84px); color: var(--ivory); font-style: italic; }
  .afc-sarees-cnt .afc-desc { color: rgba(242,237,228,0.7); font-size: 14px; max-width: 340px; }
  .afc-tags { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 10px; }
  .afc-tag { border: 1px solid rgba(184,151,90,0.32); padding: 4px 11px; font-family: var(--font-body); font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(184,151,90,0.65); }

  /* §2 SUITS */
  .afc-suits { display: grid; grid-template-columns: 1fr 1fr; background: var(--ivory); overflow: hidden; }
  .afc-suits-img { background: linear-gradient(145deg,#d4c3b2,#b09882); min-height: 380px; display: flex; align-items: center; justify-content: center; }
  .afc-suits-r { padding: 48px 28px 48px 32px; background: var(--ivory-warm); display: flex; flex-direction: column; justify-content: space-between; }
  .afc-suits-r .afc-title { font-size: clamp(28px,4.5vw,56px); color: var(--walnut); }
  .afc-suits-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
  .afc-mini-c { aspect-ratio: 3/4; position: relative; overflow: hidden; cursor: pointer; }
  .afc-mini-c:nth-child(1) { background: linear-gradient(145deg,#c8b8a4,#9a8070); }
  .afc-mini-c:nth-child(2) { background: linear-gradient(145deg,#d4c4b0,#b09878); }
  .afc-mini-l { position: absolute; bottom: 6px; left: 6px; font-family: var(--font-body); font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ivory); background: rgba(26,18,14,0.55); padding: 2px 7px; }
  .afc-suits-quote { font-family: var(--font-head); font-style: italic; font-size: 14px; color: var(--text-light); border-left: 2px solid var(--gold); padding-left: 12px; margin-top: 16px; line-height: 1.55; }
    @media(max-width:640px){ .afc-suits{grid-template-columns:1fr} .afc-suits-img{min-height:260px} .afc-suits-r{padding:28px 20px} .afc-suits-mini{display:none} }
    @media(min-width:641px){ .afc-suits{grid-template-columns:1fr 1fr} }
  /* §3 STOLES */
  .afc-stoles { background: var(--white); padding: 80px 24px; text-align: center; }
  .afc-stoles-inner { max-width: 800px; margin: 0 auto; }
  .afc-stoles-inner .afc-title { font-size: clamp(34px,6.5vw,72px); color: var(--walnut); font-style: italic; }
  .afc-stoles-strip { display: flex; gap: 12px; margin-top: 44px; height: 280px; }
  .afc-stoles-c { flex: 1; overflow: hidden; }
  .afc-stoles-c:nth-child(1) .afc-img { background: linear-gradient(160deg,#e8e0d0,#d0c4b0); height: 100%; }
  .afc-stoles-c:nth-child(2) { flex: 1.6; }
  .afc-stoles-c:nth-child(2) .afc-img { background: linear-gradient(160deg,#ddd5c4,#c4b89e); height: 100%; }
  .afc-stoles-c:nth-child(3) .afc-img { background: linear-gradient(160deg,#ece5d6,#d8cdba); height: 100%; }
  @media(max-width:640px){ .afc-stoles-strip{height:160px;gap:6px} }
  @media(min-width:641px){ .afc-stoles-strip{height:280px;gap:12px} }
  /* §4 KURTIS */
  .afc-kurtis { background: var(--ivory-warm); padding: 72px 20px 60px; }
  .afc-kurtis-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
  .afc-kurtis-hdr .afc-title { font-size: clamp(26px,4.5vw,52px); color: var(--walnut); }
  .afc-kurtis-hdr-r { text-align: right; }
  .afc-kgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .afc-kcard { cursor: pointer; }
  .afc-kcard-img { aspect-ratio: 3/4; overflow: hidden; position: relative; margin-bottom: 12px; }
  .afc-kcard:nth-child(1) .afc-kcard-img .afc-img { background: linear-gradient(160deg,#c8b8a4,#a89070); height: 100%; }
  .afc-kcard:nth-child(2) .afc-kcard-img .afc-img { background: linear-gradient(160deg,#d0c2ae,#b09878); height: 100%; }
  .afc-kcard:nth-child(3) .afc-kcard-img .afc-img { background: linear-gradient(160deg,#c4b4a0,#a08868); height: 100%; }
  .afc-kbar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--gold); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
  .afc-kcard:hover .afc-kbar { transform: scaleX(1); }
  .afc-kname { font-family: var(--font-head); font-size: 17px; font-style: italic; color: var(--walnut); margin-bottom: 3px; }
  .afc-ksub { font-family: var(--font-body); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--walnut-pale); }
  @media(max-width:640px){ .afc-kgrid{grid-template-columns:repeat(3,1fr);gap:8px} .afc-kurtis{padding:56px 16px 48px} .afc-kurtis-hdr{flex-direction:column;align-items:center;text-align:center} .afc-kurtis-hdr .afc-title{text-align:center} .afc-kurtis-hdr-r{text-align:center} .afc-kurtis-hdr-r .afc-cta{justify-content:center} }
  @media(min-width:641px){ .afc-kgrid{grid-template-columns:repeat(3,1fr);gap:16px} .afc-kurtis-hdr{flex-direction:row;align-items:flex-end;text-align:left} .afc-kurtis-hdr .afc-title{text-align:left} .afc-kurtis-hdr-r{text-align:right} .afc-kurtis-hdr-r .afc-cta{justify-content:flex-end} }
  /* §5 CORD SETS */
  .afc-cord { background: var(--walnut); display: flex; min-height: 72vh; overflow: hidden; }
  .afc-cord-img { flex: 1.1; background: linear-gradient(145deg,#4a3020,#2a1808); display: flex; align-items: center; justify-content: center; min-height: 400px; }
  .afc-cord-txt { flex: 0.9; padding: 56px 36px 56px 44px; display: flex; flex-direction: column; justify-content: center; }
  .afc-cord-txt .afc-title { font-size: clamp(28px,4vw,58px); color: var(--ivory); }
  .afc-cord-txt .afc-title em { color: var(--gold-light); font-style: italic; }
  .afc-cord-txt .afc-desc { color: rgba(242,237,228,0.62); max-width: 280px; margin-top: 10px; }
  @media(max-width:640px){ .afc-cord{flex-direction:column} .afc-cord-img{min-height:200px;max-height:220px} .afc-cord-txt{padding:32px 20px;text-align:center;align-items:center} .afc-cord-txt .afc-desc{max-width:100%;text-align:center} .afc-cord-txt .afc-tags{justify-content:center} }
  @media(min-width:641px){ .afc-cord{flex-direction:row} .afc-cord-img{min-height:400px;max-height:none} .afc-cord-txt{padding:56px 36px 56px 44px;text-align:left;align-items:flex-start} .afc-cord-txt .afc-desc{max-width:280px;text-align:left} .afc-cord-txt .afc-tags{justify-content:flex-start} }
  /* §6 KAFTANS */
  .afc-kaftans { position: relative; min-height: 82vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .afc-kaftans-bg { position: absolute; inset: 0; background: linear-gradient(180deg,#5c4030,#3d2010); }
  .afc-kaftans-bg .afc-img { height: 100%; }
  .afc-kaftans-ov { position: absolute; inset: 0; background: linear-gradient(to bottom,rgba(26,14,6,0.28) 0%,rgba(26,14,6,0.6) 50%,rgba(26,14,6,0.32) 100%); }
  .afc-kaftans-cnt { position: relative; z-index: 3; text-align: center; padding: 72px 28px; max-width: 560px; }
  .afc-kaftans-cnt .afc-title { font-size: clamp(48px,10vw,100px); color: var(--ivory); font-style: italic; letter-spacing: 0.02em; }
  .afc-kaftans-cnt .afc-desc { color: rgba(242,237,228,0.67); font-size: 14px; max-width: 360px; margin: 0 auto; }
  .afc-kaftans-line { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right,transparent,rgba(184,151,90,0.45),transparent); }

  /* §7 BAGS */
  .afc-bags { display: grid; grid-template-columns: 38% 62%; min-height: 68vh; background: var(--walnut-mid); overflow: hidden; }
  .afc-bags-txt { background: var(--walnut); padding: 56px 32px 56px 28px; display: flex; flex-direction: column; justify-content: center; }
  .afc-bags-txt .afc-title { font-size: clamp(26px,3.5vw,52px); color: var(--ivory); }
  .afc-bags-txt .afc-desc { color: rgba(232,224,212,0.58); margin-top: 12px; max-width: 230px; }
  .afc-bags-note { font-family: var(--font-head); font-style: italic; font-size: 13px; color: rgba(184,151,90,0.45); margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(184,151,90,0.1); line-height: 1.6; }
  .afc-bags-imgs { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 5px; }
  .afc-bags-imgs .afc-img { min-height: 160px; }
  .afc-bags-imgs .afc-img:nth-child(1) { grid-row: 1/3; background: linear-gradient(145deg,#4a3428,#2d1e14); }
  .afc-bags-imgs .afc-img:nth-child(2) { background: linear-gradient(145deg,#5a4030,#382818); }
  .afc-bags-imgs .afc-img:nth-child(3) { background: linear-gradient(145deg,#4e3828,#302010); }
  @media(max-width:640px){ .afc-bags{grid-template-columns:1fr} .afc-bags-txt{padding:32px 20px;text-align:center;align-items:center} .afc-bags-txt .afc-desc{max-width:100%;text-align:center} .afc-bags-note{text-align:center} .afc-bags-imgs{grid-template-columns:repeat(3,1fr);grid-template-rows:auto} .afc-bags-imgs .afc-img{min-height:120px} .afc-bags-imgs .afc-img:nth-child(1){grid-row:auto} }
  @media(min-width:641px){ .afc-bags{grid-template-columns:38% 62%} .afc-bags-txt{padding:56px 32px 56px 28px;text-align:left;align-items:flex-start} .afc-bags-txt .afc-desc{max-width:230px;text-align:left} .afc-bags-note{text-align:left} .afc-bags-imgs{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr} .afc-bags-imgs .afc-img{min-height:160px} .afc-bags-imgs .afc-img:nth-child(1){grid-row:1/3} }
  /* §8 HOME DECOR */
  .afc-decor { background: var(--ivory-warm); padding: 80px 20px 64px; }
  .afc-decor-hdr { text-align: center; margin-bottom: 44px; }
  .afc-decor-hdr .afc-title { font-size: clamp(30px,5.5vw,66px); color: var(--walnut); }
  .afc-decor-hdr .afc-desc { max-width: 420px; margin: 14px auto 0; color: var(--text-light); }
  .afc-dgrid { display: grid; grid-template-columns: 1.35fr 1fr 1fr; grid-template-rows: auto auto; gap: 12px; max-width: 960px; margin: 0 auto; }
  .afc-dc { position: relative; overflow: hidden; cursor: pointer; }
  .afc-dc:nth-child(1) { grid-row: 1/3; min-height: 420px; }
  .afc-dc:nth-child(n+2) { aspect-ratio: 4/3; }
  .afc-dc:nth-child(1) .afc-img { height: 100%; background: linear-gradient(145deg,#c8b090,#a08060); }
  .afc-dc:nth-child(2) .afc-img { background: linear-gradient(145deg,#d4b888,#b09060); height: 100%; }
  .afc-dc:nth-child(3) .afc-img { background: linear-gradient(145deg,#c8a878,#a48050); height: 100%; }
  .afc-dc:nth-child(4) .afc-img { background: linear-gradient(145deg,#d0bc98,#b09070); height: 100%; }
  .afc-dc:nth-child(5) .afc-img { background: linear-gradient(145deg,#c4aa80,#9c7850); height: 100%; }
  .afc-dc-lbl { position: absolute; bottom: 10px; left: 10px; font-family: var(--font-body); font-size: 8.5px; letter-spacing: 0.19em; text-transform: uppercase; color: var(--ivory); background: rgba(26,18,14,0.6); padding: 3px 9px; backdrop-filter: blur(4px); }
  @media(max-width:640px){ .afc-dgrid{grid-template-columns:1fr 1fr} .afc-dc:nth-child(1){grid-row:auto;grid-column:1/3;min-height:200px} }
  @media(min-width:641px){ .afc-dgrid{grid-template-columns:1.35fr 1fr 1fr} .afc-dc:nth-child(1){grid-row:1/3;grid-column:auto;min-height:420px} }
  /* §9 CONDIMENTS */
  .afc-conds-cin { position: relative; min-height: 70vh; background: linear-gradient(160deg,#8B5E3C,#5C3820 40%,#3D2010); display: flex; align-items: flex-end; overflow: hidden; }
  .afc-conds-cin .afc-img { position: absolute; inset: 0; height: 100%; }
  .afc-conds-ov { position: absolute; inset: 0; background: linear-gradient(to right,rgba(26,14,6,0.88),rgba(26,14,6,0.52) 55%,rgba(26,14,6,0.08)); }
  .afc-conds-cnt { position: relative; z-index: 3; padding: 56px 32px 64px; max-width: 460px; }
  .afc-conds-cnt .afc-title { font-size: clamp(34px,6vw,76px); color: var(--ivory); font-style: italic; }
  .afc-conds-cnt .afc-desc { color: rgba(242,237,228,0.65); margin-top: 10px; max-width: 320px; }
  .afc-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
  .afc-pill { border: 1px solid rgba(184,151,90,0.28); padding: 4px 11px; font-family: var(--font-body); font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(184,151,90,0.6); border-radius: 2px; }
  .afc-conds-stats { background: var(--walnut); display: grid; grid-template-columns: repeat(3,1fr); }
  .afc-cstat { padding: 28px 16px; border-right: 1px solid rgba(184,151,90,0.08); text-align: center; }
  .afc-cstat:last-child { border-right: none; }
  .afc-cstat-num { font-family: var(--font-head); font-size: 32px; font-style: italic; color: var(--gold); display: block; margin-bottom: 5px; }
  .afc-cstat-lbl { font-family: var(--font-body); font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(184,151,90,0.45); }
  @media(max-width:640px){ .afc-conds-cnt{padding:36px 20px 44px} .afc-conds-stats{grid-template-columns:1fr} .afc-cstat{border-right:none;border-bottom:1px solid rgba(184,151,90,0.08)} }
  @media(min-width:641px){ .afc-conds-stats{grid-template-columns:repeat(3,1fr)} .afc-cstat{border-right:1px solid rgba(184,151,90,0.08);border-bottom:none} .afc-cstat:last-child{border-right:none} }
  /* GLOSSARY TOOLTIP */
  .gloss { position: relative; display: inline; border-bottom: 1px dashed rgba(184,151,90,0.6); cursor: help; color: inherit; }
  .gloss-tip {
    position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
    width: 230px; background: var(--walnut); color: rgba(242,237,228,0.88);
    font-family: var(--font-body); font-size: 11.5px; line-height: 1.65;
    padding: 12px 14px 10px; z-index: 400; pointer-events: none;
    opacity: 0; transition: opacity 0.18s ease; white-space: normal;
    letter-spacing: 0; text-transform: none; font-weight: 300;
    box-shadow: 0 6px 28px rgba(0,0,0,0.28);
  }
  .gloss-tip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: var(--walnut); }
  .gloss-tip-term { font-family: var(--font-head); font-style: italic; font-size: 14px; color: var(--gold-light); display: block; margin-bottom: 5px; }
  .gloss:hover .gloss-tip, .gloss:focus .gloss-tip { opacity: 1; }
  .gloss:focus { outline: 1px dotted var(--gold); outline-offset: 2px; }

  /* AVAILABILITY */
  .avail { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-family: var(--font-body); }
  .avail-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .avail-instock { color: #3D9A5A; } .avail-instock .avail-dot { background: #3D9A5A; }
  .avail-mto     { color: var(--gold); } .avail-mto .avail-dot { background: var(--gold); }
  .avail-limited { color: #C07020; } .avail-limited .avail-dot { background: #C07020; }
  .avail-soldout { color: #9E9E9E; } .avail-soldout .avail-dot { background: #9E9E9E; }

  /* CURRENCY SELECTOR */
  .currency-btn { background: none; border: 1px solid var(--border); color: var(--text-mid); font-family: var(--font-body); font-size: 11px; letter-spacing: 0.06em; padding: 5px 9px; cursor: pointer; transition: border-color 0.2s; display: flex; align-items: center; gap: 4px; }
  .currency-btn:hover { border-color: var(--gold); color: var(--maroon); }
  .currency-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: var(--white); border: 1px solid var(--border); box-shadow: var(--shadow); z-index: 300; min-width: 120px; }
  .currency-option { display: block; width: 100%; text-align: left; padding: 10px 14px; font-family: var(--font-body); font-size: 12px; letter-spacing: 0.06em; background: none; border: none; cursor: pointer; color: var(--text-mid); transition: background 0.15s; }
  .currency-option:hover { background: var(--ivory-dark); color: var(--maroon); }
  .currency-option.active { color: var(--maroon); font-weight: 500; }
`;

// ---- MOCK DATA ----
const PRODUCTS = [
  { id: 1, name: "Dilruba Sozni Saree",   fabric: "Pure Organza · Sozni Embroidered", priceVal: 18500, category: "saree",       color: "maroon", tag: "Bestseller", colorHex: "#6B1F2A", availability: "Made to Order" },
  { id: 2, name: "Naaz Kani Anarkali",    fabric: "Silk · Kani Weave",               priceVal: 24000, category: "dress",       color: "ivory",  tag: "New",        colorHex: "#EFE9DF", availability: "Limited"       },
  { id: 3, name: "Wazwan Co-ord Set",     fabric: "Cotton · Block Print",            priceVal: 8200,  category: "coords",      color: "teal",   tag: "New",        colorHex: "#2D7D7D", availability: "In Stock"      },
  { id: 4, name: "Chinar Phiran Dress",   fabric: "Pashmina Blend · Tilla Work",     priceVal: 31000, category: "dress",       color: "navy",   tag: "Limited",    colorHex: "#1F2A4A", availability: "Limited"       },
  { id: 5, name: "Bagh-e-Kashmir Kurta",  fabric: "Lawn · Crewel Embroidery",        priceVal: 6800,  category: "menswear",    color: "ivory",  tag: "",           colorHex: "#F0EBE0", availability: "In Stock"      },
  { id: 6, name: "Nasreen Clutch",        fabric: "Wool · Hand-Embroidered",         priceVal: 3200,  category: "accessories", color: "maroon", tag: "Gifting",    colorHex: "#8B3040", availability: "In Stock"      },
];

const TESTIMONIALS = [
  { id: 1, text: "My Dilruba saree arrived better than imagined. The sozni work is breathtaking — craftsmanship unlike anything I've seen.", author: "Anika M., London", stars: 5 },
  { id: 2, text: "Afreen made my nikah lehenga through a custom order. Every detail was attended to with such care. Absolutely worth it.", author: "Zara K., Dubai", stars: 5 },
  { id: 3, text: "The phiran I ordered for my mother was perfect. The quality speaks for itself. Will always shop here.", author: "Rohan T., Bengaluru", stars: 5 },
];

const BLOG_POSTS = [
  { id: 1, tag: "Kashmir Stories", title: "The Art of Sozni: Needle That Tells a Thousand Tales", date: "April 2025", excerpt: "In the narrow bylanes of old Srinagar, master artisans work by lamplight..." },
  { id: 2, tag: "Style Guide", title: "How to Wear Kani: From Valley to the World Stage", date: "March 2025", excerpt: "Kani weaving is among the most labour-intensive textile arts in the world..." },
  { id: 3, tag: "Craftsmanship", title: "Tilla Work: The Gold Thread That Glitters Through Centuries", date: "February 2025", excerpt: "Centuries before Swarovski, Kashmiri artisans were threading gold..." },
];

// ---- GLOSSARY TERM COMPONENT ----
function GlossaryTerm({ term }) {
  const def = GLOSSARY[term];
  if (!def) return <span>{term}</span>;
  return (
    <span className="gloss" tabIndex={0} role="button" aria-label={`${term}: ${def}`}>
      {term}
      <span className="gloss-tip" role="tooltip">
        <span className="gloss-tip-term">{term}</span>
        {def}
      </span>
    </span>
  );
}

// Parses a fabric string and wraps known glossary terms with GlossaryTerm
function FabricDesc({ text }) {
  const termPattern = new RegExp(`(${Object.keys(GLOSSARY).join("|")})`, "g");
  const parts = text.split(termPattern);
  return (
    <span>
      {parts.map((part, i) =>
        GLOSSARY[part] ? <GlossaryTerm key={i} term={part} /> : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ---- AVAILABILITY BADGE ----
function AvailBadge({ status }) {
  const cfg = {
    "In Stock":      { cls: "avail-instock", label: "In Stock" },
    "Made to Order": { cls: "avail-mto",     label: "Made to Order · 2–4 wks" },
    "Limited":       { cls: "avail-limited", label: "Limited Stock" },
    "Sold Out":      { cls: "avail-soldout", label: "Sold Out" },
  };
  const { cls, label } = cfg[status] || cfg["Made to Order"];
  return (
    <span className={`avail ${cls}`}>
      <span className="avail-dot" />
      {label}
    </span>
  );
}

// ---- CURRENCY SELECTOR ----
function CurrencySelector({ currency, setCurrency }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <button className="currency-btn" onClick={() => setOpen(o => !o)} aria-label="Select currency">
        {CURRENCIES[currency].symbol} {currency}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div className="currency-dropdown">
          {Object.entries(CURRENCIES).map(([code, { symbol, label }]) => (
            <button key={code} className={`currency-option ${currency === code ? "active" : ""}`}
              onClick={() => { setCurrency(code); setOpen(false); }}>
              {symbol} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- SHARED COMPONENTS ----

function WAIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function WhatsAppFloat() {
  const [showLabel, setShowLabel] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShowLabel(false), 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="wa-float">
      {showLabel && <div className="wa-float-label">Chat on WhatsApp</div>}
      <button className="wa-float-btn" onClick={() => window.open(waUrl("Hi Afreen, I would like to inquire about your collection."), "_blank")} aria-label="Chat on WhatsApp">
        <WAIcon size={26} />
      </button>
    </div>
  );
}

function Marquee() {
  const items = ["Free Shipping Across India", "Custom Tailoring Available", "Artisan Made in Kashmir", "International Shipping Available", "Inquiry-Based Orders", "Hand Embroidered Collections"];
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">{item} <span className="marquee-dot" /></span>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onClick, currency = "INR" }) {
  const patId = `pc-motif-${product.id}`;
  return (
    <div className={`product-card${product.availability === "Sold Out" ? " sold-out" : ""}`} onClick={product.availability !== "Sold Out" ? onClick : undefined} style={product.availability === "Sold Out" ? {opacity:0.55,cursor:"default"} : {}}>
      <div className="product-img-wrap">
        <div style={{width:"100%",height:"100%",background:GRADIENTS[product.colorHex]||"#ccc",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,position:"relative",overflow:"hidden"}}>
          <svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={patId} x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <polygon points="24,4 32,16 44,16 35,25 39,38 24,30 9,38 13,25 4,16 16,16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
                <circle cx="24" cy="24" r="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patId})`}/>
          </svg>
          <svg viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" style={{width:44,height:54,opacity:0.28,flexShrink:0}}>
            <path d="M24 4 L17 20 L4 16 L14 28 L8 44 L24 34 L40 44 L34 28 L44 16 L31 20Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
            <line x1="24" y1="34" x2="24" y2="56" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
            <line x1="24" y1="46" x2="18" y2="54" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7"/>
            <line x1="24" y1="46" x2="30" y2="54" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7"/>
          </svg>
          <div style={{fontFamily:"var(--font-head)",fontSize:12,color:"rgba(255,255,255,0.5)",textAlign:"center",padding:"0 12px",lineHeight:1.4,letterSpacing:"0.02em"}}>{product.name}</div>
        </div>
        {product.tag && <div className={`product-badge ${product.tag==="New"?"gold":""}`}>{product.tag}</div>}
        {product.availability !== "Sold Out" && (
          <button className="product-wa-btn" aria-label={`Inquire about ${product.name}`} onClick={e=>{e.stopPropagation();window.open(waUrl("Hi, I am interested in "+product.name),"_blank");}}>
            <WAIcon size={18} />
          </button>
        )}
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <p className="fabric"><FabricDesc text={product.fabric}/></p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,gap:6,flexWrap:"wrap"}}>
          <p className="product-price" style={{margin:0}}>{formatPrice(product.priceVal, currency)}</p>
          <div style={{width:11,height:11,borderRadius:"50%",background:product.colorHex,border:"1.5px solid rgba(0,0,0,0.12)",boxShadow:"0 0 0 1.5px rgba(255,255,255,0.6)",flexShrink:0}}/>
        </div>
        <div style={{marginTop:7}}>
          <AvailBadge status={product.availability}/>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post, onNavigate }) {
  const icons = { "Kashmir Stories": "🪷", "Style Guide": "✦", "Craftsmanship": "🌿" };
  const icon = icons[post.tag] || "✦";
  const patId = `blog-pat-${post.id}`;
  return (
    <div className="blog-card" onClick={onNavigate}>
      <div className="blog-img" style={{background:"linear-gradient(135deg,#6B1F2A 0%,#B8975A 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,position:"relative",overflow:"hidden"}}>
        <svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={patId} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.08)"/>
              <path d="M15 6 Q19 10 17 15 Q15 18 13 15 Q11 10 15 6Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patId})`}/>
        </svg>
        <span style={{fontSize:22,position:"relative",zIndex:1}}>{icon}</span>
        <span style={{fontFamily:"var(--font-head)",fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",position:"relative",zIndex:1}}>{post.tag}</span>
      </div>
      <div className="blog-info">
        <div className="tag">{post.tag}</div>
        <h4>{post.title}</h4>
        <p>{post.excerpt.slice(0,60)}…</p>
        <div className="date">{post.date}</div>
      </div>
    </div>
  );
}

// ---- SCROLL REVEAL HOOK ----
function useReveal() {
  const observedRef = useRef(typeof WeakSet !== "undefined" ? new WeakSet() : null);
  const callbackRef = useRef((el) => {
    if (!el || !observedRef.current) return;
    if (observedRef.current.has(el)) return;
    observedRef.current.add(el);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("afc-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
  });
  return callbackRef.current;
}

// ---- CATEGORY SECTION COMPONENTS ----

let _afcImgCounter = 0;
function AfcImg({ children, style }) {
  const [patId] = useState(() => `afc-paisley-${_afcImgCounter++}`);
  return (
    <div className="afc-img" style={style}>
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
        <defs>
          <pattern id={patId} x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
            {/* Paisley buta */}
            <path d="M28 6 Q39 12 37 24 Q35 32 27 32 Q17 30 19 20 Q22 10 28 6Z"
              fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
            <ellipse cx="28" cy="21" rx="8" ry="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
            <circle cx="28" cy="21" r="3" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="0.7"/>
            <path d="M28 34 Q33 40 30 46 Q28 50 26 46 Q23 40 28 34Z"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7"/>
            {/* Corner dot accents */}
            <circle cx="8" cy="8" r="1" fill="rgba(255,255,255,0.06)"/>
            <circle cx="48" cy="48" r="1" fill="rgba(255,255,255,0.06)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patId})`}/>
      </svg>
      <span className="afc-img-hint">{children}</span>
    </div>
  );
}

function AfcStrip() {
  return (
    <div className="afc-strip">
      <span className="afc-strip-text">Crafted in Kashmir</span><div className="afc-strip-dot"/>
      <span className="afc-strip-text">Sozni · Tilla · Kani</span><div className="afc-strip-dot"/>
      <span className="afc-strip-text">Heritage Since Centuries</span><div className="afc-strip-dot"/>
      <span className="afc-strip-text">Pure &amp; Authentic</span>
    </div>
  );
}

function AfcOrnament() {
  return <div className="afc-ornament"><span className="afc-ornament-g">✦</span></div>;
}

function SareesSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-sarees">
      <div className="afc-sarees-bg"/>
      <div className="afc-sarees-img">
        <AfcImg>Suggest: cinematic editorial photo — woman in deep maroon Kashmiri Sozni saree against an ornate heritage interior</AfcImg>
      </div>
      <div className="afc-sarees-pat"/>
      <div className="afc-sarees-ov"/>
      <div className="afc-sarees-cnt">
        <div ref={r} className="afc-reveal">
          <div className="afc-tag" style={{display:"inline-flex",alignItems:"center",gap:6,border:"1px solid rgba(184,151,90,0.32)",padding:"4px 12px",marginBottom:18,fontFamily:"var(--font-body)",fontSize:"8px",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(184,151,90,0.65)"}}>✦ The Afreen Edit</div>
          <span className="afc-label" style={{color:"rgba(212,175,122,0.8)"}}>Heritage Collection</span>
          <h2 className="afc-title" style={{fontSize:"clamp(42px,9vw,84px)",color:"var(--ivory)",fontStyle:"italic"}}>The Art of<br/>the Saree</h2>
        </div>
        <div ref={r} className="afc-reveal afc-d1">
          <div className="afc-tags">
            {["Sozni Work","Tilla Embroidery","Organza Silk","Banarasi Weave"].map(t=>(
              <span key={t} className="afc-tag">{t}</span>
            ))}
          </div>
        </div>
        <div ref={r} className="afc-reveal afc-d2">
          <p className="afc-desc" style={{color:"rgba(242,237,228,0.7)",fontSize:14,maxWidth:340}}>Woven with centuries of tradition, each Afreen saree is a conversation between needle and thread — a poem told in gold and silk.</p>
          <button className="afc-cta" style={{color:"rgba(212,175,122,0.85)",marginTop:24}} onClick={onClick}>Explore Sarees</button>
        </div>
      </div>
    </section>
  );
}

function SuitsSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-suits">
      <div className="afc-suits-img">
        <AfcImg>Suggest: soft-lit editorial — woman in pastel hand-embroidered Kashmiri suit in a garden setting</AfcImg>
      </div>
      <div className="afc-suits-r">
        <div>
          <div ref={r} className="afc-reveal">
            <span className="afc-label" style={{color:"var(--walnut-pale)"}}>Occasionwear</span>
            <h2 className="afc-title" style={{color:"var(--walnut)"}}>Suits for<br/>Every Ceremony</h2>
            <p className="afc-desc" style={{color:"var(--text-mid)",fontSize:13,maxWidth:260,marginTop:10}}>Soft feminine silhouettes kissed with Mughal-era detailing — in cotton, georgette and silk.</p>
            <button className="afc-cta" style={{color:"var(--maroon)",marginTop:20}} onClick={onClick}>Shop Suits</button>
          </div>
          <div ref={r} className="afc-reveal afc-d1">
            <div className="afc-suits-mini">
              <div className="afc-mini-c" onClick={onClick}><div className="afc-mini-l">Cotton</div></div>
              <div className="afc-mini-c" onClick={onClick}><div className="afc-mini-l">Georgette</div></div>
            </div>
          </div>
        </div>
        <div ref={r} className="afc-reveal afc-d2">
          <div className="afc-suits-quote">"Elegance is the only beauty that never fades — it is woven into every stitch of Kashmir."</div>
        </div>
      </div>
    </section>
  );
}

function StolesSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-stoles">
      <div className="afc-stoles-inner">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"var(--gold)"}}>Draped in Lightness</span>
          <h2 className="afc-title">Stoles &amp;<br/>Shawls</h2>
          <p className="afc-desc" style={{color:"var(--text-light)",fontSize:14,maxWidth:380,margin:"12px auto 0"}}>Like the morning mist over Dal Lake — each stole floats, wraps, and whispers of hand-loomed luxury.</p>
          <button className="afc-cta" style={{color:"var(--maroon)",justifyContent:"center",margin:"18px auto 0",display:"flex"}} onClick={onClick}>Discover Stoles</button>
        </div>
        <div ref={r} className="afc-reveal afc-d1">
          <div className="afc-stoles-strip">
            {["Pashmina Stoles","Sozni Embroidered","Printed Silk Stoles"].map(n=>(
              <div key={n} className="afc-stoles-c" onClick={onClick} style={{cursor:"pointer"}}>
                <AfcImg>{n}</AfcImg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KurtisSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-kurtis">
      <div className="afc-kurtis-hdr">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"var(--walnut-pale)"}}>Everyday Luxury</span>
          <h2 className="afc-title" style={{color:"var(--walnut)"}}>Kurtis,<br/>Reimagined</h2>
        </div>
        <div className="afc-kurtis-hdr-r" ref={r}>
          <p className="afc-desc" style={{color:"var(--text-light)",fontSize:13,maxWidth:230}}>Comfort and craft in equal measure — for mornings that deserve more.</p>
          <button className="afc-cta" style={{color:"var(--maroon)",justifyContent:"flex-end",marginTop:14,display:"flex"}} onClick={onClick}>View All Kurtis</button>
        </div>
      </div>
      <div className="afc-kgrid">
        {[
          {name:"Cotton Kurtis",craft:"Crewel Work"},
          {name:"Woolen Kurtis",craft:"Sozni Embroidery"},
          {name:"Georgette Kurtis",craft:"Tilla Work"},
        ].map(({name,craft},i)=>(
          <div key={name} ref={r} className={`afc-kcard afc-reveal afc-d${i+1}`} onClick={onClick}>
            <div className="afc-kcard-img">
              <AfcImg>{name}</AfcImg>
              <div className="afc-kbar"/>
            </div>
            <div className="afc-kname">{name}</div>
            <div className="afc-ksub">{craft}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CordSetsSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-cord">
      <div className="afc-cord-img">
        <AfcImg>Suggest: fashion editorial — woman in a matching embroidered cord set, moody dark studio backdrop</AfcImg>
      </div>
      <div className="afc-cord-txt">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"rgba(184,151,90,0.62)"}}>New Silhouettes</span>
          <h2 className="afc-title">Cord Sets for the<br/><em>Modern Kashmiri Woman</em></h2>
          <p className="afc-desc">Contemporary coordinates meeting heritage embroidery — a bridge between tradition and now.</p>
          <div className="afc-tags" style={{marginTop:18}}>
            {["Co-ord Sets","Embroidered","Indo-Western"].map(t=><span key={t} className="afc-tag">{t}</span>)}
          </div>
          <button className="afc-cta" style={{color:"rgba(212,175,122,0.82)",marginTop:24}} onClick={onClick}>Explore Cord Sets</button>
        </div>
      </div>
    </section>
  );
}

function KaftansSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-kaftans">
      <div className="afc-kaftans-bg">
        <AfcImg>Suggest: full-width resort-luxury photo — woman in a flowing hand-embroidered Kashmiri kaftan by a serene lake</AfcImg>
      </div>
      <div className="afc-kaftans-ov"/>
      <div className="afc-kaftans-cnt">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"rgba(212,175,122,0.72)"}}>Resort Luxury</span>
          <h2 className="afc-title">Kaftans</h2>
          <p className="afc-desc" style={{color:"rgba(242,237,228,0.65)",fontSize:14}}>Flowing, unhurried, impossibly beautiful — Afreen Kaftans are crafted for souls who carry the valley with them.</p>
          <button className="afc-cta" style={{color:"rgba(212,175,122,0.8)",justifyContent:"center",margin:"24px auto 0",display:"flex"}} onClick={onClick}>Shop Kaftans</button>
        </div>
      </div>
      <div className="afc-kaftans-line"/>
    </section>
  );
}

function BagsSection({ onClick }) {
  const r = useReveal();
  return (
    <section className="afc-bags">
      <div className="afc-bags-txt">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"rgba(184,151,90,0.62)"}}>Handcrafted Accessories</span>
          <h2 className="afc-title">Bags &amp;<br/>Clutches</h2>
          <p className="afc-desc">Leather and embroidery in conversation — each bag is a wearable artefact of Kashmiri craftsmanship.</p>
          <button className="afc-cta" style={{color:"rgba(212,175,122,0.76)",marginTop:22}} onClick={onClick}>View Bags</button>
          <div className="afc-bags-note">"Every stitch is a memory,<br/>every bag a heirloom in the making."</div>
        </div>
      </div>
      <div className="afc-bags-imgs">
        {["Embroidered Tote","Clutch Bags","Mini Bags"].map(n=>(
          <div key={n} className="afc-img" onClick={onClick} style={{cursor:"pointer"}}>
            <span className="afc-img-hint">{n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeDecorSection({ onClick }) {
  const r = useReveal();
  const items = ["Kashmiri Lamps","Hand-painted Trays","Woven Linens","Carved Walnut","Papier-mâché"];
  return (
    <section className="afc-decor">
      <div className="afc-decor-hdr">
        <div ref={r} className="afc-reveal">
          <span className="afc-label" style={{color:"var(--walnut-pale)"}}>Kashmir at Home</span>
          <h2 className="afc-title">Home Decor</h2>
          <p className="afc-desc">Warm walnut, hand-knotted rugs, papier-mâché and carved wood — bring the spirit of Kashmir's interiors into your living space.</p>
        </div>
      </div>
      <div className="afc-dgrid">
        {items.map((lbl,i)=>(
          <div key={lbl} ref={r} className={`afc-dc afc-reveal afc-d${Math.min(i+1,3)}`} onClick={onClick}>
            <div className="afc-img" style={{height:"100%"}}><span className="afc-img-hint">{lbl}</span></div>
            <div className="afc-dc-lbl">{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:36}}>
        <button className="afc-cta" style={{color:"var(--walnut)",justifyContent:"center",display:"inline-flex"}} onClick={onClick}>Explore Home Decor</button>
      </div>
    </section>
  );
}

function CondimentsSection({ onClick }) {
  const r = useReveal();
  return (
    <section>
      <div className="afc-conds-cin">
        <div className="afc-img" style={{position:"absolute",inset:0,height:"100%"}}>
          <span className="afc-img-hint">Suggest: warm cinematic food editorial — Kashmiri saffron strands, walnut bowls, kahwa tea in golden light</span>
        </div>
        <div className="afc-conds-ov"/>
        <div className="afc-conds-cnt">
          <div ref={r} className="afc-reveal">
            <span className="afc-label" style={{color:"rgba(212,175,122,0.72)"}}>From Valley to Table</span>
            <h2 className="afc-title">Taste of<br/>Kashmir</h2>
            <p className="afc-desc">Sun-kissed saffron from Pampore, aged honey from mountain hives, and dry fruits handpicked from orchard to doorstep.</p>
            <div className="afc-pills">
              {["Kashmiri Saffron","Kahwa Tea","Wild Honey","Dry Fruits","Spice Mixes","Shilajit Resin"].map(s=>(
                <span key={s} className="afc-pill">{s}</span>
              ))}
            </div>
            <button className="afc-cta" style={{color:"rgba(212,175,122,0.8)",marginTop:20}} onClick={onClick}>Shop Condiments</button>
          </div>
        </div>
      </div>
      <div className="afc-conds-stats">
        {[{num:"800+",lbl:"Meters Altitude"},{num:"100%",lbl:"Pure & Natural"},{num:"∞",lbl:"Generations of Craft"}].map(({num,lbl})=>(
          <div key={lbl} className="afc-cstat">
            <span className="afc-cstat-num">{num}</span>
            <span className="afc-cstat-lbl">{lbl}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- HOME PAGE ----
function HomePage({ setPage, setSelectedProduct, goToCollection, currency = "INR" }) {
  const go = (cat) => goToCollection(cat || "all");

  return (
    <div className="page">

      {/* HERO */}
      <div className="hero">
        <div className="hero-bg"/>
        <div className="hero-pattern"/>
        <div className="hero-embroidery"/>
        {/* Decorative chinar leaf motif */}
        <svg className="hero-chinar" viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M90 10 L62 70 L10 55 L48 100 L28 160 L90 120 L152 160 L132 100 L170 55 L118 70Z"
            fill="rgba(184,151,90,0.9)" stroke="rgba(184,151,90,0.5)" strokeWidth="1"/>
          <circle cx="90" cy="95" r="22" fill="none" stroke="rgba(184,151,90,0.8)" strokeWidth="2"/>
          <circle cx="90" cy="95" r="8" fill="rgba(184,151,90,0.6)"/>
          <line x1="90" y1="120" x2="90" y2="210" stroke="rgba(184,151,90,0.7)" strokeWidth="2"/>
          <line x1="90" y1="160" x2="68" y2="190" stroke="rgba(184,151,90,0.5)" strokeWidth="1.2"/>
          <line x1="90" y1="160" x2="112" y2="190" stroke="rgba(184,151,90,0.5)" strokeWidth="1.2"/>
          <line x1="90" y1="140" x2="72" y2="158" stroke="rgba(184,151,90,0.4)" strokeWidth="0.8"/>
          <line x1="90" y1="140" x2="108" y2="158" stroke="rgba(184,151,90,0.4)" strokeWidth="0.8"/>
        </svg>
        <div className="hero-content">
          <div className="hero-label">New Collection 2025</div>
          <h1 className="hero-title">Where Kashmir<br/>Meets <em>Elegance</em></h1>
          <p className="hero-sub">Handcrafted sarees, dresses &amp; accessories<br/>woven with the soul of the valley.</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => goToCollection()}>Explore Collections</button>
            <button className="btn-outline" onClick={() => window.open(waUrl(), "_blank")}>Custom Order via WhatsApp</button>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-line"/>
          Scroll
        </div>
      </div>

      <Marquee/>

      {/* ── PREMIUM CATEGORY SECTIONS ── */}
      <AfcStrip/>

      <SareesSection onClick={() => go("saree")}/>

      <AfcOrnament/>

      <SuitsSection onClick={() => go("dress")}/>

      <div className="afc-quote">
        <span className="afc-qmark">"</span>
        <p className="afc-qtext">Every thread carries a story woven by hands that have known the valley for a thousand years.</p>
        <cite className="afc-qcite">— The Afreen Atelier, Srinagar</cite>
      </div>

      <StolesSection onClick={() => go("accessories")}/>

      <AfcOrnament/>

      <KurtisSection onClick={() => go("dress")}/>

      <CordSetsSection onClick={() => go("coords")}/>

      <KaftansSection onClick={() => go("dress")}/>

      <AfcOrnament/>

      <BagsSection onClick={() => go("accessories")}/>

      <HomeDecorSection onClick={() => go("all")}/>

      <CondimentsSection onClick={() => go("all")}/>

      <AfcStrip/>

      {/* FEATURED PRODUCTS */}
      <div style={{paddingBottom:40}}>
        <div style={{padding:"0 20px 20px"}}>
          <div className="section-label">Hand-Picked</div>
          <h2 className="section-title">Featured <em>Pieces</em></h2>
        </div>
        <div className="product-grid">
          {PRODUCTS.slice(0,4).map(p=>(
            <ProductCard key={p.id} product={p} currency={currency} onClick={()=>{setSelectedProduct(p);setPage("product");}}/>
          ))}
        </div>
        <div style={{padding:"24px 20px 0"}}>
          <button className="btn-outline-maroon" style={{width:"100%"}} onClick={() => goToCollection()}>View All Collections</button>
        </div>
      </div>

      {/* BRAND STORY */}
      <div className="brand-story">
        <div className="section-label">Our Heritage</div>
        <h2 className="section-title">Rooted in<br/><em>Kashmir</em></h2>
        <div className="section-divider" style={{background:"linear-gradient(to right, var(--gold-light), rgba(184,151,90,0.3))"}}/>
        <p>Afreen exists because Kashmir's textile traditions deserve a better audience. Each craft — sozni, kani, tilla, crewel — is the result of years of mastery passed quietly between generations. We are here to connect that mastery to the people who will truly value it.</p>
        <p>We work closely with artisan families in the Kashmir Valley, sourcing directly and dealing honestly — because the work speaks for itself, and the people behind it deserve to be treated with dignity.</p>
      </div>

      {/* CUSTOM ORDER */}
      <div className="custom-highlight">
        <div className="section-label" style={{color:"rgba(74,16,25,0.6)"}}>For the Discerning</div>
        <h3>Custom Tailoring<br/>Available</h3>
        <p>Share your vision. Our master tailors<br/>bring it to life — your measurements, your fabric,<br/>your story, stitched to perfection.</p>
        <button className="btn-maroon" style={{width:"100%",maxWidth:320,margin:"0 auto"}} onClick={() => window.open(waUrl("Hi Afreen, I am interested in a custom order."), "_blank")}>
          🪡 &nbsp; Start Custom Order
        </button>
      </div>

      {/* TESTIMONIALS */}
      <div className="testimonials">
        <div className="section-head">
          <div className="section-label">What They Say</div>
          <h2 className="section-title">Loved <em>Globally</em></h2>
        </div>
        <div className="testimonials-scroll">
          {TESTIMONIALS.map(t=>{
            const initials = t.author.split(",")[0].trim().split(" ").map(w=>w[0]).slice(0,2).join("");
            return (
              <div key={t.id} className="testimonial-card">
                <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"var(--maroon)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-head)",fontSize:13,fontStyle:"italic",color:"var(--gold-light)",flexShrink:0,letterSpacing:"0.03em"}}>
                    {initials}
                  </div>
                  <p className="testimonial-author" style={{margin:0}}>{t.author}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOG PREVIEW */}
      <div style={{paddingBottom:100}}>
        <div style={{padding:"0 20px 20px"}}>
          <div className="section-label">Stories from the Valley</div>
          <h2 className="section-title">Editorial <em>&amp; Culture</em></h2>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.slice(0,2).map(b=>(
            <BlogCard key={b.id} post={b} onNavigate={() => setPage("blog")}/>
          ))}
        </div>
        <div style={{padding:"20px 20px 0"}}>
          <button className="btn-outline-maroon" style={{width:"100%"}} onClick={() => setPage("blog")}>Read All Stories</button>
        </div>
      </div>

      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

// ---- OTHER PAGES (unchanged) ----

function CollectionsPage({ setPage, goBack, setSelectedProduct, initialFilter = "all", goToCollection, currency = "INR", setCurrency }) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState("default");
  const filters = ["all","saree","dress","coords","menswear","accessories"];
  useEffect(() => { setActiveFilter(initialFilter); }, [initialFilter]);
  const filtered = useMemo(() => {
    let list = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);
    if (sortBy === "asc") return [...list].sort((a,b) => a.priceVal - b.priceVal);
    if (sortBy === "desc") return [...list].sort((a,b) => b.priceVal - a.priceVal);
    return list;
  }, [activeFilter, sortBy]);
  const nextSort = sortBy === "default" ? "asc" : sortBy === "asc" ? "desc" : "default";
  const sortLabel = sortBy === "asc" ? "Price ↑" : sortBy === "desc" ? "Price ↓" : "Sort";
  return (
    <div className="page" style={{paddingBottom:80}}>
      <div className="collections-header">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
          <div>
            <div className="section-label">Afreen Collections</div>
            <h1 className="section-title">Shop the <em>Valley</em></h1>
          </div>
          {setCurrency && <div style={{paddingTop:4}}><CurrencySelector currency={currency} setCurrency={setCurrency}/></div>}
        </div>
        <p style={{fontSize:12,color:"var(--text-light)",lineHeight:1.7,marginTop:8}}>All pieces are inquiry-based. Contact us on WhatsApp to place your order.</p>
        <button
          onClick={goBack}
          style={{marginTop:12,background:"none",border:"1px solid var(--border)",borderRadius:2,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,color:"var(--text-mid)",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",padding:"7px 14px",transition:"var(--transition)",fontFamily:"var(--font-body)"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--maroon)";e.currentTarget.style.color="var(--maroon)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-mid)";}}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M5 1L1 5M1 5L5 9M1 5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
      </div>
      <div className="filter-sort-bar">
        <span className="count-label">{filtered.length} pieces</span>
        <button className={`sort-btn ${sortBy!=="default"?"active":""}`} onClick={() => setSortBy(nextSort)}>{sortLabel}</button>
      </div>
      <div className="filters-bar">
        {filters.map(f=>(
          <button key={f} className={`filter-chip ${activeFilter===f?"active":""}`} onClick={() => setActiveFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {filtered.map(p=>(
          <ProductCard key={p.id} product={p} currency={currency} onClick={() => {setSelectedProduct(p);setPage("product");}}/>
        ))}
      </div>
      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

function ProductPage({ product, setPage, goBack, goToCollection, currency = "INR", setCurrency }) {
  const [size, setSize] = useState("M");
  const [form, setForm] = useState({name:"",phone:"",requirement:""});
  const sizes = ["XS","S","M","L","XL","Custom"];
  const handleInquiry = () => {
    const msg = `Hi Afreen, I'm interested in *${product.name}*.\n\nName: ${form.name}\nPhone: ${form.phone}\nSize: ${size}\nRequirement: ${form.requirement||"Standard"}`;
    window.open(waUrl(msg), "_blank");
  };
  const craftTerm = product.fabric.split("·")[1]?.trim() || "Handcrafted";
  return (
    <div className="page" style={{paddingBottom:80}}>
      {/* Back button + breadcrumb */}
      <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <button
          onClick={goBack}
          style={{
            background:"none",
            border:"1px solid var(--border)",
            borderRadius:2,
            cursor:"pointer",
            display:"inline-flex",
            alignItems:"center",
            gap:6,
            color:"var(--text-mid)",
            fontSize:11,
            letterSpacing:"0.12em",
            textTransform:"uppercase",
            padding:"7px 14px",
            transition:"var(--transition)",
            fontFamily:"var(--font-body)",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--maroon)";e.currentTarget.style.color="var(--maroon)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-mid)";}}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M5 1L1 5M1 5L5 9M1 5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <nav style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-light)",letterSpacing:"0.05em"}}>
          <span style={{cursor:"pointer",color:"var(--text-light)"}} onClick={()=>setPage("home")}>Home</span>
          <span style={{color:"var(--border)"}}>›</span>
          <span style={{cursor:"pointer",color:"var(--text-light)"}} onClick={()=>goToCollection()}>Collections</span>
          <span style={{color:"var(--border)"}}>›</span>
          <span style={{color:"var(--maroon)",fontWeight:500}}>{product.name}</span>
        </nav>
      </div>
      <div className="product-gallery" style={{marginTop:12}}>
        <div style={{width:"100%",aspectRatio:"3/4",background:GRADIENTS[product.colorHex]||"#ccc",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,position:"relative",overflow:"hidden"}}>
          <svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pdp-motif" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M32 6 Q44 13 41 27 Q38 37 29 37 Q17 35 19 23 Q22 11 32 6Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9"/>
                <ellipse cx="32" cy="25" rx="10" ry="17" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7"/>
                <circle cx="32" cy="25" r="4" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.7"/>
                <path d="M32 37 Q38 44 35 51 Q32 56 29 51 Q26 44 32 37Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pdp-motif)"/>
          </svg>
          <svg viewBox="0 0 60 75" xmlns="http://www.w3.org/2000/svg" style={{width:60,height:75,opacity:0.22}}>
            <path d="M30 4 L20 24 L4 19 L17 34 L9 52 L30 41 L51 52 L43 34 L56 19 L40 24Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
            <circle cx="30" cy="30" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
            <line x1="30" y1="41" x2="30" y2="70" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <line x1="30" y1="56" x2="22" y2="66" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7"/>
            <line x1="30" y1="56" x2="38" y2="66" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7"/>
          </svg>
          <div style={{fontFamily:"var(--font-head)",fontSize:18,color:"rgba(255,255,255,0.4)",textAlign:"center",padding:"0 32px",letterSpacing:"0.02em"}}>{product.name}</div>
        </div>
        <div className="product-gallery-nav">
          {[1,2,3,4].map(i=>(
            <div key={i} className={`product-thumb ${i===1?"active":""}`} style={{background:GRADIENTS[product.colorHex],display:"flex",alignItems:"center",justifyContent:"center",opacity:i===1?1:0.45,position:"relative",overflow:"hidden"}}>
              <svg viewBox="0 0 30 40" style={{width:18,height:24,opacity:0.35}} xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3 L10 13 L2 10 L8 18 L5 28 L15 22 L25 28 L22 18 L28 10 L20 13Z" fill="rgba(255,255,255,0.9)"/>
                <line x1="15" y1="22" x2="15" y2="37" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
      <div className="product-detail">
        <div className="product-detail-header">
          <div className="category">{product.category.toUpperCase()} · AFREEN</div>
          <h1>{product.name}</h1>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8,flexWrap:"wrap"}}>
            <span className="price" style={{fontSize:20,color:"var(--maroon)",fontWeight:500}}>{formatPrice(product.priceVal, currency)}</span>
            {currency !== "INR" && (
              <span style={{fontSize:11,color:"var(--text-light)"}}>≈ {formatPrice(product.priceVal, "INR")} INR</span>
            )}
            <span style={{fontSize:11,color:"var(--text-light)"}}>+ shipping</span>
            {setCurrency && <CurrencySelector currency={currency} setCurrency={setCurrency}/>}
          </div>
          <div style={{marginTop:10}}>
            <AvailBadge status={product.availability}/>
            {product.availability === "Made to Order" && (
              <p style={{fontSize:11,color:"var(--text-light)",marginTop:5,lineHeight:1.6}}>This piece is made to order. Lead time is approximately 2–4 weeks after confirmation.</p>
            )}
          </div>
        </div>
        <div className="craft-badge">✦ &nbsp; Custom Tailoring Available for this Piece</div>
        <div className="product-divider"/>
        <div className="size-selector">
          <label>Select Size</label>
          <div className="size-options">
            {sizes.map(s=>(
              <button key={s} className={`size-btn ${size===s?"active":""}`} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="product-divider"/>
        <p className="product-desc">The {product.name} is a masterpiece of Kashmiri craftsmanship — <FabricDesc text={product.fabric}/>. Each piece takes our artisans weeks to complete, a labour of love that becomes a treasured heirloom.</p>
        <ul className="product-details-list">
          <li><span>Fabric</span><span>{product.fabric.split("·")[0].trim()}</span></li>
          <li><span>Craft</span><span><GlossaryTerm term={craftTerm}/></span></li>
          <li><span>Origin</span><span>Kashmir, India</span></li>
          <li><span>Availability</span><span><AvailBadge status={product.availability}/></span></li>
          <li><span>Care</span><span>Dry clean only</span></li>
          <li><span>Shipping</span><span>India + International</span></li>
          <li><span>Returns</span><span>No returns policy</span></li>
        </ul>
        <div className="product-ctas">
          <button className="btn-wa" onClick={() => window.open(waUrl("Hi Afreen, I am interested in "+product.name),"_blank")}>
            <WAIcon size={20}/> Inquire on WhatsApp
          </button>
          <button className="btn-outline-maroon" onClick={() => document.getElementById("inquiry-form")?.scrollIntoView({behavior:"smooth"})}>Send Custom Inquiry</button>
        </div>
      </div>
      <div className="inquiry-form-section" id="inquiry-form">
        <h3>Custom Order Inquiry</h3>
        <p>Share your measurements and customisation needs. We'll get back to you within 24 hours.</p>
        <div className="form-group">
          <label>Your Name</label>
          <input className="form-control" placeholder="Full name" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/>
        </div>
        <div className="form-group">
          <label>Phone / WhatsApp</label>
          <input className="form-control" placeholder="+91 or international" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/>
        </div>
        <div className="form-group">
          <label>Your Requirement</label>
          <textarea className="form-control" placeholder="Describe your customisation, fabric preference, occasion, measurements..." value={form.requirement} onChange={e => setForm({...form,requirement:e.target.value})}/>
        </div>
        <button className="btn-wa" style={{width:"100%"}} onClick={handleInquiry}>
          <WAIcon size={18}/> Submit via WhatsApp
        </button>
      </div>
      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

function AboutPage({ setPage, goToCollection }) {
  return (
    <div className="page" style={{paddingBottom:80}}>
      <div className="about-hero">
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg, #3D1015 0%, #6B1F2A 60%, #B8975A 100%)",opacity:0.95}}/>
        <div className="about-hero-content">
          <p style={{color:"var(--gold-light)",fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:12}}>Our Story</p>
          <h1>Taste of Kashmir<br/>in Every<br/>Bite &amp; Stitch</h1>
          <p>Since 2018 · Srinagar, Kashmir</p>
        </div>
      </div>
      <div className="about-block">
        <h2>The Valley That Made Us</h2>
        <p>Afreen was built on a simple conviction: Kashmir's craft traditions are among the finest in the world, and they deserve to reach people who genuinely appreciate them. We started small, worked closely with artisan families, and let the work speak for itself.</p>
        <p style={{marginTop:12}}>We source directly, price honestly, and refuse to compromise on authenticity. Every piece you receive has been made by hand, with care, in the Kashmir Valley.</p>
      </div>
      <div className="about-block">
        <h2>Our Philosophy</h2>
        <p>We believe fashion should slow down. A Dilruba saree takes six weeks to embroider. A Chinar phiran takes a craftsman three months to complete. When you wear Afreen, you wear time, skill, and story — not fast fashion.</p>
        <p style={{marginTop:12}}>Every piece is inquiry-based and made with intention. We do not mass-produce. We do not compromise.</p>
      </div>
      <div className="craft-grid">
        {[
          {id:1,icon:"🧵",title:"Sozni Work",desc:"Fine needle embroidery done on silk and organza. A single shawl can take 6 months."},
          {id:2,icon:"🪡",title:"Kani Weave",desc:"Woven on wooden sticks. Every colour change is a handmade decision."},
          {id:3,icon:"✨",title:"Tilla Work",desc:"Gold and silver thread embroidery, a royal art from the Mughal era."},
          {id:4,icon:"🌿",title:"Crewel",desc:"Wool-on-cotton embroidery depicting Kashmir's chinars and flowers."},
        ].map(c=>(
          <div key={c.id} className="craft-item">
            <div className="craft-icon">{c.icon}</div>
            <h4>{c.title}</h4>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="custom-highlight">
        <h3>Every Piece,<br/>Custom Made</h3>
        <p>We offer custom tailoring for all our collections. Your measurements, your vision.</p>
        <button className="btn-maroon" style={{width:"100%",maxWidth:320,margin:"0 auto"}} onClick={() => window.open(waUrl(),"_blank")}>Start Your Custom Order</button>
      </div>
      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

function BlogPage({ setPage, goToCollection }) {
  return (
    <div className="page" style={{paddingBottom:80}}>
      <div style={{padding:"40px 20px 20px",borderBottom:"1px solid var(--border)"}}>
        <div className="section-label">Stories &amp; Culture</div>
        <h1 className="section-title">Editorial <em>Journal</em></h1>
        <p style={{fontSize:12,color:"var(--text-light)",lineHeight:1.7,marginTop:8}}>Dispatches from the valley — craft stories, style guides, and cultural essays.</p>
      </div>
      <div className="blog-grid" style={{paddingBottom:20}}>
        {BLOG_POSTS.map(b=><BlogCard key={b.id} post={b} onNavigate={() => window.scrollTo(0,0)}/>)}
        <div className="blog-card" style={{opacity:0.4}}>
          <div className="blog-img" style={{background:"var(--ivory-dark)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🌸</div>
          <div className="blog-info"><div className="tag">Coming Soon</div><h4>The Wazwan Table: Food as Identity</h4><p>How Kashmir's feast tradition informs our design philosophy…</p><div className="date">May 2025</div></div>
        </div>
      </div>
      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

function PoliciesPage({ setPage, goToCollection }) {
  return (
    <div className="page" style={{paddingBottom:80}}>
      <div style={{padding:"40px 20px 20px",borderBottom:"1px solid var(--border)"}}>
        <div className="section-label">Transparency</div>
        <h1 className="section-title">Our <em>Policies</em></h1>
      </div>
      <div className="policy-block">
        <h2>Shipping Policy</h2>
        <p>Afreen ships across India and internationally. All orders are shipped within 7–14 business days of order confirmation, as each piece is either handcrafted to order or carefully packaged from limited inventory.</p>
        <ul style={{marginTop:12}}>
          <li>India: 3–5 business days via insured courier</li>
          <li>International: 10–21 business days via registered post / courier</li>
          <li>All parcels are tracked and insured</li>
          <li>Customs duties for international orders are the buyer's responsibility</li>
        </ul>
      </div>
      <div className="policy-block">
        <h2>Returns &amp; Exchanges</h2>
        <div className="policy-notice">
          <p><strong>No Returns Policy.</strong> All Afreen pieces are made-to-order or part of a very limited handcrafted inventory. We do not accept returns or exchanges.</p>
        </div>
        <p>We encourage you to reach out on WhatsApp before placing an order. Our team is happy to share detailed fabric swatches, measurements, and additional photographs to help you make the right choice with confidence.</p>
        <p style={{marginTop:12}}>In the rare event of a defective or incorrect item, please contact us within 48 hours of delivery with photographs. We will assess and respond within 2 business days.</p>
      </div>
      <div className="policy-block">
        <h2>Custom Orders</h2>
        <p>Custom tailoring requests require a 50% advance payment at the time of order confirmation. The remaining amount is due before dispatch. Custom orders have a lead time of 3–8 weeks depending on the complexity of the work.</p>
        <p style={{marginTop:12}}>Custom orders are non-cancellable once work has commenced.</p>
      </div>
      <div className="policy-block">
        <h2>Privacy</h2>
        <p>Your personal information is never shared with third parties. We use your contact details solely to process your order and stay in touch about your inquiry. Conversations on WhatsApp remain private and confidential.</p>
      </div>
      <Footer setPage={setPage} goToCollection={goToCollection}/>
    </div>
  );
}

function Footer({ setPage, goToCollection }) {
  return (
    <footer className="footer">
      <div className="footer-logo">Afreen</div>
      <div className="footer-tagline">Taste of Kashmir in Every Bite &amp; Stitch</div>
      <div className="footer-grid">
        <div className="footer-col">
          <h5>Shop</h5>
          <a onClick={() => goToCollection()}>All Collections</a>
          <a onClick={() => goToCollection("saree")}>Sarees</a>
          <a onClick={() => goToCollection("dress")}>Dresses</a>
          <a onClick={() => goToCollection("menswear")}>Menswear</a>
          <a onClick={() => goToCollection("accessories")}>Accessories</a>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <a onClick={() => setPage("about")}>About Afreen</a>
          <a onClick={() => setPage("blog")}>Editorial</a>
          <a onClick={() => setPage("policies")}>Policies</a>
          <p>📍 Srinagar, Kashmir</p>
        </div>
        <div className="footer-col">
          <h5>Contact</h5>
          <a onClick={() => window.open(waUrl(),"_blank")}>WhatsApp</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="mailto:hello@afreen.in">Email Us</a>
        </div>
        <div className="footer-col">
          <h5>Crafts</h5>
          <p>Sozni Work</p>
          <p>Kani Weave</p>
          <p>Tilla Work</p>
          <p>Crewel Embroidery</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Afreen · All rights reserved · Made with love in Kashmir</div>
    </footer>
  );
}

// ---- APP ----
export default function AfreenApp() {
  const [page, setPage] = useState("home");
  const [pageHistory, setPageHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [scrolled, setScrolled] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [currency, setCurrency] = useState("INR");

  // Navigate with history tracking
  const navigate = (newPage) => {
    setPageHistory(h => [...h, page]);
    setPage(newPage);
  };

  // Go back to the previous page (fallback: home)
  const goBack = () => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      setPageHistory(h => h.slice(0, -1));
      setPage(prev);
    } else {
      setPage("home");
    }
  };

  const goToCollection = (filter = "all") => { setCollectionFilter(filter); navigate("collections"); };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { window.scrollTo(0,0); }, [page]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = e => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const navItems = [
    { id:"home", label:"Home", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
    { id:"collections", label:"Shop", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { id:"about", label:"About", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { id:"blog", label:"Stories", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
  ];

  const pageProps = { setPage: navigate, goBack, goToCollection, currency, setCurrency };

  return (
    <>
      <style>{STYLE}</style>

      <nav className={`nav ${scrolled?"scrolled":""}`}>
        <button className="nav-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          <span/><span/><span/>
        </button>
        <div className="nav-logo" onClick={() => navigate("home")}>Afreen<span>.</span></div>
        <div className="nav-actions">
          <button className="nav-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className="nav-icon" onClick={() => window.open(waUrl(),"_blank")} aria-label="WhatsApp">
            <WAIcon size={18}/>
          </button>
        </div>
      </nav>

      <div className={`drawer-overlay ${drawerOpen?"open":""}`} onClick={() => setDrawerOpen(false)}/>
      <div className={`drawer ${drawerOpen?"open":""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="drawer-header">
          <span className="drawer-logo">Afreen.</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className="drawer-nav">
          {[["home","Home"],["collections","Collections"],["about","About Us"],["blog","Editorial"],["policies","Policies"]].map(([id,label])=>(
            <button key={id} onClick={() => { navigate(id); setDrawerOpen(false); }}>{label}</button>
          ))}
        </nav>
        <div className="drawer-footer">
          <p>Follow Us</p>
          <div className="drawer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📸</a>
            <a href={waUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
          </div>
          <p style={{marginTop:16,fontSize:11,color:"var(--gold)"}}>Taste of Kashmir in Every Bite &amp; Stitch</p>
        </div>
      </div>

      {page==="home" && <HomePage {...pageProps} setSelectedProduct={setSelectedProduct}/>}
      {page==="collections" && <CollectionsPage {...pageProps} setSelectedProduct={setSelectedProduct} initialFilter={collectionFilter}/>}
      {page==="product" && <ProductPage {...pageProps} product={selectedProduct}/>}
      {page==="about" && <AboutPage {...pageProps}/>}
      {page==="blog" && <BlogPage {...pageProps}/>}
      {page==="policies" && <PoliciesPage {...pageProps}/>}

      <WhatsAppFloat/>

      <nav className="bottom-nav">
        {navItems.map(item=>(
          <button key={item.id} className={`bottom-nav-item ${page===item.id?"active":""}`} onClick={() => navigate(item.id)}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}