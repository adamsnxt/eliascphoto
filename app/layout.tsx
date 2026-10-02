import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sileo";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-screen antialiased`}
    >
      <body className="h-full flex flex-col">
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
        {children}
      </body>
    </html>
  );
}
