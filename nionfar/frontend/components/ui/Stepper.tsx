import React from 'react';
import { motion } from 'framer-motion';

type Step = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

export const Stepper = ({ steps, currentStep, onStepClick }: StepperProps) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li 
            key={step.id} 
            className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1 ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''}`}
          >
            {stepIdx !== steps.length - 1 ? (
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-0.5 w-full ${stepIdx < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              </div>
            ) : null}
            
            <button
              type="button"
              onClick={() => onStepClick && onStepClick(stepIdx)}
              className={`relative flex items-center justify-center group ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="h-9 flex items-center">
                <span 
                  className={`
                    relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors
                    ${
                      stepIdx < currentStep
                        ? 'bg-indigo-600 group-hover:bg-indigo-800'
                        : stepIdx === currentStep
                          ? 'bg-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                          : 'bg-white border-2 border-gray-300 group-hover:border-gray-400'
                    }
                  `}
                >
                  {stepIdx < currentStep ? (
                    <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span 
                      className={`
                        ${
                          stepIdx === currentStep
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-gray-700'
                        }
                      `}
                    >
                      <step.icon className="w-6 h-6" />
                    </span>
                  )}
                </span>
              </span>
              
              <span className="ml-4 min-w-0 flex flex-col">
                <span 
                  className={`
                    text-xs font-semibold uppercase tracking-wide 
                    ${
                      stepIdx <= currentStep
                        ? 'text-indigo-600'
                        : 'text-gray-500'
                    }
                  `}
                >
                  Étape {stepIdx + 1}
                </span>
                <span 
                  className={`
                    text-sm font-medium 
                    ${
                      stepIdx <= currentStep
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}; 