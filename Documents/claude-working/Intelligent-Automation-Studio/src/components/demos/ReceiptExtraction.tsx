"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const receiptFields = [
  { label: "Vendor", value: "Home Depot" },
  { label: "Date", value: "04/08/2026" },
  { label: "Items", value: "3/4\" Copper Pipe, Flux, Solder" },
  { label: "Amount", value: "$187.43" },
  { label: "Tax", value: "$15.93" },
  { label: "Total", value: "$203.36" },
];

const woTypes = ["PM", "Quote", "Reactive"];

export default function ReceiptExtraction() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Gemini AI Extraction</div>
            <div className="font-semibold text-cbre-dark">Receipt to Invoice</div>
          </div>
          <div className="flex gap-1">
            {woTypes.map((type, i) => (
              <motion.span
                key={type}
                className="text-xs bg-cbre-green/10 text-cbre-green px-2 py-0.5 rounded-full"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 relative">
              <div className="text-xs text-yellow-600 uppercase tracking-wide mb-3">Receipt Image</div>
              <div className="space-y-1.5 text-sm text-gray-700 font-mono">
                <div>HOME DEPOT #4521</div>
                <div>123 Main St, Dallas TX</div>
                <div className="border-t border-dashed border-yellow-300 my-2" />
                <div>3/4&quot; Copper Pipe.....$42.50</div>
                <div>Flux (8oz)..........$12.99</div>
                <div>Silver Solder.......$18.49</div>
                <div>Pipe Fittings (6)...$113.45</div>
                <div className="border-t border-dashed border-yellow-300 my-2" />
                <div>Subtotal: $187.43</div>
                <div>Tax: $15.93</div>
                <div className="font-bold">Total: $203.36</div>
              </div>

              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-cbre-green/20 to-transparent rounded-lg"
                initial={{ y: "-100%" }}
                animate={inView ? { y: "200%" } : {}}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              <svg className="w-8 h-8 text-cbre-green rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
          </div>

          <div className="flex-1">
            <div className="bg-cbre-light border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">fmPilot Invoice</div>
              <div className="space-y-2">
                {receiptFields.map((field, i) => (
                  <motion.div
                    key={field.label}
                    className="flex justify-between text-sm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 2.0 + i * 0.12 }}
                  >
                    <span className="text-gray-500">{field.label}</span>
                    <span className="font-medium text-cbre-dark">{field.value}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-4 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 2.8 }}
              >
                <div className="bg-cbre-green text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  Invoice Created
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 3.0 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-cbre-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Auto-reschedules when parts ship
        </div>
      </motion.div>
    </div>
  );
}
