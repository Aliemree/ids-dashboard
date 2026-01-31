import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDS Dashboard",
  description: "Network Intrusion Detection System with ML-based anomaly detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
