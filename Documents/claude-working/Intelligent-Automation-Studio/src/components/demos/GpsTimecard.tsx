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
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-4 h-full min-h-[200px] relative">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">GPS Route</div>

              <svg className="w-full h-40" viewBox="0 0 300 150">
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
