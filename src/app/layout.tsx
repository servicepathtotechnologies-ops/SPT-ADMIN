import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin CRM | SPT",
  description: "Admin panel for tracking leads and demos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
