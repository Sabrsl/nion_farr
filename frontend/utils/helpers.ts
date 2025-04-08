/**
 * Utilitaires divers pour l'application
 */

/**
 * Combine plusieurs classes CSS conditionnelles en une seule chaîne
 * @param classes - Liste de classes conditionnelles
 * @returns Chaîne combinée de classes
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formatte un prix en FCFA
 * @param amount - Montant à formater
 * @returns Chaîne formatée avec séparateurs de milliers et devise
 */
export function formatPrice(amount: number | undefined): string {
  if (amount === undefined) return '0 FCFA';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatte une date au format local
 * @param dateString - Chaîne de date ISO
 * @returns Date formatée (ex: 12 juin 2023)
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculer le temps écoulé depuis une date donnée
 * @param dateString - Chaîne de date ISO
 * @returns Temps écoulé sous forme de texte (ex: "il y a 2 jours")
 */
export function timeAgo(dateString: string | undefined): string {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `il y a ${diffInMonths} mois`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
}

/**
 * Tronquer un texte à une longueur donnée et ajouter des points de suspension
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Calcule le nombre de jours restants à partir d'une date donnée
 * @param dateString - Chaîne de date ISO de fin
 * @returns Nombre de jours restants (négatif si la date est passée)
 */
export function daysRemaining(dateString: string | undefined): number {
  if (!dateString) return 0;
  
  const now = new Date();
  const endDate = new Date(dateString);
  const diffInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffInDays;
} 