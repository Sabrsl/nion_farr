"use client";
import React from "react";
import { SparklesCore } from "./sparkles";
import { motion } from "framer-motion";

export default function SparklesPreview() {
  // Logos de partenaires
  const partners = [
    { name: 'Stripe', logo: '/img/partners/Stripe.png' },
    { name: 'PayPal', logo: '/img/partners/paypal.png' },
    { name: 'Orange Money', logo: '/img/partners/om.png' },
    { name: 'Wave', logo: '/img/partners/wave.png' },
    // Répéter pour l'effet de défilement continu
    { name: 'Stripe', logo: '/img/partners/Stripe.png' },
    { name: 'PayPal', logo: '/img/partners/paypal.jpg' },
    { name: 'Orange Money', logo: '/img/partners/om.png' },
    { name: 'Wave', logo: '/img/partners/wave.png' },
  ];

  return (
    <div className="h-[20rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-5xl text-2xl lg:text-6xl font-bold text-center text-white relative z-20 mb-4">
        Ils nous font confiance
      </h1>
      <div className="w-full max-w-4xl h-28 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={800}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={2}
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
      
      {/* Logos en défilement */}
      <div className="w-full mt-2 px-4 relative z-10">
        {/* Dégradé à gauche */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-20"></div>
        
        {/* Dégradé à droite */}
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-20"></div>
        
        <div className="relative overflow-hidden mx-auto">
          <motion.div 
            className="flex items-center justify-center space-x-20 py-4"
            initial={{ x: 0 }}
            animate={{ x: [0, -1500] }}
            transition={{ 
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear"
            }}
          >
            {partners.map((partner, index) => (
              <div key={index} className="flex-shrink-0">
                <img 
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 w-auto object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 