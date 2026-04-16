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
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden border border-gray-200">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>

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
