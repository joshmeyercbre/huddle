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
