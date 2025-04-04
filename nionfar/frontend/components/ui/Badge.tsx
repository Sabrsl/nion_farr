import React from 'react';
import { VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200/80",
        primary:
          "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200/80",
        secondary:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200/80",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200/80",
        danger:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200/80",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80",
        outline: "text-gray-700 border-gray-200 hover:bg-gray-100",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof badgeVariants> & {
    icon?: React.ReactNode;
  };

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, size, className })} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
} 