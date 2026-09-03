# SRYVERSE Project Documentation

## 📋 Project Overview

**SRYVERSE** is a sophisticated AI-powered SaaS platform that transforms complex business operations into intelligent, scalable systems. It focuses on **operational intelligence** through the lens of systems engineering + artificial intelligence.

- **Language**: Turkish/English (bilingual UI)
- **Tech Stack**: React 18.2 + Three.js + GSAP + Lenis (smooth scrolling)
- **Build**: Vite (Fast modern bundler)
- **Deployed Products**:
  - **SkillMatch AI** - Recruitment intelligence platform
  - **EstateMatch AI** - Real estate portfolio & customer matching
  - **Metraj AI** - AI quantity surveying (private beta)

---

## 🎨 Design System & Themes

### Color Palette (CSS Variables in `index.css`)

**Primary Green Theme** (Operational Intelligence):
```css
--primary: #0B3D2E          /* Forest green - main brand color */
--dark: #062B20             /* Darker green for hover/active states */
--accent: #1D6B52           /* Emerald accent - highlights & CTAs */
--soft: #EAF6F0             /* Sage light - section backgrounds */
```

**Neutrals**:
```css
--bg: #FFFFFF               /* Main background */
--text: #0B3D2E             /* Primary text */
--muted: #2E4C42            /* Secondary text */
--light: #5F857A            /* Tertiary text */
```

**Surfaces & Effects**:
```css
--glass: rgba(255,255,255,0.72)        /* Glassmorphism background */
--glow: rgba(11,61,46,0.12)            /* Subtle glow overlay */
--border: rgba(11,61,46,0.13)          /* Border color */
```

### Typography

- **Serif** (`--font-serif`): Cormorant Garamond - Headlines, elegant titles
- **Sans** (`--font-sans`): Inter - Body text, UI elements
- **Mono** (`--font-mono`): DM Mono - Terminal, code, technical labels

### Design Tokens in `App.css`

Key utility classes:
- `.glass` - Glassmorphism container with blur + border
- `.wrap` - Max-width container (1280px), centered, padded
- `.elabel` - Section labels (uppercase, mono, accent color)
- Animations: `cardFloat`, `scan`, `sweep`, `ringPulse`, `borderFlow`

---

## 🏗️ Architecture & Component Structure

### Main App Flow (`App.jsx`)

**Page States** (History API routing in `useRoute.js`):
1. `page === 'home'` → `src/home/Home.jsx` — one continuous scroll narrative (see below)
2. `page === 'vision'` → Vision & Mission page (dark theme, particle `Background`)
3. `page === 'skillmatch'` → SkillMatch product page (lazy-loaded, three.js)
4. `page === 'estatematch'` → EstateMatch product page (lazy-loaded, `src/estate/*`)
5. `page === 'estatematchFeatures'` → EstateMatch features page (lazy-loaded)

**Header**: fixed; light on the homepage except over the single dark philosophy scene (`hdr--dark`). Nav: Ürünler · Yaklaşım · Vizyon · İletişim + one CTA ("Demo planlayın").
**Footer**: brand lockup, product/company/contact links, socials.

### Homepage (`src/home/`) — a story-driven business site

Sections, in order (ids used by nav/footer links):
`#baslangic` hero (real product fragments in depth) → `#ne-yapiyoruz` what we do (term → outcome rail) → `#urunler` products intro → `#estatematch` real workflow with real screenshots (sticky, ~230svh) → `#skillmatch` workflow with UI fragments recreated from the product's modules (sticky, mirrored) → `#next` unnamed "next system" teaser → `#yaklasim` custom systems (three connected areas) → `#donusum` before → SRYVERSE → after diagram → `#sorunlar` business-problem entry points → `#sektor` "your industry" CTA → `#felsefe` the single dark philosophy moment (~200svh) → `#methodology` how we work (5-step method inside "Kur") → `#contact` form.

- Palette = repo tokens (`App.css`): warm off-white `#FAF9F6` base, sage `--soft #EAF6F0` bands, `--primary/--accent` greens, dark green text. One dark scene only (`--ink`). EstateMatch scene subtly adopts its canvas/forest; SkillMatch uses the sage band.
- Serif (Cormorant) only for hero H1, product idea lines, big statements; Inter for business/product/UI copy.
- Scroll-driven scenes read a single 0..1 progress from `src/estate/scroll.js` (`useTrack`, `useReveal`, `useActiveSection`, `useStack`). On ≤767px or `prefers-reduced-motion` every scrubbed scene renders stacked.
- Real screens live in `public/screens/*.webp`; `Crop` in `bits.jsx` shows a region of a real screenshot at a fixed frame ratio. SkillMatch has no screenshots in the repo, so its frames are HTML fragments.
- The contact form is honest: without `VITE_DEMO_ENDPOINT` it does not fake a submission; it offers the same content via WhatsApp.
- The V1 dark editorial direction is kept as git tag `homepage-v1-experiment` (not approved).

### Core Components

- **Background.jsx** — animated 2D particle canvas, now used only by the Vision page.
- **SiteAssistant.jsx** — floating keyword-matched assistant (no external AI), shares `siteKnowledge.js`.
- **SkillMatchPage.jsx / SkillMatch3D.jsx** — SkillMatch product page with three.js hero.
- **EstateMatchPage.jsx + `src/estate/*`** — EstateMatch story page; its visual DNA (warm canvas, hairlines, relationship lines) is the parent of the homepage system.

## 🎬 Animations & Effects

### Custom Hooks (App.jsx)

**`useReveal(threshold)`**:
- Intersection Observer-based reveal animation
- Returns `[ref, isVisible]`
- Triggers fade-up + opacity on scroll into view
- Used for: all sections, hero, form

**`useTilt(strength)`**:
- Mouse-based 3D perspective tilt
- Calculates angle based on cursor position
- Returns ref + mouse event handlers
- Applied to: product cards

### Global Animations

| Animation | Duration | Purpose |
|-----------|----------|---------|
| `scan` | 4.5s | Grid scan effect on Intel Flow |
| `ringPulse` | 2.2s | Active step ring expansion |
| `sweep` | 5.5s | Light sweep across product cards |
| `cardFloat` | 7s | Card shadow pulse (floating effect) |
| `borderFlow` | 4s | Gradient animation on future/beta cards |
| `scrollDrop` | 2.2s | Scroll hint line animation |
| `blink` | 2.5s | Indicator dot pulse |
| `redPulse` | 1.2s | Live data red dot pulse |
| `cur` | 1s | Terminal cursor blink |

---

## 🌐 Responsive Design

### Breakpoints
- Uses `clamp()` for fluid typography
- Grid layout: `grid-template-columns: repeat(3, 1fr)` for products
- Burger menu appears on smaller screens

### CSS Classes
- `.wrap` - Main content container (max 1280px)
- `.glass` - Consistent glassmorphism styling
- Media queries for header collapse, menu toggle

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.150.0",           // 3D graphics
    "gsap": "^3.12.2",             // Animation library
    "lenis": "^1.1.5"              // Smooth scroll
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### Key External Resources
- **Fonts**: Cormorant Garamond, Inter, DM Mono (assume Google Fonts imported in HTML)
- **Images**: `/sryverse-badge.png`, `/sryverse-badge-white.png`

---

## 🔧 Development Workflow

### Scripts

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Configuration
- **Vite Config**: Minimal, uses React plugin only
- **Vite Entry**: `src/main.jsx` → imports `App.jsx`
- **CSS**: Global `index.css` (tokens) + `App.css` (components)

---

## 🎯 Coding Conventions

### Structure
- **Functional Components**: All components use React hooks
- **State Management**: Local `useState`, no Redux/Zustand
- **Animations**: GSAP + CSS transitions, no Framer Motion
- **3D**: Three.js with `useRef` + `useEffect` lifecycle

### Naming
- Turkish/English mixed: UX text in Turkish, code comments in English
- CSS: BEM-like naming (e.g., `.hero__h1`, `.pcard__sweep`)
- Component files: PascalCase with `.jsx` extension

### Performance
- `requestAnimationFrame` for smooth animations
- `useCallback` for memoized event handlers
- Canvas resizing on window resize
- Pointer events disabled on decorative elements

---

## 🚀 Product URLs

- **SkillMatch**: https://skillmatch.sryverse.com
- **EstateMatch**: https://estate.sryverse.com
- **Metraj AI**: https://metraj.sryverse.com (private beta)
- **Main Site**: sryverse.com

---

## 📝 Content & Messaging

### Core Brand Message
> "Operasyonel Karmaşıklıktan Akıllı Sistem Çözümlerine"  
> (From Operational Complexity to Intelligent System Solutions)

### 5-Step Methodology
1. **Gözlemle** - Observe workflows & operational bottlenecks
2. **Modelle** - Transform process into measurable data models
3. **Optimize Et** - Identify critical decision points & inefficiencies
4. **Otomatize** - Automate repetitive, high-volume tasks with AI
5. **Ölçeklendir** - Deploy as SaaS platform & scale

### Product Positioning
- **SkillMatch**: Recruitment Intelligence - AI-powered candidate matching
- **EstateMatch**: Real Estate Intelligence - Portfolio + customer matching
- **Metraj AI**: AI Quantity Surveying - Automated architectural analysis

---

## 🎓 How It Works (Technical)

### Data Flow
1. **User Interaction**: Mouse/scroll events → Canvas/Component state updates
2. **Animations**: Hooks trigger on visibility → CSS/GSAP animations play
3. **3D Rendering**: Three.js renders to canvas, updates on mouse/camera changes
4. **Terminal**: Simulates boot sequence with timed text line injections
5. **Navigation**: Page state switches content while reusing header/footer

### Performance Considerations
- Canvas elements positioned absolutely, z-indexed behind content
- Particles use simple circle rendering (not geometry)
- Wave calculations use sine functions (not expensive physics)
- Particle connections limited to ~120px radius (culling)
- Terminal text updates use timeouts (not continuous renders)

---

## 🐛 Known Patterns & Gotchas

1. **Grid Offset Animation**: Background grid uses modulo arithmetic for seamless scrolling
2. **Wave Distortion**: Mouse proximity affects wave amplitude (non-linear response)
3. **Color Layering**: Multiple rgba overlays create depth perception
4. **3D Perspective**: Product cards use `transform-style: preserve-3d` for tilt effect
5. **Blur Stacking**: Header uses `backdrop-filter: blur(22px)` + box-shadow for depth

---

## 🔗 Related Files

- `vite.config.js` - Build config
- `src/main.jsx` - React entry point
- `src/App.jsx` - App shell: header, routing, vision page, footer
- `src/home/` - Homepage narrative scenes + `Home.css`
- `src/index.css` - Global tokens & resets
- `src/App.css` - All component styles (600+ lines)
- `public/` - Static assets (images, badges)

---

## 📧 Contact & Links

- **WhatsApp**: +90 531 517 8170
- **Email**: From form submissions
- **Social**: LinkedIn, GitHub (links in footer)

---
------
*Last Updated: 2026-09-03*
*Maintained by: beyzaacetin*
