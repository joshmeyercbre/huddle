# Intelligent Automation Studio -- Design Spec

## Overview

A static Next.js showcase site deployed to Azure Static Web Apps that demonstrates the CBRE Automations team's capabilities through interactive, animated visual demonstrations. The primary audience is internal CBRE leadership, other teams, and select clients. The site serves as both a marketing tool and a training resource -- showing what automations exist and how they work.

## Branding

- **Primary green:** #006A4E (CBRE brand)
- **White:** #FFFFFF
- **Dark gray:** #333333
- **Light gray (backgrounds):** #F5F5F5
- **Accent green (lighter, for highlights):** #00A86B
- **Font:** System font stack or Inter (clean, corporate)

## Site Structure

Single-page scrolling site with 4 major zones:

### 1. Hero Section
- Headline: "Intelligent Automation Studio"
- Subtitle: Describes the Automations team's mission -- transforming manual processes into intelligent, automated workflows
- Subtle animated background (flowing circuit/data pattern in CBRE green at low opacity)
- "See Our Capabilities" CTA button that smooth-scrolls to the first capability

### 2. Metrics Bar
- Horizontal strip below the hero
- 3-4 high-level impact numbers that count up on scroll into view
- Hardcoded values, easy to update in `capabilities.ts`
- Examples: "X,000+ Hours Saved", "Y Automations Live", "$Z Saved Annually"

### 3. Capability Sections (9 total)
- Each capability is a full-viewport-height section
- Alternating layout: odd sections = text left / visual right, even sections = text right / visual left
- Text side contains: title, 2-3 sentence description, key metric badge, bullet list of features
- Visual side contains: the animated or static demo component

### 4. Footer
- CBRE branding
- Team contact info
- Minimal links

### Navigation
- Sticky top nav bar
- CBRE logo on the left
- Capability names as anchor links on the right (scrollable if needed on smaller screens)
- Active section highlights as user scrolls
- Clean, minimal styling

## Capabilities

### Capability 1: Invoice Validation
- **Description:** Automated validation of invoice data against expected values, catching discrepancies before they reach finance.
- **Demo type:** Animated
- **Visual:** A sample invoice appears. Fields highlight one by one as they're validated. Checkmarks or X marks animate in next to each field (vendor name, amount, date, PO number, etc.).
- **Key metric:** Example -- "99.2% accuracy rate"

### Capability 2: Work Order Verification -- Photo Count
- **Description:** Verifies that the correct number of photos have been submitted for a work order, ensuring field completion compliance.
- **Demo type:** Animated
- **Visual:** A work order card shows expected photo count (e.g., "8 required"). Photos drop in one by one, a progress bar fills. Final state shows a green checkmark if count matches, or a warning badge if short.
- **Key metric:** Example -- "15,000+ work orders verified/month"

### Capability 3: Work Order Verification -- IVR Accuracy
- **Description:** Validates IVR (Interactive Voice Response) system data against work order records to ensure accuracy of automated check-ins.
- **Demo type:** Animated
- **Visual:** A simulated data table with IVR entries. Rows validate one by one with green checkmarks animating down the validation column. Mismatches highlight in amber.
- **Key metric:** Example -- "98% IVR match rate"

### Capability 4: AI Photo Scanning & Asset Extraction
- **Description:** Uses AI vision to analyze field photos and automatically extract asset information -- type, model, serial number, condition.
- **Demo type:** Animated
- **Visual:** A photo appears, a scanning overlay sweeps across it, then extracted data fields pop out to the side (asset type, model, serial number, condition rating).
- **Key metric:** Example -- "Seconds per extraction vs. 10+ min manual"

### Capability 5: AI Photo Validation
- **Description:** AI-powered quality and content validation of submitted photos -- detecting blurriness, wrong angles, missing subjects, and compliance issues.
- **Demo type:** Animated
- **Visual:** A grid of 4-6 photos. Each receives a quality score overlay -- green for pass, amber for review, red for fail -- with reason labels like "Blurry", "Wrong angle", "Missing asset tag".
- **Key metric:** Example -- "Catches 95% of non-compliant photos"

### Capability 6: Data Pipeline Visualizations
- **Description:** End-to-end data pipeline orchestration -- ingesting from multiple sources, transforming, validating, and delivering to downstream systems.
- **Demo type:** Static with animated data flow
- **Visual:** A clean flow diagram showing data source nodes flowing through transformation steps to destination nodes. Small animated dots travel along the paths to show data movement.
- **Key metric:** Example -- "X data sources integrated"

### Capability 7: AI-Powered Invoice Processing & Receipt Extraction
- **Description:** Automatically extracts data from receipts and invoices using Gemini vision AI, validates against work orders, and creates invoices in fmPilot. Handles PM, Quote, and Reactive work order types. Automatically reschedules when parts ship.
- **Demo type:** Animated
- **Visual:** A receipt image appears. AI scanning overlay highlights key fields. Extracted data populates a structured form on the right. The form then transforms into an fmPilot invoice preview with a "Created" badge.
- **Key metric:** Example -- "X invoices processed/month"

### Capability 8: State-Compliant GPS Timecard Validation
- **Description:** Validates technician timecards against GPS location data, applies state-specific labor law rules, calculates commute exemptions, and feeds validated data to payroll.
- **Demo type:** Animated
- **Visual:** A map with GPS pins showing technician locations. A timecard overlay appears alongside. State labor law badges animate in (e.g., "CA overtime rules", "TX commute exemption"). Validation results populate with calculated hours and exemptions.
- **Key metric:** Example -- "Compliance across X states"

### Capability 9: Web Development -- FieldOps
- **Description:** Custom-built FieldOps web application -- a purpose-built tool for field operations management, demonstrating the team's full-stack web development capabilities.
- **Demo type:** Static with visual
- **Visual:** A styled browser frame showing a FieldOps application screenshot or mockup, with callout annotations highlighting key features (dashboard, work order management, reporting).
- **Key metric:** Example -- "Built and maintained in-house"

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Export:** Static export (`output: 'export'`) for Azure Static Web Apps
- **Styling:** Tailwind CSS with CBRE brand color tokens in the theme config
- **Animations:** Framer Motion for scroll-triggered animations and demo sequences
- **Language:** TypeScript
- **No backend:** Pure static site, all data hardcoded in TypeScript files

## File Structure

```
src/
  app/
    layout.tsx              -- root layout, fonts, metadata, Navbar
    page.tsx                -- single page assembling all sections in order
  components/
    Hero.tsx                -- hero section with animated background
    MetricsBar.tsx          -- count-up metrics strip
    CapabilitySection.tsx   -- shared layout wrapper (handles alternating left/right)
    Footer.tsx              -- footer with branding and contact
    nav/
      Navbar.tsx            -- sticky nav with anchor links, active highlight
    demos/
      InvoiceValidation.tsx
      PhotoCount.tsx
      IvrAccuracy.tsx
      PhotoScanning.tsx
      PhotoValidation.tsx
      DataPipeline.tsx
      ReceiptExtraction.tsx
      GpsTimecard.tsx
      FieldOpsWeb.tsx
  data/
    capabilities.ts         -- all capability metadata: title, description, metrics, bullet points, demo component reference
  styles/
    globals.css             -- Tailwind base, CBRE brand custom properties
```

## Adding New Capabilities

To add a new capability:
1. Create a new demo component in `src/components/demos/`
2. Add an entry to `src/data/capabilities.ts` with title, description, metrics, and demo component reference
3. The page automatically renders all capabilities from the data file in order

## Deployment

- Azure Static Web Apps
- Next.js static export produces a fully static `out/` directory
- No server-side rendering or API routes needed
- `staticwebapp.config.json` at root for any routing rules

## Scroll Behavior

- Framer Motion `useInView` hook triggers animations as sections scroll into the viewport
- Animations play once (not on every scroll past)
- Smooth scroll for nav anchor links
- Nav active state updates based on scroll position using Intersection Observer

## Responsive Design

- Desktop-first but responsive down to tablet
- On smaller screens, capability sections stack vertically (visual above text) instead of side-by-side
- Nav collapses to a hamburger menu on mobile
- Metrics bar wraps to 2x2 grid on small screens
