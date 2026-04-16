"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const scrollToCapabilities = () => {
    document
      .getElementById("invoice-validation")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cbre-dark">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 50 40 M 50 60 L 50 100 M 0 50 L 40 50 M 60 50 L 100 50" stroke="#00A86B" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="3" fill="#00A86B" />
              <circle cx="0" cy="0" r="2" fill="#006A4E" />
              <circle cx="100" cy="0" r="2" fill="#006A4E" />
              <circle cx="0" cy="100" r="2" fill="#006A4E" />
              <circle cx="100" cy="100" r="2" fill="#006A4E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Floating animated dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cbre-green-light"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Intelligent Automation{" "}
          <span className="text-cbre-green-light">Studio</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Transforming manual processes into intelligent, automated workflows.
          Explore how the Automations team delivers measurable impact through
          AI-powered solutions.
        </motion.p>

        <motion.button
          onClick={scrollToCapabilities}
          className="inline-flex items-center gap-2 px-8 py-4 bg-cbre-green text-white font-semibold rounded-lg hover:bg-cbre-green-light transition-colors text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          See Our Capabilities
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
