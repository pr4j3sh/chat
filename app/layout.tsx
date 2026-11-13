import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "4j3",
  description: "Leave me a message. It'll land straight in my inbox.",
  openGraph: {
    title: "4j3",
    description: "Leave me a message. It'll land straight in my inbox.",
    siteName: "4j3",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "4j3",
    description: "Leave me a message. It'll land straight in my inbox.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#0a0a0a] text-zinc-100 overflow-hidden">
        <MotionConfig reducedMotion="user">
          <Cursor />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
