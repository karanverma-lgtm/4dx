---
name: Precision Performance
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#330009'
  on-tertiary: '#ffffff'
  tertiary-container: '#590016'
  on-tertiary-container: '#ff4e69'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter-desktop: 24px
  margin-desktop: 32px
  gutter-mobile: 16px
  margin-mobile: 16px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for high-stakes enterprise sales environments. It prioritizes clarity, analytical depth, and trust. The visual language is **Corporate / Modern**, characterized by structured information hierarchies, systematic density, and a focus on glanceable metrics. 

The aesthetic is "Data-First," removing unnecessary decorative elements to focus on performance trends. It targets executive leadership and sales directors, evoking a sense of stability, precision, and proactive decision-making. The tone is professional, grounded, and authoritative, utilizing a "quiet" UI to let the "loud" data insights take center stage.

## Colors
The palette is rooted in deep slate and navy blues to establish a serious, professional foundation. 

- **Primary:** A deep Slate Blue (#1E293B) used for navigation, headers, and core structural elements to ground the interface.
- **Success (Professional Green):** Emerald (#10B981) is used strictly for positive growth, met targets, and healthy pipeline indicators.
- **Alert (Muted Red):** Rose (#F43F5E) provides high visibility for missed targets or declining performance without being overly aggressive.
- **Neutral:** A range of Cool Grays are used for secondary data, labels, and borders to maintain high legibility without distracting from key metrics.
- **Background:** A very light Gray-Blue (#F8FAFC) reduces eye strain during long periods of data analysis.

## Typography
The typography system uses a tri-font approach to maximize readability in dense data environments:

1. **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif that provides a "tech-forward" executive feel for titles and large KPI numbers.
2. **Inter (Body):** The workhorse for all interface text. Its high x-height ensures clarity in tables and descriptions.
3. **JetBrains Mono (Labels/Metrics):** Used sparingly for technical data points, small labels, and delta percentages. The monospaced nature ensures that numbers align perfectly in vertical columns, aiding scanability.

Standardize on tight letter-spacing for headlines to maintain a compact feel, while increasing tracking for monospaced labels to ensure clarity at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for desktop. 

- **Density:** High. Use a 4px base unit to allow for the compact arrangement of data widgets.
- **Rhythm:** Containers should use 24px padding internal to cards, with 24px gutters between cards.
- **Breakpoints:**
  - **Desktop (1200px+):** 12 columns, fixed margins.
  - **Tablet (768px - 1199px):** 8 columns, fluid margins. Side navigation collapses to an icon-only rail.
  - **Mobile (<767px):** 4 columns, single-stack cards.
- **Safe Areas:** Maintain a 32px safe area around the edges of the primary viewport to ensure the interface feels balanced and professional.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-contrast Outlines** rather than aggressive shadows. This maintains a flat, high-performance feel.

- **Base Layer:** #F8FAFC (Surface).
- **Component Layer:** #FFFFFF (Card Surface) with a 1px border in #E2E8F0.
- **Depth:** Elevation is conveyed through subtle "inner-glow" shadows (0px 1px 2px rgba(0,0,0,0.05)) to lift cards slightly off the background. 
- **Active States:** Elements being interacted with (e.g., a dragged chart module) receive a medium-diffused shadow with a slight primary-color tint to indicate state change without breaking the minimalist aesthetic.

## Shapes
The shape language is **Soft (0.25rem)**. 

In a data-heavy environment, sharp corners can feel too aggressive, while pill shapes waste too much real estate. A subtle corner radius on cards, buttons, and input fields provides a modern touch while maintaining the structural integrity of the grid. 
- **Large Components (Cards):** Use 0.5rem (rounded-lg).
- **Small Components (Chips/Buttons):** Use 0.25rem (standard).
- **Data Bars:** Use 2px radius to keep the "bar chart" look precise but approachable.

## Components
- **KPI Cards:** Large Hanken Grotesk numbers. Trends (up/down) must include a JetBrains Mono percentage and a color-coded icon (Green/Red).
- **Data Tables:** Zebra-striping is forbidden. Use thin horizontal dividers only (#F1F5F9). Headers should be in all-caps JetBrains Mono at 10px.
- **Buttons:** 
  - *Primary:* Solid Slate Blue with white text. 
  - *Secondary:* Transparent with a Slate Blue border.
  - *Ghost:* For utility actions like "Export" or "Filter."
- **Input Fields:** Flat appearance with a 1px border. Focus state uses a 2px primary color ring with 0% offset.
- **Status Chips:** High-contrast text on a low-opacity background of the same color (e.g., Success green text on 10% opacity green background) for "Target Met" or "At Risk" labels.
- **Charts:** Use a 2px stroke width for line charts. Use the primary slate for the main data line and neutral grays for benchmark lines.