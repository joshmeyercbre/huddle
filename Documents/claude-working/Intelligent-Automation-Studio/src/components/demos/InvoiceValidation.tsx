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
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Invoice</div>
            <div className="font-semibold text-cbre-dark">INV-2026-4821</div>
          </div>
          <div className="text-xs text-gray-400">Automated Validation</div>
        </div>
      </div>

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
