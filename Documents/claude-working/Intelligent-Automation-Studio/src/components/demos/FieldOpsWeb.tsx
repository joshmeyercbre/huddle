"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { label: "Dashboard", desc: "Real-time ops overview" },
  { label: "Work Orders", desc: "Full lifecycle management" },
  { label: "Reporting", desc: "Custom analytics & exports" },
  { label: "Scheduling", desc: "Crew & resource planning" },
];

export default function FieldOpsWeb() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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

      <div className="p-4">
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
