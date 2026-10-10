"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageComparisonProps {
  title: string;
  description: string;
  originalSrc: string;
  editedSrc: string;
  originalLabel?: string;
  editedLabel?: string;
}

export default function ImageComparison({
  title,
  description,
  originalSrc,
  editedSrc,
  originalLabel = "ORIGINAL · LOG",
  editedLabel = "REC.709",
}: ImageComparisonProps) {
  const [position, setPosition] = useState(50);

  return (
    <article className="flex w-full max-w-6xl flex-col gap-5 font-dm">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>

      <div className="relative aspect-video w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-foreground/10">
        {/* Imagen original: capa inferior */}
        <Image
          src={editedSrc}
          alt={originalLabel}
          width={1980}
          height={1080}
          draggable={false}
          className="pointer-events-none object-cover"
        />

        {/* Imagen editada: capa superior recortada */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        >
          <Image
            src={originalSrc}
            alt={editedLabel}
            width={1980}
            height={1080}
            draggable={false}
            className="pointer-events-none object-cover"
          />
        </div>

        {/* Etiquetas */}
        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md sm:left-5 sm:top-5 sm:text-sm">
          {originalLabel}
        </span>

        <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md sm:bottom-5 sm:right-5 sm:text-sm">
          {editedLabel}
        </span>

        {/* Divisor */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/50 shadow-lg backdrop-blur-md">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m8 5-5 7 5 7" />
              <path d="m16 5 5 7-5 7" />
            </svg>
          </div>
        </div>

        {/* Control interactivo: ratón, táctil y teclado */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={`Comparar imagen original y editada: ${title}`}
          aria-valuetext={`${Math.round(position)}% de imagen editada visible`}
          className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <p className="text-sm leading-relaxed text-foreground/70 sm:text-base whitespace-pre-line">
        {description}
      </p>
    </article>
  );
}
