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
