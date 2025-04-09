/**
 * Polyfills pour remplacer certaines méthodes obsolètes
 */

// Remplacer util._extend par Object.assign
if (typeof global !== 'undefined' && global.util && global.util._extend) {
  global.util._extend = function(target, source) {
    return Object.assign(target, source);
  };
}

export {}; 