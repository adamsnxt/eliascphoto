"use client";

import { getLinkPreview, LinkPreview } from "@/src/actions/GetLinkPreview";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  {
    link: "https://spektrafilm.114c.de",
    snap: "/spektraSnapShot.jpg",
  },
];

interface ToolCardProps {
  snap: string;
  url: string;
  preview?: LinkPreview;
}

function ToolCard({ snap, url, preview }: ToolCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const finalImage = preview?.image;

  useEffect(() => {
    setImageLoaded(false);
  }, [finalImage]);

  return (
    <Link
      href={preview?.url ?? url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <div
        className="
          relative
          w-full
          aspect-video
          overflow-hidden
          rounded-2xl
          bg-background
          shadow-[0_0_10px_0px_rgba(0,0,0,0.3)]
          cursor-pointer
        "
      >
        {/* Snapshot: siempre permanece debajo */}
        <img
          src={snap}
          alt=""
          aria-hidden="true"
          className="
            absolute inset-0
            h-full w-full
            object-cover
          "
        />

        {/* Imagen definitiva: aparece cuando terminó de cargar */}
        {finalImage && (
          <motion.img
            key={finalImage}
            src={finalImage}
            alt={preview?.description ?? preview?.title ?? ""}
            initial={{
              opacity: 0,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: imageLoaded ? 1 : 0,
              filter: imageLoaded ? "blur(0px)" : "blur(6px)",
            }}
            transition={{
              opacity: {
                duration: 0.65,
                ease: "easeInOut",
              },
              filter: {
                duration: 0.65,
                ease: "easeOut",
              },
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
            className="
              absolute inset-0
              h-full w-full
              object-cover
            "
          />
        )}

        {/* Información: aparece cuando llega la preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
            }}
            className="
              absolute inset-x-0 top-0 z-10
              p-5
              text-white
              pointer-events-none
              bg-linear-to-b
              from-black/60
              to-transparent
            "
          >
            <p className="text-xl font-bold capitalize truncate">
              {preview.title}
            </p>
          </motion.div>
        )}
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  const [links, setLinks] = useState<Record<string, LinkPreview>>({});

  useEffect(() => {
    let active = true;

    const loadLinks = async () => {
      await Promise.all(
        LINKS.map(async ({ link }) => {
          try {
            const result = await getLinkPreview(link);

            if (!active || !result) return;

            setLinks((prev) => ({
              ...prev,
              [link]: result,
            }));
          } catch (error) {
            console.error("Error loading preview:", error);
          }
        }),
      );
    };

    void loadLinks();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="
        grid grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-3 md:gap-5
        p-3 md:p-5
      "
    >
      {LINKS.map(({ link, snap }) => (
        <ToolCard key={link} url={link} snap={snap} preview={links[link]} />
      ))}
    </div>
  );
}
