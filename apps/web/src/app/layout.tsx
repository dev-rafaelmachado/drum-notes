import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drum Notes",
  description: "A drum-notation editor focused on simplicity and speed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
