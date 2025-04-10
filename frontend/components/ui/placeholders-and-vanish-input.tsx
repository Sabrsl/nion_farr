"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch } from "react-icons/fi/index.js";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function PlaceholdersAndVanishInput({
  variant = "default",
  value = "",
  onChange,
  onSubmit,
  placeholders = [],
}: {
  variant?: "default" | "hero";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholders?: string[];
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
    } else {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange, startAnimation]);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const text = placeholders[currentPlaceholder];
    const fontSize = variant === "hero" ? 24 : 16;
    ctx.font = `${fontSize}px system-ui`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const textWidth = ctx.measureText(text).width;
    canvas.width = textWidth;
    canvas.height = fontSize * 1.5;

    ctx.font = `${fontSize}px system-ui`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(text, 0, canvas.height / 2);
  }, [currentPlaceholder, placeholders, variant]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit && onSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit && onSubmit(e);
  };

  const formClasses = cn(
    "w-full relative mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden transition duration-200",
    variant === "hero"
      ? "h-10 sm:h-12 shadow-lg"
      : "h-9 sm:h-10 shadow-md",
    value && "bg-white/20"
  );

  const inputClasses = cn(
    "w-full relative z-50 border-none bg-transparent text-white h-full rounded-xl focus:outline-none focus:ring-0",
    variant === "hero" ? "pl-10 text-sm sm:text-base" : "pl-8 text-sm",
    "pr-10",
    animating && "text-transparent"
  );

  return (
    <form className={formClasses} onSubmit={handleSubmit}>
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
        <FiSearch className={cn("text-white/60", variant === "hero" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4")} />
      </div>

      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20",
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (!animating) {
            onChange && onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        placeholder={placeholders[currentPlaceholder]}
        className={inputClasses}
      />

      <button
        type="submit"
        disabled={!value}
        className={cn(
          "absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-lg disabled:bg-white/10 bg-white/20 hover:bg-white/30 transition duration-200 flex items-center justify-center",
          variant === "hero" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-5 w-5 sm:h-6 sm:w-6"
        )}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-white/80", variant === "hero" ? "h-3 w-3 sm:h-4 sm:w-4" : "h-3 w-3")}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      <div className="absolute inset-0 flex items-center rounded-xl pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className={cn(
                "text-white/60 font-normal pl-10 text-left w-[calc(100%-2rem)] truncate",
                variant === "hero" ? "text-sm sm:text-base" : "text-sm"
              )}
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}