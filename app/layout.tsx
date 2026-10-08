import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sileo";
import Navbar from "@/src/components/molecules/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELIASCPHOTO",
  description: "",
  icons: {
    icon: "/logo/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased h-full scrollbar-none!`}
    >
      <body className="h-full flex flex-col ">
        <Toaster
          position="top-center"
          options={{
            fill: "#111",
            roundness: 16,
            styles: {
              title: "text-white!",
              description: "text-white/75!",
              badge: "bg-white/10!",
              button: "bg-white/10! hover:bg-white/15!",
            },
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
