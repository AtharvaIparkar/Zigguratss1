# Zigguratss — The Vault Experience

Welcome to the premium digital experience for Zigguratss legal pages. This project transforms legal content into a cinematic, interactive art gallery.

## 🏛 Architecture

- **Atoms**: Primitive UI elements (`VaultButton`, `VaultLine`, `InkReveal`).
- **Molecules**: Combined components (`CovenantHeader`, `RevealPane`, `LegalParchment`).
- **Organisms**: High-level page sections (`VaultHero`, `VaultNavigation`, `ChapterSection`).
- **WebGL**: Three.js particle field for ambient depth.
- **Motion**: GSAP + ScrollTrigger for cinematic reveals, Framer Motion for micro-interactions.

## 📄 Managing Content

All legal text is stored in `/src/content/terms.json` and `/src/content/privacy.json`.

**To update content without touching code:**
1. Open the relevant JSON file.
2. Edit the `text` field for the desired chapter.
3. Ensure the `layout` and `chapter` fields remain consistent.
4. The site will automatically reflect changes on save.

## 🛠 Tech Stack

- React 18 + Vite
- GSAP 3 (ScrollTrigger)
- Three.js
- Framer Motion
- Lenis Smooth Scroll
- Tailwind CSS

## ♿ Accessibility

- Respects `prefers-reduced-motion`.
- Semantic HTML throughout.
- ARIA-compliant reveal interactions.
- Optimized for screen readers.

---
*Created with intent by the Zigguratss Archival Team.*
