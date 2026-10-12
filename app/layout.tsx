import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sileo";
import NavbarVisibility from "@/src/components/providers/NavbarVisibility";
import LenisProvider from "@/src/components/providers/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DM = DM_Sans({
  variable: "--font-Dm",
  subsets: ["latin"],
});

const SITE_URL = "https://eliascphoto.art";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "EliasCPhoto | Color Grading y Edición de Video",

  description:
    "Aprendé color grading y edición de video con EliasCPhoto. Asesorías 1 a 1 para mejorar el color y llevar tus fotos y videos a otro nivel.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "EliasCPhoto",
    title: "EliasCPhoto | Color Grading y Edición de Video",
    description: "Aprendé color grading y edición de video con EliasCPhoto.",
    locale: "es_AR",
  },

  icons: {
    icon: [
      {
        url: "/fav/favicon.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/fav/favIconL.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/fav/favIconD.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/fav/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${DM.variable} antialiased h-full scrollbar-none!`}
    >
      <body className="h-full flex flex-col w-full relative">
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
        <LenisProvider>
          <div className="w-full">
            <NavbarVisibility />
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
