"use client";
import React from "react";
import { BackgroundGradient } from "./background-gradient";
import { FiStar } from "react-icons/fi/index.js";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  location: string;
  testimonial: string;
  rating: number;
  imageSrc?: string;
  imgAlt?: string;
  initials?: string;
}

export default function TestimonialCard({
  name,
  location,
  testimonial,
  rating = 5,
  imageSrc,
  imgAlt,
  initials
}: TestimonialCardProps) {
  return (
    <BackgroundGradient className="rounded-[22px]">
      <div className="flex items-center mb-3 sm:mb-4 md:mb-6 relative z-20">
        <div className="mr-3 md:mr-4">
          {imageSrc ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
              <Image
                src={imageSrc}
                alt={imgAlt || name}
                height="48"
                width="48"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg">
              {initials || name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{location}</p>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-white mb-3 sm:mb-4 md:mb-6 relative z-20 font-medium">
        "{testimonial}"
      </p>
      
      <div className="flex relative z-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar 
            key={i} 
            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    </BackgroundGradient>
  );
} 