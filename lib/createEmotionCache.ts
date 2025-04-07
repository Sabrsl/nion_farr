import createCache from '@emotion/cache';

// On the client side, Create a custom cache instance
export default function createEmotionCache() {
  return createCache({ key: 'css' });
} 