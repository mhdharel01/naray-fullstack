# DESIGN CONTRACT — Naray Hospital

> Design System & Tokens governed by `antislop-ui` principles. Clean, authoritative, hospital-grade interface with authentic Teal Naray Hospital identity.

---

## 1. Color System (60-30-10 Rule)

### Dominant Neutral (60%)
- **Background Base**: `#F8FAFC` (Clean clinical canvas)
- **Card / Surface**: `#FFFFFF` (Solid white, crisp elevation)
- **Deep Forest / Dark Slate Teal**: `#042622` (Hero section canvas, subpage heroes, footer, topbar & high-contrast deep green accents)
- **Text Primary**: `#0F172A` (WCAG AAA contrast on white, >12:1)
- **Text Secondary**: `#475569` (WCAG AA contrast on white, >4.8:1)
- **Text Muted**: `#64748B` (Captions & labels)
- **Borders & Dividers**: `#E2E8F0` (Default 1px crisp lines), `#CBD5E1` (Input borders)

### Supporting Brand Color (30% — Signature Teal Naray)
- **Teal Primary**: `#078F83` (Signature Naray Hospital brand teal)
- **Teal Hover / Deep**: `#065A53` (Interactive hover & deep brand surfaces)
- **Teal Active**: `#04443E`
- **Teal Surface / Tint**: `#E6F4F2` (Low saturation tint for pills, badges, and icons)
- **Teal Border**: `rgba(7, 143, 131, 0.25)`

### Intentional Accents (10% — Functional Only)
- **Emergency Accent**: `#DC2626` / Light: `#FEF2F2` (Strictly for UGD 24 Jam and critical warnings)
- **Accreditation Gold**: `#D97706` / Tint: `#FEF3C7` (For KARS Paripurna / Official certification)
- **Success / Status**: `#059669` (Online / Available status)

---

## 2. Typography Hierarchy

Single clean font system with strong editorial clinical hierarchy (`Inter` / `Plus Jakarta Sans` / system fallback):
- **Hero Title**: `clamp(2.25rem, 4.5vw, 3.5rem)`, weight 800, line-height 1.15, letter-spacing -0.025em.
- **Section Heading (H2)**: `2rem` (32px), weight 700, line-height 1.25, letter-spacing -0.02em.
- **Card Heading (H3)**: `1.25rem` (20px), weight 600, line-height 1.35.
- **Body Large**: `1.125rem` (18px), line-height 1.65, weight 400.
- **Body Standard**: `0.9375rem` (15px), line-height 1.5, weight 400.
- **Labels & Microcopy**: `0.8125rem` (13px), weight 600, letter-spacing 0.02em.

---

## 3. Elevation & Surfaces

- **No generic multi-layer blurred shadows or purple glowing halos.**
- **Elevation Flat**: 1px solid `#E2E8F0` border, no shadow.
- **Elevation Raised (Cards)**: `0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)`, with 1px solid `#E2E8F0`.
- **Elevation Floating (Hero QuickSearch Card)**: `0 16px 36px -8px rgba(11, 37, 69, 0.12), 0 4px 12px -2px rgba(11, 37, 69, 0.05)`, border 1px solid `#CBD5E1`.
- **Border Radius**: Strictly 2 scales:
  - `radius-sm`: `8px` (Inputs, select fields, buttons, badges)
  - `radius-lg`: `16px` (Cards, panels, widgets)
  - *No full-pill border radius on regular rectangular buttons or form containers.*

---

## 4. Liveliness Dials

- **Energy (1-5)**: `2` — Calm, reassuring, clinical, dignified.
- **Personality (1-5)**: `2` — Authoritative medical institution, humane, accessible.
- **Rhythm (1-5)**: `2` — Regular structured grid, balanced white space, high legibility.
- **Motion (1-5)**: `2` — Subtle, 150ms-200ms transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), no bouncy gimmicks.

---

## 5. Anti-Slop Strict Rules

1. **No generic AI purple-blue gradients**: Strictly use solid `#078F83` teal, deep clinical `#0B2545`, and crisp white surfaces.
2. **No excessive glassmorphism**: Solid, legible backgrounds with high contrast. Badges must be solid or subtle high-contrast tints (`#E6F4F2`).
3. **No uniform pills**: Inputs and buttons have a crisp `8px-10px` radius, not 9999px pills everywhere.
4. **Touch targets**: All interactive buttons, inputs, tabs, and pagination dots MUST have a hit area $\ge 44\text{px}$.
5. **Form inputs**: White backgrounds, clear dark labels (`#0F172A`), distinct 1.5px borders, and a crisp `#078F83` focus ring.
