"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

interface ConfettiProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  className?: string;
}

export const ConfettiParticle: React.FC<{
  color: string;
  size?: number;
  delay?: number;
}> = ({ color, size = 8, delay = 0 }) => {
  // Random initial position
  const x = Math.random() * 100 - 50; // -50 to 50
  const y = Math.random() * -10 - 10; // -20 to -10
  
  // Random animation parameters
  const xEnd = x + (Math.random() * 200 - 100); // End x with some drift
  const yEnd = window.innerHeight * (Math.random() * 0.4 + 0.6); // End y somewhere in lower half of screen
  const rotation = Math.random() * 720 - 360; // -360 to 360 degrees

  return (
    <motion.div
      initial={{ 
        x, 
        y, 
        rotate: 0, 
        opacity: 1 
      }}
      animate={{ 
        x: xEnd, 
        y: yEnd, 
        rotate: rotation, 
        opacity: 0 
      }}
      transition={{ 
        duration: 4 + Math.random() * 3, 
        ease: [0.23, 0.44, 0.75, 0.95],
        delay 
      }}
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "0%", // Random between circle and square
      }}
    />
  );
};

export const ConfettiEffect: React.FC<ConfettiProps> = ({
  active = false,
  duration = 3000,
  particleCount = 100,
  colors = ["#FF5252", "#FFD740", "#2196F3", "#69F0AE", "#9C27B0", "#00BCD4"],
  className,
}) => {
  const [isVisible, setIsVisible] = useState(active);
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      setParticles(Array.from({ length: particleCount }, (_, i) => i));
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [active, duration, particleCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed inset-0 pointer-events-none z-50 overflow-hidden",
            className
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {particles.map((id) => (
            <ConfettiParticle
              key={id}
              color={colors[id % colors.length]}
              size={Math.floor(Math.random() * 8) + 5} // Random size between 5-12px
              delay={Math.random() * 2} // Random delay up to 2 seconds
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Handy wrapper to create a button that triggers confetti
export const ConfettiButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    if (onClick) onClick();
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  return (
    <>
      <button
        className={cn("relative", className)}
        onClick={handleClick}
      >
        {children}
      </button>
      <ConfettiEffect active={showConfetti} />
    </>
  );
}; 