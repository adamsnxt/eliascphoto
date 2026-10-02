"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GoArrowUpRight } from "react-icons/go";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="z-20 w-[calc(100%-2rem)] max-w-3xl h-16 sm:h-20 sticky top-3 sm:top-5 flex justify-between px-3 sm:px-5 py-2 sm:p-3 items-center bg-background shadow-md rounded-2xl sm:rounded-3xl">
      <div className="flex shrink-0 justify-center items-center h-full aspect-square">
        <Image
          src="/logo/logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="h-full w-auto object-contain"
        />
      </div>
      <div className="hidden sm:flex flex-1 justify-around text-base md:text-xl">
        <p className="p-2 px-4 shadow-[inset_0_2px_4px_rgba(205,192,180)] rounded-2xl">
          Proyectos
        </p>
        <p className="p-2 px-4 rounded-xl">Sobre mí</p>
        <p className="p-2 px-4 rounded-xl">Contacto</p>
      </div>
      <button className="hidden sm:flex p-2 px-4 bg-primary rounded-3xl w-fit h-fit cursor-pointer justify-center items-center gap-2 text-sm shadow">
        Turnos <GoArrowUpRight />
      </button>
      <button
        type="button"
        className="sm:hidden p-2 rounded-xl hover:bg-white/10"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
      </button>
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute top-[calc(100%+0.5rem)] left-0 right-0 flex flex-col gap-1 p-3 bg-background shadow-md rounded-2xl sm:hidden"
        >
          <a href="#proyectos" onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-white/10">Proyectos</a>
          <a href="#sobre-mi" onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-white/10">Sobre mí</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-white/10">Contacto</a>
          <a href="#turnos" onClick={() => setMenuOpen(false)} className="p-3 bg-primary rounded-xl flex items-center justify-center gap-2">Turnos <GoArrowUpRight /></a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
