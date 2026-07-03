<RULE[project_design_system]>
# Project Design System & Premium SaaS Aesthetics

**Role & Objective**
When modifying, creating, or interacting with this workspace's UI components, you MUST adhere strictly to the established "Premium SaaS" aesthetic (similar to the dashboard/invoice UI we created). All new elements, pages, or components must follow this exact same artistic direction, using the same animations, micro-interactions, and visual language. 
Eradicate any generic, basic, or flat designs. The UI must feel highly professional, expensive, and meticulously crafted.

### 1. Palette & Colors
- **Primary Accent:** Green (Tailwind `primary-500` / `#22c55e`). Use gradients (`from-primary-600 to-primary-500`) for emphasis.
- **Dark Elements:** `slate-900` or `slate-950` for dark mode sections, buttons, and text.
- **Light Elements:** `slate-50` or `white` for cards and backgrounds.
- **Borders & Shadows:** Use very subtle borders (`border-slate-200` or `border-slate-800` in dark mode) and soft, glowing shadows (`shadow-[0_0_20px_rgba(22,163,74,0.3)]`) for interactive or highlighted elements.

### 2. Typography
- **Headings (Display):** `Plus Jakarta Sans` (font-display) with tight tracking and bold weights.
- **Body & Data:** `Inter` (font-sans) for clean, readable text.

### 3. Glassmorphism & Textures
- **Noise Background:** Always include a subtle SVG noise texture (`.noise-bg` at 0.03 opacity) on the `body` or root container to eliminate flat digital gradients.
- **Glass Effects:** Use `backdrop-blur-sm` to `backdrop-blur-xl`, paired with semi-transparent backgrounds (e.g., `bg-slate-900/40` or `bg-white/10`) for overlays, navbars, and modals.

### 4. GSAP Animations (Mandatory)
Every new component or section MUST be animated. No element should just "appear" statically.
- **Reveal on Scroll:** Use IntersectionObserver to trigger CSS classes (e.g., `.reveal.active` which fades in and `translateY(0)` over 0.8s with a smooth cubic-bezier).
- **GSAP Easing:** Default to `power3.out`, `power4.out`, or `back.out(1.5)` for bouncy, premium entry animations.
- **Stagger:** When presenting lists, cards, or grids, always stagger their appearance (delay of 0.1s to 0.2s).

### 5. Micro-Interactions
- **Magnetic Buttons:** Primary CTAs should use a "magnetic" effect (GSAP tracking mouse movement relative to the button center).
- **Hover States:** Cards must have a levitation effect (`hover:-translate-y-2` with `duration-500`).
- **Icons:** Use `Lucide Icons`. On hover, add subtle transitions (e.g., `group-hover:scale-110` or `group-hover:rotate-90`).

### Execution Directive
Do not ask for permission to add animations or style elements—just apply them by default. If a user asks for a new feature (e.g., a settings page, a table), build it using this exact design system so that it feels like a seamless extension of the existing premium dashboard.
</RULE[project_design_system]>
