"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { label: "Created", status: "complete" as const },
  { label: "Dispatched", status: "complete" as const },
  { label: "In Progress", status: "complete" as const },
  { label: "Review", status: "active" as const },
  { label: "Invoiced", status: "pending" as const },
  { label: "Closed", status: "pending" as const },
];

const clients = [
  { name: "Client A", workflows: 12, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Client B", workflows: 8, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Client C", workflows: 15, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { name: "Client D", workflows: 16, color: "bg-green-100 text-green-700 border-green-200" },
];

const statusStyle = {
  complete: "bg-cbre-green text-white",
  active: "bg-cbre-green-light text-white ring-2 ring-cbre-green-light/30",
  pending: "bg-gray-200 text-gray-500",
};

const lineStyle = {
  complete: "bg-cbre-green",
  active: "bg-gray-300",
  pending: "bg-gray-200",
};

export default function WoLifecycle() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Lifecycle Automation</div>
            <div className="font-semibold text-cbre-dark">Work Order Pipeline</div>
          </div>
          <div className="text-xs text-gray-400">51+ Workflows Active</div>
        </div>
      </div>

      <div className="p-6">
        {/* Lifecycle Stages */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Status Pipeline</div>
          <div className="flex items-center gap-1">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                className="flex items-center flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
              >
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${statusStyle[stage.status]}`}
                  >
                    {stage.status === "complete" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 text-center leading-tight">{stage.label}</span>
                </div>
                {i < stages.length - 1 && (
                  <motion.div
                    className={`h-1 flex-1 rounded-full -mt-4 ${lineStyle[stage.status]}`}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Client Workflows */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Client Rule Sets</div>
          <div className="grid grid-cols-2 gap-3">
            {clients.map((client, i) => (
              <motion.div
                key={client.name}
                className={`rounded-lg border p-3 ${client.color}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.0 + i * 0.1 }}
              >
                <div className="font-medium text-sm">{client.name}</div>
                <div className="text-xs mt-1 opacity-75">{client.workflows} workflows</div>
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
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Multi-tenant — independently configurable per client
        </div>
      </motion.div>
    </div>
  );
}
