import type { Metadata } from "next";
import Navbar from "@/components/nav/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intelligent Automation Studio | CBRE",
  description:
    "Explore CBRE's automation capabilities — from AI-powered invoice processing to GPS timecard validation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
