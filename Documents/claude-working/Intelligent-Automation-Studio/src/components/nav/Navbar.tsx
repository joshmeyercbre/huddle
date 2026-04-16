"use client";

import { useState, useEffect } from "react";
import { capabilities } from "@/data/capabilities";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    capabilities.forEach((cap) => {
      const el = document.getElementById(cap.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(cap.id);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-cbre-green rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-cbre-dark text-sm hidden sm:block">
              Intelligent Automation Studio
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                onClick={() => scrollTo(cap.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeSection === cap.id
                    ? "bg-cbre-green text-white"
                    : "text-cbre-dark hover:bg-cbre-light"
                }`}
              >
                {cap.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-cbre-light"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pb-4">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => scrollTo(cap.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                activeSection === cap.id
                  ? "bg-cbre-green text-white"
                  : "text-cbre-dark hover:bg-cbre-light"
              }`}
            >
              {cap.title}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
