"use client";

import ImageComparison from "@/src/components/molecules/ImageComparison";
import Glow from "../atoms/Glow";
import Link from "next/link";
import hero from "./../../data/Hero.json";
import { FaWhatsapp } from "react-icons/fa";

const comparisons = [
  {
    id: "log-rec709",
    title: "Paso 1. De Log a Rec.709",
    description:
      "Una imagen grabada en Log está pensada para darte margen de trabajo, no para verse terminada directamente. En esta etapa transformamos esa imagen plana en una base con contraste y color, preparada para seguir trabajando.",
    originalSrc: "/comparisonExamples/1/s.log.jpeg",
    editedSrc: "/comparisonExamples/1/REC709.jpeg",
    originalLabel: "ORIGINAL · LOG",
    editedLabel: "REC.709",
    button: false,
  },
  {
    id: "lookF",
    title: "Paso 2. De Rec.709 a Look final",
    description:
      "Con una base equilibrada, empezamos a darle personalidad a la imagen. Buscamos una intención visual mediante el color, el contraste y las relaciones entre tonos, procurando que cada decisión tenga sentido dentro de la escena.**Un detalle:** el look final no significa necesariamente que el proceso haya terminado.",
    originalSrc: "/comparisonExamples/1/REC709.jpeg",
    editedSrc: "/comparisonExamples/1/Look Final.jpeg",
    originalLabel: "REC.709",
    editedLabel: "LOOK FINAL",
    button: true,
  },
  {
    id: "Ofx",
    title: "Paso 3. De Look final a OFX",
    description:
      "Esta etapa es opcional. En este ejemplo utilicé un efecto de *Bloom* para llevar la imagen hacia una sensación más fantástica, alejada de una representación estrictamente realista. Los efectos no están para agregarlos porque sí: tienen sentido cuando refuerzan lo que queremos transmitir. En este caso, es el último paso de mi proceso.",
    originalSrc: "/comparisonExamples/1/Look Final.jpeg",
    editedSrc: "/comparisonExamples/1/BlackMist.jpeg",
    originalLabel: "LOOK FINAL",
    editedLabel: "OFX",
    button: false,
  },
];

export const ConsultingServices = () => {
  return (
    <section className="flex min-h-dvh w-full flex-col items-center justify-start gap-10 p-3 pt-0 relative">
      <header className="flex flex-col items-center justify-center text-center">
        <h1 className="font-dm text-4xl font-bold sm:text-5xl">
          APRENDE CONMIGO
        </h1>

        <p className="font-dm text-foreground/60 max-w-152">
          No aprenderas a obtener un resultado determinado, aprenderas a
          entender como llegar a el y porque cada rueda o dial que mueves genera
          su respectivo resultado.
        </p>
        <p className="font-bold top-1/2 left-24 text-primary animate-pulse text-sm">
          QUE DIVERTIDOOOO!!!
        </p>
      </header>

      <div className="flex w-full max-w-7xl flex-col">
        {comparisons.map((comparison, index) => (
          <div
            key={comparison.id}
            className={`flex w-full items-center border-t border-t-foreground/10 py-6 sm:py-8 ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <ImageComparison {...comparison} />
          </div>
        ))}
      </div>
      <div className="w-full  max-w-7xl rounded-4xl bg-flagGradient relative overflow-hidden p-10 flex flex-col justify-center items-center gap-5 dark:shadow-[0_0_10px_rgba(0,0,0,0.8)] shadow-[0_0_10px_rgba(0,0,0,0.3)] text-white">
        <Glow enter={false} />
        <div className="relative z-10 flex flex-col justify-center items-center">
          <h1 className="font-dm text-4xl font-bold sm:text-5xl">
            Una aclaración
          </h1>
          <p className="max-w-150 text-center">
            Este proceso no pretende establecer reglas inquebrantables de
            edición. Es una forma de trabajar que fui construyendo y que quiero
            compartir para que puedas entender cada etapa, explorar tus propias
            decisiones y desarrollar tu criterio.
            <br />
            Tanto si estás empezando como si ya tenés experiencia, tomalo como
            una guía, no como una fórmula que tengas que seguir al pie de la
            letra.
          </p>
        </div>
        <Link
          href={hero.cta.buy.link}
          className="p-3 px-6 bg-primary rounded-3xl w-fit h-fit cursor-pointer flex justify-center items-center gap-3 text-base shadow-[0_0px_14px_var(--primary)] relative z-20"
        >
          Saber más <FaWhatsapp />
        </Link>
      </div>
    </section>
  );
};
