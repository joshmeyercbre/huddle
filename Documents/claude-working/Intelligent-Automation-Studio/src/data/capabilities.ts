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
  { value: 51, suffix: "+", label: "Automated Workflows" },
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
    id: "wo-lifecycle",
    title: "Work Order Lifecycle Automation",
    description:
      "With 51+ automated workflows, our platform manages the full work order lifecycle \u2014 from creation through completion \u2014 across multiple clients and service lines. Each client receives tailored automation without requiring separate infrastructure.",
    metric: { value: "51+", label: "Automated Workflows" },
    features: [
      "Automated status transitions and field updates",
      "Vendor penalty enforcement",
      "Client-specific business rules (multi-tenant)",
      "Real-time email notifications",
    ],
    demoKey: "wo-lifecycle",
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
    title: "AI-Powered Quality Assurance",
    description:
      "Our AI vision system automatically analyzes vendor-submitted photos to verify work completion, assess quality, and detect duplicate or fraudulent image submissions. Triggered in real time via webhook integrations, the system flags issues before they reach billing.",
    metric: { value: "Real-Time", label: "Fraud Detection & QA" },
    features: [
      "Work completion verification via photo analysis",
      "Duplicate and fraudulent image detection",
      "Real-time webhook-triggered processing",
      "Proactive flagging before billing",
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
