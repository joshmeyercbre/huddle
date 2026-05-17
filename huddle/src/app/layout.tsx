import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huddle",
  description: "Private 1-on-1 meeting agendas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-cbre-green-light min-h-screen">
        {children}
      </body>
    </html>
  );
}
