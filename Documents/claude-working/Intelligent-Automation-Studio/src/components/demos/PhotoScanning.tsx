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
          <div className="relative w-full sm:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">HVAC Unit Photo</span>
              </div>
            </div>

            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-cbre-green/30 to-transparent"
              initial={{ y: "-100%" }}
              animate={inView ? { y: "200%" } : {}}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute top-2 left-2 bg-cbre-green text-white text-xs px-2 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              AI Scanned
            </motion.div>
          </div>

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
