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
  title: "EliasCPhoto | Color Grading y Edición de Video",
  description:
    "Aprendé color grading y edición de video con EliasCPhoto. Asesorías 1 a 1 para mejorar el color y llevar tus fotos y videos a otro nivel.",
  icons: {
    icon: [
      {
        url: "/fav/favIconL.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/fav/favIconD.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
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
