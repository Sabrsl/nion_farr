import React from 'react';
import { motion } from 'framer-motion';

type Step = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isValid?: boolean;
  isOptional?: boolean;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  variant?: 'default' | 'minimal' | 'vertical';
  color?: 'indigo' | 'blue' | 'green' | 'purple';
  className?: string;
  showDescription?: boolean;
};

export const Stepper = ({ 
  steps, 
  currentStep, 
  onStepClick, 
  variant = 'default',
  color = 'indigo',
  className = '',
  showDescription = false
}: StepperProps) => {
  // Générer les classes de couleur dynamiquement
  const getColorClasses = (active: boolean, completed: boolean) => {
    const baseClasses = {
      bg: {
        completed: `bg-${color}-600 group-hover:bg-${color}-800`,
        current: `bg-${color}-600 ring-2 ring-${color}-600 ring-offset-2`,
        default: 'bg-white border-2 border-gray-300 group-hover:border-gray-400'
      },
      text: {
        completed: 'text-white',
        step: `text-${color}-600`,
        default: 'text-gray-500 group-hover:text-gray-700'
      },
      line: {
        completed: `bg-${color}-600`,
        default: 'bg-gray-200'
      }
    };

    if (completed) return baseClasses.bg.completed;
    if (active) return baseClasses.bg.current;
    return baseClasses.bg.default;
  };

  // Rendu du composant selon la variante
  const renderHorizontalStepper = () => (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li 
            key={step.id} 
            className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1 ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''}`}
          >
            {/* Ligne de progression */}
            {stepIdx !== steps.length - 1 ? (
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div 
                  className={`h-0.5 w-full ${
                    stepIdx < currentStep 
                      ? `bg-${color}-600` 
                      : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            ) : null}
            
            {/* Bouton d'étape */}
            <button
              type="button"
              onClick={() => onStepClick && onStepClick(stepIdx)}
              disabled={!step.isValid && stepIdx > currentStep}
              className={`
                relative flex items-center justify-center group 
                ${onStepClick ? 'cursor-pointer' : 'cursor-default'}
                ${!step.isValid && stepIdx > currentStep ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="h-9 flex items-center">
                <span 
                  className={`
                    relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors
                    ${getColorClasses(stepIdx === currentStep, stepIdx < currentStep)}
                  `}
                >
                  {/* Icône de l'étape */}
                  {stepIdx < currentStep ? (
                    <svg 
                      className="w-5 h-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
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
              
              {/* Informations de l'étape */}
              <span className="ml-4 min-w-0 flex flex-col">
                <span 
                  className={`
                    text-xs font-semibold uppercase tracking-wide 
                    ${stepIdx <= currentStep ? `text-${color}-600` : 'text-gray-500'}
                  `}
                >
                  {step.isOptional ? 'Étape optionnelle' : `Étape ${stepIdx + 1}`}
                </span>
                <span 
                  className={`
                    text-sm font-medium 
                    ${stepIdx <= currentStep ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.name}
                </span>
                {showDescription && step.description && (
                  <span className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );

  // Gérer différentes variantes
  const renderStepper = () => {
    switch (variant) {
      case 'vertical':
        // TODO: Implémenter la variante verticale si nécessaire
        return renderHorizontalStepper();
      case 'minimal':
        // TODO: Implémenter la variante minimale si nécessaire
        return renderHorizontalStepper();
      default:
        return renderHorizontalStepper();
    }
  };

  return renderStepper();
};

export default Stepper;