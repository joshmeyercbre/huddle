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
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Work Order</div>
            <div className="font-semibold text-cbre-dark">WO-2026-18432</div>
          </div>
          <div className="text-sm text-gray-500">8 Photos Required</div>
        </div>
      </div>

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
