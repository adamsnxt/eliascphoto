"use client";

import { getLinkPreview, LinkPreview } from "@/src/actions/GetLinkPreview";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = ["https://spektrafilm.114c.de"];

function ToolCard({ link }: { link: LinkPreview }) {
  return (
    <Link href={link.url} target="_blank" rel="noopener noreferrer">
      <motion.div
        className="
          w-full
          rounded-2xl
          relative
          shadow-[0_0_10px_0px_rgba(0,0,0,0.3)]
          bg-background
          flex
          flex-col
          overflow-hidden
          cursor-pointer
        "
        initial={{
          opacity: 0,
          filter: "blur(12px)",
          scale: 1.01,
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      >
        <motion.p
          className="
            text-xl
            capitalize
            absolute
            top-0
            left-0
            z-10
            w-full
            p-5
            backdrop-blur
            mask-[linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]
            font-bold
            truncate
            pointer-events-none
          "
          animate={{
            color: "#fff",
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {link.title}
        </motion.p>

        {link.image && (
          <img
            src={link.image}
            alt={link.description ?? link.title ?? ""}
            className="w-full aspect-video object-cover"
          />
        )}
      </motion.div>
    </Link>
  );
}

function ToolSkeleton() {
  return (
    <motion.div
      className="
        w-full
        rounded-2xl
        relative
        shadow-[0_0_10px_0px_rgba(0,0,0,0.3)]
        bg-background
        flex
        flex-col
        overflow-hidden
      "
      initial={{
        opacity: 0,
        filter: "blur(20px)",
        scale: 1.02,
      }}
      animate={{
        opacity: 1,
        filter: "blur(12px)",
        scale: 1.01,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <img
        src="/skeletonLoading.png"
        alt=""
        className="
          w-full
          aspect-video
          object-cover
        "
      />
    </motion.div>
  );
}

export default function ToolsPage() {
  const [links, setLinks] = useState<LinkPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLinks = async () => {
      const results = await Promise.all(
        LINKS.map((link) => getLinkPreview(link)),
      );

      setLinks(results.filter((link): link is LinkPreview => link !== null));

      setLoading(false);
    };

    loadLinks();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-3 md:p-5 gap-3 md:gap-5">
      {loading
        ? LINKS.map((_, index) => <ToolSkeleton key={index} />)
        : links.map((link) => <ToolCard key={link.url} link={link} />)}
    </div>
  );
}
