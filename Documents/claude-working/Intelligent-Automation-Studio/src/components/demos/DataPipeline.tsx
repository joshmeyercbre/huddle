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
