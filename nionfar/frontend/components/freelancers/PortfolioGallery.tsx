import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  images?: string[];
  projectUrl?: string;
  technologies?: string[];
}

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  onItemClick?: (item: PortfolioItem) => void;
  className?: string;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ 
  items, 
  onItemClick,
  className = ''
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((portfolioItem) => (
        <motion.div
          key={portfolioItem.id}
          className="relative overflow-hidden rounded-lg shadow-md group cursor-pointer"
          onClick={() => onItemClick && onItemClick(portfolioItem)}
          variants={item}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative h-64 w-full">
            <Image
              src={portfolioItem.image}
              alt={portfolioItem.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-xl font-semibold text-white mb-2">{portfolioItem.title}</h3>
              {portfolioItem.category && (
                <span className="text-sm text-white bg-indigo-600 px-3 py-1 rounded-full">
                  {portfolioItem.category}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}; 