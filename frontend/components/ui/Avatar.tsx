import React, { useState, memo } from 'react';
import classNames from 'classnames';

// Default avatar image
const DEFAULT_AVATAR = '/img/avatar-placeholder.jpg';

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
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  // Get pixel dimensions based on size
  const getDimensions = () => {
    switch(size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 56;
      case 'xl': return 80;
      default: return 40;
    }
  };

  const imageDimension = getDimensions();
  
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
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
});

// Display name for React DevTools
Avatar.displayName = 'Avatar';

export default Avatar;