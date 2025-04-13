/**
 * Script de correction des URLs Railway vers les URLs Render
 */

const FIX_RENDER_BACKEND_URL = 'https://nionfar-backend.onrender.com';
const FIX_RENDER_API_URL = 'https://nionfar-backend.onrender.com/api';

// Anciens URLs (obsolètes)
const VERCEL_BACKEND_URL = 'https://nion-farr-backend.vercel.app';
const VERCEL_API_URL = 'https://nion-farr-backend.vercel.app/api';

// Exécuter après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Vérification et correction des URLs Railway...');
  
  try {
    // Définir les variables globales
    window.__CORRECT_API_URL = FIX_RENDER_API_URL;
    window.__CORRECT_BACKEND_URL = FIX_RENDER_BACKEND_URL;
    
    // Vérifier localStorage
    if (typeof localStorage === 'undefined') {
      console.warn('⚠️ localStorage n\'est pas disponible');
      return;
    }
    
    // Vérifier si la correction a déjà été effectuée récemment
    const lastFixTimestamp = localStorage.getItem('railway_fixed_timestamp');
    if (lastFixTimestamp) {
      const lastFixDate = new Date(lastFixTimestamp);
      const now = new Date();
      const hoursSinceLastFix = (now - lastFixDate) / (1000 * 60 * 60);
      
      // Si moins de 24 heures se sont écoulées depuis la dernière correction, ne pas réexécuter
      if (hoursSinceLastFix < 24) {
        console.log(`ℹ️ Dernière correction il y a ${hoursSinceLastFix.toFixed(2)} heures. Ignore.`);
        return;
      }
    }
    
    // Variables pour suivre les corrections
    let fixed = false;
    
    // Rechercher et corriger les URLs Railway dans localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (value && typeof value === 'string') {
        // Vérifier et corriger les URLs Railway
        if (value.includes('railway.app')) {
          let newValue = value;
          
          // Remplacer les URLs complètes
          newValue = newValue.replace(/https:\/\/[^\/]*railway\.app\/api/gi, FIX_RENDER_API_URL);
          newValue = newValue.replace(/https:\/\/[^\/]*railway\.app/gi, FIX_RENDER_BACKEND_URL);
          
          // Si la valeur a été modifiée, mettre à jour localStorage
          if (newValue !== value) {
            localStorage.setItem(key, newValue);
            console.log(`✅ Corrigé ${key}: ${value} → ${newValue}`);
            fixed = true;
          }
        }
        
        // Vérifier et corriger les anciennes URLs Vercel
        if (value === VERCEL_API_URL || value === VERCEL_BACKEND_URL) {
          const newValue = value === VERCEL_API_URL ? FIX_RENDER_API_URL : FIX_RENDER_BACKEND_URL;
          localStorage.setItem(key, newValue);
          console.log(`✅ Corrigé ${key}: ${value} → ${newValue}`);
          fixed = true;
        }
      }
    }
    
    // Forcer les valeurs correctes pour les clés importantes
    localStorage.setItem('NEXT_PUBLIC_API_URL', FIX_RENDER_API_URL);
    localStorage.setItem('API_URL', FIX_RENDER_API_URL);
    
    // Marquer comme corrigé
    localStorage.setItem('railway_fixed', 'true');
    localStorage.setItem('railway_fixed_timestamp', new Date().toISOString());
    
    console.log('✅ Correction des URLs Railway terminée');
    
    // Si des corrections ont été effectuées, recharger la page après un délai
    if (fixed) {
      console.log('🔄 Rechargement de la page dans 1 seconde...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction des URLs Railway:', error);
  }
}); 