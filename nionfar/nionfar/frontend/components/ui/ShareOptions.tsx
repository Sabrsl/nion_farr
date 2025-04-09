import React, { useState, useCallback, useMemo } from 'react';
import { 
  FiFacebook, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiLink, 
  FiCheck 
} from 'react-icons/fi/index.js';

type SharePlatform = 'facebook' | 'twitter' | 'linkedin' | 'email';

interface ShareOptionsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  onShare?: (platform?: string) => void;
  className?: string;
  platforms?: SharePlatform[];
  analyticsTracker?: (platform: string) => void;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({
  url,
  title,
  description = '',
  image = '',
  onShare,
  className = '',
  platforms = ['facebook', 'twitter', 'linkedin', 'email'],
  analyticsTracker
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTimeout, setCopiedTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }
    };
  }, [copiedTimeout]);

  const handleCopyLink = useCallback(() => {
    // Clear any existing timeout
    if (copiedTimeout) {
      clearTimeout(copiedTimeout);
    }

    // Attempt to copy URL
    navigator.clipboard.writeText(url).then(() => {
      // Track copy event
      analyticsTracker?.('link_copied');
      
      // Set copied state
      setCopied(true);
      
      // Set and store timeout
      const timeout = setTimeout(() => setCopied(false), 2000);
      setCopiedTimeout(timeout);
      
      // Call share callback if provided
      onShare?.('link');
    }).catch((err) => {
      console.error('Failed to copy link', err);
    });
  }, [url, onShare, analyticsTracker]);

  const handleShare = useCallback((platform: SharePlatform) => {
    let shareUrl = '';
    
    // Encode parameters to ensure safe URL construction
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}\n\n${encodedUrl}`;
        break;
    }
    
    // Open share window
    try {
      const shareWindow = window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      
      // Track share event
      analyticsTracker?.(platform);
      
      // Call share callback if provided
      onShare?.(platform);

      // Optional: Focus on share window
      shareWindow?.focus();
    } catch (error) {
      console.error(`Failed to open share window for ${platform}`, error);
    }
  }, [url, title, description, onShare, analyticsTracker]);

  // Memoized platform configurations to prevent unnecessary re-renders
  const platformConfigs = useMemo(() => ({
    facebook: { 
      icon: FiFacebook, 
      color: 'bg-blue-600 hover:bg-blue-700',
      label: 'Facebook' 
    },
    twitter: { 
      icon: FiTwitter, 
      color: 'bg-blue-400 hover:bg-blue-500',
      label: 'Twitter' 
    },
    linkedin: { 
      icon: FiLinkedin, 
      color: 'bg-blue-700 hover:bg-blue-800',
      label: 'LinkedIn' 
    },
    email: { 
      icon: FiMail, 
      color: 'bg-gray-600 hover:bg-gray-700',
      label: 'Email' 
    }
  }), []);

  return (
    <div className={`p-4 ${className}`}>
      {/* Social Share Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {platforms.map((platform) => {
          const { icon: Icon, color, label } = platformConfigs[platform];
          return (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={`
                flex items-center justify-center p-3 
                rounded-lg text-white font-medium 
                transition-colors ${color}
              `}
              aria-label={`Partager sur ${label}`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          );
        })}
      </div>
      
      {/* Copy Link Section */}
      <div className="relative">
        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
          <input 
            type="text" 
            value={url} 
            readOnly 
            className="flex-1 p-3 bg-transparent text-gray-700 outline-none"
            aria-label="Lien à partager"
          />
          <button
            onClick={handleCopyLink}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 transition-colors"
            aria-label={copied ? 'Lien copié' : 'Copier le lien'}
          >
            {copied ? <FiCheck className="h-5 w-5" /> : <FiLink className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Copied Confirmation */}
        {copied && (
          <div 
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded"
            role="alert"
          >
            Lien copié !
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareOptions;