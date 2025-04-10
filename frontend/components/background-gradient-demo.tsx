"use client";
import React from "react";
import { BackgroundGradient } from "./ui/background-gradient";
import Image from "next/image";

export default function BackgroundGradientDemo() {
  return (
    <div>
      <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
        <Image
          src={`/img/demo-product.jpg`}
          alt="Demo Product"
          height="400"
          width="400"
          className="object-contain"
        />
        <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
          Produit Vitrine Premium
        </p>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Notre produit phare avec des finitions de qualité supérieure et une garantie de 2 ans. Disponible en plusieurs coloris et livré avec tous les accessoires nécessaires.
        </p>
        <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
          <span>Acheter maintenant </span>
          <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
            35 000 FCFA
          </span>
        </button>
      </BackgroundGradient>
    </div>
  );
} 