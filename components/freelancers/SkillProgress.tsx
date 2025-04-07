import React from 'react';
import { motion } from 'framer-motion';

interface SkillProgressProps {
  skill: string;
  progress: number;
  delay?: number;
  className?: string;
}

export const SkillProgress: React.FC<SkillProgressProps> = ({
  skill,
  progress,
  delay = 0,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-800 font-medium">{skill}</span>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 0.8, 
            delay,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
}; 