import React, { useState, memo } from 'react';
import Image from 'next/image';
import classNames from 'classnames';

// Default avatar image
const DEFAULT_AVATAR = '/img/avatars/default.jpg';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
  border?: boolean;
  borderColor?: string;
  onClick?: () => void;
}

/**
 * Avatar component for displaying user images
 */
export const Avatar = memo<AvatarProps>(({
  src = DEFAULT_AVATAR,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback,
  border = false,
  borderColor = 'border-gray-200',
  onClick,
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Size classes mapping
  const SIZES = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  // Get initials from alt text for fallback
  const getInitials = () => {
    if (alt === 'Avatar') return '';
    
    return alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Determine font size based on avatar size
  const FONT_SIZES = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  
  const avatarClasses = classNames(
    // Base styles
    'relative rounded-full overflow-hidden bg-gray-200',
    
    // Size styles
    SIZES[size],
    
    // Border styles
    border && 'border-2',
    border && borderColor,
    
    // Interactive styles
    onClick && 'cursor-pointer hover:opacity-90',
    
    // Custom classes
    className
  );
  
  // Handle image load error
  const handleError = () => {
    setImageError(true);
  };
  
  return (
    <div 
      className={avatarClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      title={alt !== 'Avatar' ? alt : undefined}
      {...rest}
    >
      {/* Show fallback if image fails to load or if explicitly provided */}
      {(imageError || !src) ? (
        fallback || (
          <div className={`w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-800 font-medium ${FONT_SIZES[size]}`}>
            {getInitials()}
          </div>
        )
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`(max-width: 768px) ${parseInt(SIZES[size].replace('w-', '')) * 4}px, ${parseInt(SIZES[size].replace('w-', '')) * 4}px`}
          className="object-cover"
          onError={handleError}
        />
      )}
    </div>
  );
});

// Display name for React DevTools
Avatar.displayName = 'Avatar';

export default Avatar;