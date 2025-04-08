/**
 * Utilitaires pour formater différentes valeurs
 */

/**
 * Formate un montant en devise
 * @param amount - Le montant à formater
 * @param currency - Code de la devise (par défaut: FCFA)
 * @param options - Options de formatage supplémentaires
 * @returns La chaîne formatée
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'FCFA',
  options: Intl.NumberFormatOptions = {}
): string => {
  // Pour FCFA, utiliser un format personnalisé car pas standard dans Intl
  if (currency === 'FCFA' || currency === 'XOF') {
    return `${amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options
    })} FCFA`;
  }

  // Pour les autres devises, utiliser Intl.NumberFormat
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    ...options
  }).format(amount);
};

/**
 * Formate une date
 * @param date - La date à formater (string ISO ou Date)
 * @param format - Format de date ou options de formatage
 * @returns La date formatée
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'medium' | 'long' | 'full' | Intl.DateTimeFormatOptions = 'medium'
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Si format est un objet d'options
  if (typeof format === 'object') {
    return dateObj.toLocaleDateString('fr-FR', format);
  }
  
  // Sinon, utiliser les formats prédéfinis
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    day: '2-digit',
  };
  
  if (format === 'full' || format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('fr-FR', options);
};

/**
 * Formate un nombre avec séparateurs
 * @param number - Le nombre à formater
 * @param decimals - Nombre de décimales
 * @returns Le nombre formaté
 */
export const formatNumber = (
  number: number,
  decimals: number = 0
): string => {
  return number.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}; 