import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snake Arena",
  description: "Snake game built with Next.js, shadcn style, and Framer Motion"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
