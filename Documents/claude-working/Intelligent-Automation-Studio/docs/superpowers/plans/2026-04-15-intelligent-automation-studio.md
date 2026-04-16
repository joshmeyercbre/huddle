# Intelligent Automation Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Next.js showcase site that demonstrates 9 CBRE automation capabilities through animated visual demos, deployed to Azure Static Web Apps.

**Architecture:** Single-page scrolling site with hero, metrics bar, 9 capability sections (alternating left/right layout with animated demos), and footer. All data hardcoded in TypeScript. Framer Motion for scroll-triggered animations.

**Tech Stack:** Next.js 14 (App Router, static export), TypeScript, Tailwind CSS, Framer Motion

**Repo:** https://github.com/joshmeyercbre/intelligent-automation-studio

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `staticwebapp.config.json`
- Create: `.gitignore`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd "C:/Users/Josh/Documents/claude-working/Intelligent-Automation-Studio"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Expected: Project files created. May prompt to overwrite existing files -- accept.

- [ ] **Step 2: Install Framer Motion**

Run:
```bash
npm install framer-motion
```

Expected: `framer-motion` added to `package.json` dependencies.

- [ ] **Step 3: Configure Next.js for static export**

In `next.config.js`, set:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

`output: 'export'` produces a static `out/` directory. `images.unoptimized` is required because the Next.js Image optimizer needs a server.

- [ ] **Step 4: Configure Tailwind with CBRE brand colors**

In `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cbre: {
          green: "#006A4E",
          "green-light": "#00A86B",
          dark: "#333333",
          light: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Set up globals.css**

In `src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #333333;
  background: #FFFFFF;
}
```

- [ ] **Step 6: Create Azure Static Web Apps config**

Create `staticwebapp.config.json` at project root:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

- [ ] **Step 7: Update .gitignore**

Ensure `.gitignore` includes:
```
node_modules/
.next/
out/
```

- [ ] **Step 8: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds, `out/` directory created with static files.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js staticwebapp.config.json .gitignore src/styles/globals.css .eslintrc.json
git commit -m "feat: scaffold Next.js project with Tailwind, Framer Motion, static export"
```

---

### Task 2: Capabilities Data File

**Files:**
- Create: `src/data/capabilities.ts`

- [ ] **Step 1: Create the capabilities data file**

This file is the single source of truth for all capability metadata. Demo components will be mapped by a string key rather than direct component imports (to keep data and UI separated).

Create `src/data/capabilities.ts`:
```ts
export interface Capability {
  id: string;
  title: string;
  description: string;
  metric: { value: string; label: string };
  features: string[];
  demoKey: string;
}

export interface SiteMetric {
  value: number;
  suffix: string;
  label: string;
}

export const siteMetrics: SiteMetric[] = [
  { value: 5000, suffix: "+", label: "Hours Saved Annually" },
  { value: 9, suffix: "", label: "Automations Live" },
  { value: 250, suffix: "K+", label: "Dollars Saved Annually" },
  { value: 15000, suffix: "+", label: "Work Orders Processed Monthly" },
];

export const capabilities: Capability[] = [
  {
    id: "invoice-validation",
    title: "Invoice Validation",
    description:
      "Automated validation of invoice data against expected values, catching discrepancies before they reach finance.",
    metric: { value: "99.2%", label: "Accuracy Rate" },
    features: [
      "Field-by-field validation against work order data",
      "Vendor name, amount, date, and PO number checks",
      "Automatic flagging of discrepancies",
      "Real-time validation dashboard",
    ],
    demoKey: "invoice-validation",
  },
  {
    id: "photo-count",
    title: "Work Order Verification \u2014 Photo Count",
    description:
      "Verifies that the correct number of photos have been submitted for a work order, ensuring field completion compliance.",
    metric: { value: "15,000+", label: "Work Orders Verified/Month" },
    features: [
      "Expected vs. actual photo count comparison",
      "Automatic compliance flagging",
      "Progress tracking per work order",
      "Batch verification across portfolios",
    ],
    demoKey: "photo-count",
  },
  {
    id: "ivr-accuracy",
    title: "Work Order Verification \u2014 IVR Accuracy",
    description:
      "Validates IVR (Interactive Voice Response) system data against work order records to ensure accuracy of automated check-ins.",
    metric: { value: "98%", label: "IVR Match Rate" },
    features: [
      "Cross-reference IVR entries with work orders",
      "Row-by-row accuracy validation",
      "Mismatch highlighting and reporting",
      "Trend analysis over time",
    ],
    demoKey: "ivr-accuracy",
  },
  {
    id: "photo-scanning",
    title: "AI Photo Scanning & Asset Extraction",
    description:
      "Uses AI vision to analyze field photos and automatically extract asset information \u2014 type, model, serial number, condition.",
    metric: { value: "Seconds", label: "Per Extraction vs. 10+ Min Manual" },
    features: [
      "AI-powered image analysis",
      "Automatic asset type identification",
      "Serial number and model extraction",
      "Condition rating assessment",
    ],
    demoKey: "photo-scanning",
  },
  {
    id: "photo-validation",
    title: "AI Photo Validation",
    description:
      "AI-powered quality and content validation of submitted photos \u2014 detecting blurriness, wrong angles, missing subjects, and compliance issues.",
    metric: { value: "95%", label: "Non-Compliant Photos Caught" },
    features: [
      "Blur and quality detection",
      "Angle and framing validation",
      "Missing subject identification",
      "Compliance scoring with reasons",
    ],
    demoKey: "photo-validation",
  },
  {
    id: "data-pipeline",
    title: "Data Pipeline Visualizations",
    description:
      "End-to-end data pipeline orchestration \u2014 ingesting from multiple sources, transforming, validating, and delivering to downstream systems.",
    metric: { value: "12+", label: "Data Sources Integrated" },
    features: [
      "Multi-source data ingestion",
      "Automated transformation and validation",
      "Real-time pipeline monitoring",
      "Error handling and retry logic",
    ],
    demoKey: "data-pipeline",
  },
  {
    id: "receipt-extraction",
    title: "AI-Powered Invoice Processing & Receipt Extraction",
    description:
      "Automatically extracts data from receipts and invoices using Gemini vision AI, validates against work orders, and creates invoices in fmPilot. Handles PM, Quote, and Reactive work order types. Automatically reschedules when parts ship.",
    metric: { value: "1,000+", label: "Invoices Processed/Month" },
    features: [
      "Gemini AI vision-powered extraction",
      "PM, Quote, and Reactive work order support",
      "Automatic fmPilot invoice creation",
      "Parts shipment auto-rescheduling",
    ],
    demoKey: "receipt-extraction",
  },
  {
    id: "gps-timecard",
    title: "State-Compliant GPS Timecard Validation",
    description:
      "Validates technician timecards against GPS location data, applies state-specific labor law rules, calculates commute exemptions, and feeds validated data to payroll.",
    metric: { value: "50", label: "States Compliant" },
    features: [
      "GPS location vs. timecard cross-validation",
      "State-specific labor law rule engine",
      "Automatic commute exemption calculation",
      "Direct payroll system feed",
    ],
    demoKey: "gps-timecard",
  },
  {
    id: "fieldops-web",
    title: "Web Development \u2014 FieldOps",
    description:
      "Custom-built FieldOps web application \u2014 a purpose-built tool for field operations management, demonstrating the team's full-stack web development capabilities.",
    metric: { value: "In-House", label: "Built & Maintained" },
    features: [
      "Custom field operations dashboard",
      "Work order management system",
      "Reporting and analytics",
      "Built with modern web technologies",
    ],
    demoKey: "fieldops-web",
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit src/data/capabilities.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/capabilities.ts
git commit -m "feat: add capabilities data with all 9 automation entries"
```

---

### Task 3: Root Layout & Navbar

**Files:**
- Create: `src/components/nav/Navbar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Navbar component**

Create `src/components/nav/Navbar.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { capabilities } from "@/data/capabilities";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    capabilities.forEach((cap) => {
      const el = document.getElementById(cap.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(cap.id);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-cbre-green rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-cbre-dark text-sm hidden sm:block">
              Intelligent Automation Studio
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                onClick={() => scrollTo(cap.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeSection === cap.id
                    ? "bg-cbre-green text-white"
                    : "text-cbre-dark hover:bg-cbre-light"
                }`}
              >
                {cap.title}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-cbre-light"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pb-4">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => scrollTo(cap.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                activeSection === cap.id
                  ? "bg-cbre-green text-white"
                  : "text-cbre-dark hover:bg-cbre-light"
              }`}
            >
              {cap.title}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import Navbar from "@/components/nav/Navbar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Intelligent Automation Studio | CBRE",
  description:
    "Explore CBRE's automation capabilities — from AI-powered invoice processing to GPS timecard validation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/Navbar.tsx src/app/layout.tsx
git commit -m "feat: add sticky navbar with scroll-based active section tracking"
```

---

### Task 4: Hero Section

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/Hero.tsx`:
```tsx
"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const scrollToCapabilities = () => {
    document
      .getElementById("invoice-validation")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cbre-dark">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 50 40 M 50 60 L 50 100 M 0 50 L 40 50 M 60 50 L 100 50" stroke="#00A86B" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="3" fill="#00A86B" />
              <circle cx="0" cy="0" r="2" fill="#006A4E" />
              <circle cx="100" cy="0" r="2" fill="#006A4E" />
              <circle cx="0" cy="100" r="2" fill="#006A4E" />
              <circle cx="100" cy="100" r="2" fill="#006A4E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Floating animated dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cbre-green-light"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Intelligent Automation{" "}
          <span className="text-cbre-green-light">Studio</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Transforming manual processes into intelligent, automated workflows.
          Explore how the Automations team delivers measurable impact through
          AI-powered solutions.
        </motion.p>

        <motion.button
          onClick={scrollToCapabilities}
          className="inline-flex items-center gap-2 px-8 py-4 bg-cbre-green text-white font-semibold rounded-lg hover:bg-cbre-green-light transition-colors text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          See Our Capabilities
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: add hero section with animated background and CTA"
```

---

### Task 5: Metrics Bar

**Files:**
- Create: `src/components/MetricsBar.tsx`

- [ ] **Step 1: Create MetricsBar component**

Create `src/components/MetricsBar.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { siteMetrics } from "@/data/capabilities";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function MetricsBar() {
  return (
    <section className="bg-cbre-green py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {siteMetrics.map((metric, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-white">
                <CountUp target={metric.value} suffix={metric.suffix} />
              </div>
              <div className="text-sm text-green-100 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/MetricsBar.tsx
git commit -m "feat: add metrics bar with count-up animation on scroll"
```

---

### Task 6: CapabilitySection Wrapper & Footer

**Files:**
- Create: `src/components/CapabilitySection.tsx`
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create CapabilitySection layout wrapper**

Create `src/components/CapabilitySection.tsx`:
```tsx
"use client";

import { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Capability } from "@/data/capabilities";

interface Props {
  capability: Capability;
  index: number;
  children: ReactNode; // the demo component
}

export default function CapabilitySection({ capability, index, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 1;

  return (
    <section
      id={capability.id}
      ref={ref}
      className={`min-h-screen flex items-center py-20 ${
        isEven ? "bg-cbre-light" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`flex flex-col lg:flex-row items-center gap-12 ${
            isEven ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Text Side */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-cbre-dark mb-4">
              {capability.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6">{capability.description}</p>

            {/* Metric Badge */}
            <div className="inline-flex items-center gap-2 bg-cbre-green/10 border border-cbre-green/20 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl font-bold text-cbre-green">
                {capability.metric.value}
              </span>
              <span className="text-sm text-cbre-dark">{capability.metric.label}</span>
            </div>

            {/* Feature List */}
            <ul className="space-y-3">
              {capability.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-cbre-green mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Demo Side */}
          <motion.div
            className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Footer component**

Create `src/components/Footer.tsx`:
```tsx
export default function Footer() {
  return (
    <footer className="bg-cbre-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cbre-green rounded flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <div className="text-white font-semibold">CBRE Automations Team</div>
              <div className="text-gray-400 text-sm">GWS - On Demand</div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-gray-400 text-sm">
              Intelligent Automation Studio
            </div>
            <div className="text-gray-500 text-xs mt-1">
              &copy; {new Date().getFullYear()} CBRE Group, Inc.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/CapabilitySection.tsx src/components/Footer.tsx
git commit -m "feat: add CapabilitySection layout wrapper and Footer"
```

---

### Task 7: Demo Components — Invoice Validation & Photo Count

**Files:**
- Create: `src/components/demos/InvoiceValidation.tsx`
- Create: `src/components/demos/PhotoCount.tsx`

- [ ] **Step 1: Create InvoiceValidation demo**

Create `src/components/demos/InvoiceValidation.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const invoiceFields = [
  { label: "Vendor Name", value: "ABC Facilities Inc.", valid: true },
  { label: "Invoice #", value: "INV-2026-4821", valid: true },
  { label: "PO Number", value: "PO-90234", valid: true },
  { label: "Amount", value: "$4,250.00", valid: true },
  { label: "Date", value: "04/10/2026", valid: true },
  { label: "Tax Rate", value: "9.5%", valid: false },
];

export default function InvoiceValidation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Invoice</div>
            <div className="font-semibold text-cbre-dark">INV-2026-4821</div>
          </div>
          <div className="text-xs text-gray-400">Automated Validation</div>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 space-y-4">
        {invoiceFields.map((field, i) => (
          <motion.div
            key={field.label}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              inView
                ? field.valid
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
                : "border-gray-100 bg-gray-50/50"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
          >
            <div>
              <div className="text-xs text-gray-500">{field.label}</div>
              <div className="font-medium text-cbre-dark">{field.value}</div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.15 }}
            >
              {field.valid ? (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.6 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 font-medium">5 passed</span>
          <span className="text-gray-300">|</span>
          <span className="text-red-600 font-medium">1 flagged</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Requires review</span>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create PhotoCount demo**

Create `src/components/demos/PhotoCount.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const photos = [
  { id: 1, label: "Before - Exterior" },
  { id: 2, label: "Before - Interior" },
  { id: 3, label: "Equipment Tag" },
  { id: 4, label: "Work In Progress" },
  { id: 5, label: "After - Exterior" },
  { id: 6, label: "After - Interior" },
  { id: 7, label: "Final Inspection" },
  { id: 8, label: "Sign-Off Sheet" },
];

export default function PhotoCount() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Work Order Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Work Order</div>
            <div className="font-semibold text-cbre-dark">WO-2026-18432</div>
          </div>
          <div className="text-sm text-gray-500">8 Photos Required</div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              className="aspect-square bg-cbre-light rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
            >
              <motion.div
                className="absolute inset-0 bg-cbre-green/10"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.12 }}
              />
              <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500 text-center px-1 leading-tight">
                {photo.label}
              </span>
              {/* Checkmark overlay */}
              <motion.div
                className="absolute top-1 right-1"
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.2, delay: 0.8 + i * 0.12 }}
              >
                <div className="w-5 h-5 rounded-full bg-cbre-green flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Photo Completion</span>
            <motion.span
              className="font-semibold text-cbre-green"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              8/8 Complete
            </motion.span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cbre-green rounded-full"
              initial={{ width: 0 }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <motion.div
        className="px-6 py-4 bg-green-50 border-t border-green-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.0 }}
      >
        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verification Complete — All Photos Received
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/InvoiceValidation.tsx src/components/demos/PhotoCount.tsx
git commit -m "feat: add InvoiceValidation and PhotoCount demo components"
```

---

### Task 8: Demo Components — IVR Accuracy & Photo Scanning

**Files:**
- Create: `src/components/demos/IvrAccuracy.tsx`
- Create: `src/components/demos/PhotoScanning.tsx`

- [ ] **Step 1: Create IvrAccuracy demo**

Create `src/components/demos/IvrAccuracy.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ivrRows = [
  { woNumber: "WO-18432", ivrTime: "08:15 AM", woTime: "08:14 AM", tech: "M. Johnson", match: true },
  { woNumber: "WO-18433", ivrTime: "09:30 AM", woTime: "09:30 AM", tech: "R. Davis", match: true },
  { woNumber: "WO-18434", ivrTime: "10:45 AM", woTime: "10:44 AM", tech: "S. Williams", match: true },
  { woNumber: "WO-18435", ivrTime: "11:20 AM", woTime: "01:20 PM", tech: "K. Brown", match: false },
  { woNumber: "WO-18436", ivrTime: "01:00 PM", woTime: "01:01 PM", tech: "J. Martinez", match: true },
  { woNumber: "WO-18437", ivrTime: "02:30 PM", woTime: "02:30 PM", tech: "A. Thompson", match: true },
];

export default function IvrAccuracy() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">IVR Validation</div>
            <div className="font-semibold text-cbre-dark">Daily Check-In Audit</div>
          </div>
          <div className="text-xs text-gray-400">April 10, 2026</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Work Order</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">IVR Time</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">WO Time</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Tech</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ivrRows.map((row, i) => (
              <motion.tr
                key={row.woNumber}
                className={`border-b border-gray-100 ${
                  inView && !row.match ? "bg-amber-50" : ""
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.15 }}
              >
                <td className="px-4 py-3 font-medium text-cbre-dark">{row.woNumber}</td>
                <td className="px-4 py-3 text-gray-600">{row.ivrTime}</td>
                <td className="px-4 py-3 text-gray-600">{row.woTime}</td>
                <td className="px-4 py-3 text-gray-600">{row.tech}</td>
                <td className="px-4 py-3 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.2, delay: 0.6 + i * 0.15 }}
                  >
                    {row.match ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Mismatch
                      </span>
                    )}
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 font-medium">5 matched</span>
          <span className="text-gray-300">|</span>
          <span className="text-amber-600 font-medium">1 mismatch</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">83.3% match rate</span>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create PhotoScanning demo**

Create `src/components/demos/PhotoScanning.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const extractedFields = [
  { label: "Asset Type", value: "HVAC - Rooftop Unit" },
  { label: "Manufacturer", value: "Carrier" },
  { label: "Model", value: "48TCDD08A2A6A0A0A0" },
  { label: "Serial Number", value: "3622F40195" },
  { label: "Condition", value: "Good" },
];

export default function PhotoScanning() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide">AI Asset Extraction</div>
        <div className="font-semibold text-cbre-dark">Photo Analysis</div>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Simulated Photo */}
          <div className="relative w-full sm:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">HVAC Unit Photo</span>
              </div>
            </div>

            {/* Scanning Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-cbre-green/30 to-transparent"
              initial={{ y: "-100%" }}
              animate={inView ? { y: "200%" } : {}}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />

            {/* AI Badge */}
            <motion.div
              className="absolute top-2 left-2 bg-cbre-green text-white text-xs px-2 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              AI Scanned
            </motion.div>
          </div>

          {/* Extracted Data */}
          <div className="flex-1 space-y-3">
            {extractedFields.map((field, i) => (
              <motion.div
                key={field.label}
                className="flex items-center justify-between p-2 rounded-md bg-cbre-light"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 1.5 + i * 0.2 }}
              >
                <span className="text-xs text-gray-500">{field.label}</span>
                <span className="text-sm font-medium text-cbre-dark">{field.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-green-50 border-t border-green-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.8 }}
      >
        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Extracted in 2.3 seconds — Manual average: 12 minutes
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/IvrAccuracy.tsx src/components/demos/PhotoScanning.tsx
git commit -m "feat: add IvrAccuracy and PhotoScanning demo components"
```

---

### Task 9: Demo Components — Photo Validation & Data Pipeline

**Files:**
- Create: `src/components/demos/PhotoValidation.tsx`
- Create: `src/components/demos/DataPipeline.tsx`

- [ ] **Step 1: Create PhotoValidation demo**

Create `src/components/demos/PhotoValidation.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const photoResults = [
  { label: "Exterior - Front", status: "pass" as const, reason: "Clear, proper angle" },
  { label: "Equipment Close-up", status: "pass" as const, reason: "Sharp, tag visible" },
  { label: "Interior - Lobby", status: "fail" as const, reason: "Blurry" },
  { label: "Nameplate", status: "pass" as const, reason: "Readable, well-lit" },
  { label: "Ceiling Tile", status: "review" as const, reason: "Wrong angle" },
  { label: "After - Exterior", status: "pass" as const, reason: "Matches before photo" },
];

const statusConfig = {
  pass: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "Pass" },
  review: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", label: "Review" },
  fail: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Fail" },
};

export default function PhotoValidation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide">AI Photo Validation</div>
        <div className="font-semibold text-cbre-dark">Quality Assessment</div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photoResults.map((photo, i) => {
            const config = statusConfig[photo.status];
            return (
              <motion.div
                key={photo.label}
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.15 }}
              >
                {/* Photo placeholder */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden border border-gray-200">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>

                  {/* Status overlay */}
                  <motion.div
                    className={`absolute inset-0 ${config.bg} flex items-center justify-center opacity-0`}
                    animate={inView ? { opacity: 0.85 } : {}}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.15 }}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-bold ${config.text}`}>{config.label}</div>
                      <div className={`text-xs ${config.text} mt-1`}>{photo.reason}</div>
                    </div>
                  </motion.div>
                </div>
                <div className="text-xs text-gray-600 text-center">{photo.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.0 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 font-medium">4 passed</span>
          <span className="text-gray-300">|</span>
          <span className="text-amber-600 font-medium">1 review</span>
          <span className="text-gray-300">|</span>
          <span className="text-red-600 font-medium">1 failed</span>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create DataPipeline demo**

Create `src/components/demos/DataPipeline.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const sources = ["fmPilot", "ServiceNow", "SAP", "Spreadsheets"];
const transforms = ["Validate", "Transform", "Enrich"];
const destinations = ["Data Warehouse", "Reports", "Dashboards"];

export default function DataPipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide">Data Pipeline</div>
        <div className="font-semibold text-cbre-dark">End-to-End Orchestration</div>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* Sources */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Sources</div>
            <div className="space-y-2">
              {sources.map((src, i) => (
                <motion.div
                  key={src}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center text-sm font-medium text-blue-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                >
                  {src}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center sm:py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              <svg className="w-8 h-8 text-gray-400 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
          </div>

          {/* Transforms */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Processing</div>
            <div className="space-y-2">
              {transforms.map((t, i) => (
                <motion.div
                  key={t}
                  className="bg-cbre-green/10 border border-cbre-green/30 rounded-lg px-3 py-2 text-center text-sm font-medium text-cbre-green"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 1.0 + i * 0.15 }}
                >
                  {t}
                </motion.div>
              ))}
            </div>

            {/* Animated dot */}
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-cbre-green"
                animate={inView ? { y: [0, -8, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center sm:py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.6 }}
            >
              <svg className="w-8 h-8 text-gray-400 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
          </div>

          {/* Destinations */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">Destinations</div>
            <div className="space-y-2">
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest}
                  className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-center text-sm font-medium text-purple-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 1.8 + i * 0.1 }}
                >
                  {dest}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          All pipelines operational
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/demos/PhotoValidation.tsx src/components/demos/DataPipeline.tsx
git commit -m "feat: add PhotoValidation and DataPipeline demo components"
```

---

### Task 10: Demo Components — Receipt Extraction, GPS Timecard, FieldOps

**Files:**
- Create: `src/components/demos/ReceiptExtraction.tsx`
- Create: `src/components/demos/GpsTimecard.tsx`
- Create: `src/components/demos/FieldOpsWeb.tsx`

- [ ] **Step 1: Create ReceiptExtraction demo**

Create `src/components/demos/ReceiptExtraction.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const receiptFields = [
  { label: "Vendor", value: "Home Depot" },
  { label: "Date", value: "04/08/2026" },
  { label: "Items", value: "3/4\" Copper Pipe, Flux, Solder" },
  { label: "Amount", value: "$187.43" },
  { label: "Tax", value: "$15.93" },
  { label: "Total", value: "$203.36" },
];

const woTypes = ["PM", "Quote", "Reactive"];

export default function ReceiptExtraction() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Gemini AI Extraction</div>
            <div className="font-semibold text-cbre-dark">Receipt to Invoice</div>
          </div>
          <div className="flex gap-1">
            {woTypes.map((type, i) => (
              <motion.span
                key={type}
                className="text-xs bg-cbre-green/10 text-cbre-green px-2 py-0.5 rounded-full"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Receipt */}
          <div className="flex-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 relative">
              <div className="text-xs text-yellow-600 uppercase tracking-wide mb-3">Receipt Image</div>
              <div className="space-y-1.5 text-sm text-gray-700 font-mono">
                <div>HOME DEPOT #4521</div>
                <div>123 Main St, Dallas TX</div>
                <div className="border-t border-dashed border-yellow-300 my-2" />
                <div>3/4" Copper Pipe.....$42.50</div>
                <div>Flux (8oz)..........$12.99</div>
                <div>Silver Solder.......$18.49</div>
                <div>Pipe Fittings (6)...$113.45</div>
                <div className="border-t border-dashed border-yellow-300 my-2" />
                <div>Subtotal: $187.43</div>
                <div>Tax: $15.93</div>
                <div className="font-bold">Total: $203.36</div>
              </div>

              {/* Scan overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-cbre-green/20 to-transparent rounded-lg"
                initial={{ y: "-100%" }}
                animate={inView ? { y: "200%" } : {}}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              <svg className="w-8 h-8 text-cbre-green rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
          </div>

          {/* Extracted Form */}
          <div className="flex-1">
            <div className="bg-cbre-light border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">fmPilot Invoice</div>
              <div className="space-y-2">
                {receiptFields.map((field, i) => (
                  <motion.div
                    key={field.label}
                    className="flex justify-between text-sm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 2.0 + i * 0.12 }}
                  >
                    <span className="text-gray-500">{field.label}</span>
                    <span className="font-medium text-cbre-dark">{field.value}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-4 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 2.8 }}
              >
                <div className="bg-cbre-green text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  Invoice Created
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 3.0 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-cbre-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Auto-reschedules when parts ship
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create GpsTimecard demo**

Create `src/components/demos/GpsTimecard.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const timecardEntries = [
  { time: "7:00 AM", location: "Home", type: "Commute Start", exempt: true },
  { time: "7:45 AM", location: "Site A - Dallas", type: "Clock In", exempt: false },
  { time: "12:00 PM", location: "Site A - Dallas", type: "Lunch", exempt: false },
  { time: "12:30 PM", location: "Site B - Plano", type: "Travel", exempt: false },
  { time: "1:00 PM", location: "Site B - Plano", type: "Clock In", exempt: false },
  { time: "5:00 PM", location: "Site B - Plano", type: "Clock Out", exempt: false },
];

const stateBadges = [
  { state: "TX", rule: "No commute pay required" },
  { state: "CA", rule: "OT after 8hrs/day" },
  { state: "NY", rule: "Spread-of-hours pay" },
];

export default function GpsTimecard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide">GPS Timecard Validation</div>
        <div className="font-semibold text-cbre-dark">Mike Johnson — April 10, 2026</div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map placeholder */}
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-4 h-full min-h-[200px] relative">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">GPS Route</div>

              {/* Simulated map with route */}
              <svg className="w-full h-40" viewBox="0 0 300 150">
                {/* Route line */}
                <motion.path
                  d="M 30 120 Q 80 100 120 70 T 200 50 T 270 80"
                  fill="none"
                  stroke="#006A4E"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2, delay: 0.5 }}
                />

                {/* Location pins */}
                {[
                  { cx: 30, cy: 120, label: "Home" },
                  { cx: 120, cy: 70, label: "Site A" },
                  { cx: 270, cy: 80, label: "Site B" },
                ].map((pin, i) => (
                  <motion.g
                    key={pin.label}
                    initial={{ opacity: 0, y: -10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8 + i * 0.3 }}
                  >
                    <circle cx={pin.cx} cy={pin.cy} r="8" fill="#006A4E" />
                    <circle cx={pin.cx} cy={pin.cy} r="4" fill="white" />
                    <text x={pin.cx} y={pin.cy - 14} textAnchor="middle" fontSize="10" fill="#333">
                      {pin.label}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </div>

          {/* Timecard entries */}
          <div className="flex-1 space-y-2">
            {timecardEntries.map((entry, i) => (
              <motion.div
                key={i}
                className={`flex items-center justify-between p-2 rounded-md text-sm ${
                  entry.exempt ? "bg-amber-50 border border-amber-200" : "bg-cbre-light"
                }`}
                initial={{ opacity: 0, x: 10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.12 }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-16">{entry.time}</span>
                  <span className="text-cbre-dark">{entry.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{entry.type}</span>
                  {entry.exempt && (
                    <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                      Exempt
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* State Law Badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          {stateBadges.map((badge, i) => (
            <motion.div
              key={badge.state}
              className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.5 + i * 0.15 }}
            >
              <span className="font-bold text-indigo-700 text-xs">{badge.state}</span>
              <span className="text-xs text-indigo-600">{badge.rule}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-green-50 border-t border-green-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2 }}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validated — Ready for Payroll
          </div>
          <span className="text-green-600 font-mono">8.25 hrs billable</span>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Create FieldOpsWeb demo**

Create `src/components/demos/FieldOpsWeb.tsx`:
```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { label: "Dashboard", desc: "Real-time ops overview", icon: "grid" },
  { label: "Work Orders", desc: "Full lifecycle management", icon: "clipboard" },
  { label: "Reporting", desc: "Custom analytics & exports", icon: "chart" },
  { label: "Scheduling", desc: "Crew & resource planning", icon: "calendar" },
];

export default function FieldOpsWeb() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200">
          fieldops.cbre.com
        </div>
      </div>

      {/* App Mockup */}
      <div className="p-4">
        {/* App Header */}
        <motion.div
          className="bg-cbre-dark rounded-t-lg p-3 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cbre-green rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="text-white text-sm font-semibold">FieldOps</span>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-2 bg-gray-600 rounded" />
            <div className="w-16 h-2 bg-gray-600 rounded" />
            <div className="w-16 h-2 bg-gray-600 rounded" />
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="bg-cbre-light rounded-b-lg p-4 border border-t-0 border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                className="bg-white rounded-lg p-3 border border-gray-200 relative"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
              >
                <div className="font-medium text-sm text-cbre-dark">{feature.label}</div>
                <div className="text-xs text-gray-500 mt-1">{feature.desc}</div>

                {/* Simulated chart/content placeholder */}
                <div className="mt-3 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 bg-cbre-green/20 rounded-sm"
                      style={{ height: `${20 + Math.random() * 30}px` }}
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : {}}
                      transition={{ delay: 1.0 + i * 0.15 + j * 0.05 }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-cbre-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Built in-house by the Automations team
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/ReceiptExtraction.tsx src/components/demos/GpsTimecard.tsx src/components/demos/FieldOpsWeb.tsx
git commit -m "feat: add ReceiptExtraction, GpsTimecard, and FieldOpsWeb demo components"
```

---

### Task 11: Assemble Main Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the main page**

Replace `src/app/page.tsx` with:
```tsx
import Hero from "@/components/Hero";
import MetricsBar from "@/components/MetricsBar";
import CapabilitySection from "@/components/CapabilitySection";
import Footer from "@/components/Footer";
import { capabilities } from "@/data/capabilities";

import InvoiceValidation from "@/components/demos/InvoiceValidation";
import PhotoCount from "@/components/demos/PhotoCount";
import IvrAccuracy from "@/components/demos/IvrAccuracy";
import PhotoScanning from "@/components/demos/PhotoScanning";
import PhotoValidation from "@/components/demos/PhotoValidation";
import DataPipeline from "@/components/demos/DataPipeline";
import ReceiptExtraction from "@/components/demos/ReceiptExtraction";
import GpsTimecard from "@/components/demos/GpsTimecard";
import FieldOpsWeb from "@/components/demos/FieldOpsWeb";

const demoComponents: Record<string, React.ComponentType> = {
  "invoice-validation": InvoiceValidation,
  "photo-count": PhotoCount,
  "ivr-accuracy": IvrAccuracy,
  "photo-scanning": PhotoScanning,
  "photo-validation": PhotoValidation,
  "data-pipeline": DataPipeline,
  "receipt-extraction": ReceiptExtraction,
  "gps-timecard": GpsTimecard,
  "fieldops-web": FieldOpsWeb,
};

export default function Home() {
  return (
    <>
      <Hero />
      <MetricsBar />
      {capabilities.map((cap, index) => {
        const DemoComponent = demoComponents[cap.demoKey];
        return (
          <CapabilitySection key={cap.id} capability={cap} index={index}>
            {DemoComponent ? <DemoComponent /> : null}
          </CapabilitySection>
        );
      })}
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds. `out/` directory contains `index.html` and all static assets.

- [ ] **Step 3: Verify dev server**

Run:
```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Verify:
- Hero section renders with animated background and CTA button
- Metrics bar counts up on scroll
- All 9 capability sections render with alternating layouts
- Animations trigger on scroll into view
- Sticky nav highlights the active section
- Footer renders at bottom
- Mobile hamburger menu works on narrow viewport

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble main page with all sections and demo components"
```

---

### Task 12: Push to GitHub

**Files:** None -- git operations only.

- [ ] **Step 1: Add remote**

```bash
git remote add origin https://github.com/joshmeyercbre/intelligent-automation-studio.git
```

If remote already exists, skip this step.

- [ ] **Step 2: Push to main**

```bash
git branch -M main
git push -u origin main
```

Expected: All commits pushed to GitHub repository.

- [ ] **Step 3: Verify**

Open https://github.com/joshmeyercbre/intelligent-automation-studio in a browser and confirm all files are present.
