"use client";

import { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Capability } from "@/data/capabilities";

interface Props {
  capability: Capability;
  index: number;
  children: ReactNode;
}

export default function CapabilitySection({ capability, index, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 1;

  return (
    <section
      id={capability.id}
      ref={ref}
      className={`min-h-screen flex items-center py-20 ${
        isEven ? "bg-cbre-light" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`flex flex-col lg:flex-row items-center gap-12 ${
            isEven ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Text Side */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-cbre-dark mb-4">
              {capability.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6">{capability.description}</p>

            {/* Metric Badge */}
            <div className="inline-flex items-center gap-2 bg-cbre-green/10 border border-cbre-green/20 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl font-bold text-cbre-green">
                {capability.metric.value}
              </span>
              <span className="text-sm text-cbre-dark">{capability.metric.label}</span>
            </div>

            {/* Feature List */}
            <ul className="space-y-3">
              {capability.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-cbre-green mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Demo Side */}
          <motion.div
            className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
