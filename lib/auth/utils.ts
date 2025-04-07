import * as crypto from 'crypto';

/**
 * Génère un code de vérification aléatoire à 6 chiffres
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Vérifie si un jeton ou code a expiré
 * @param createdAt Date de création du jeton
 * @param expiryHours Nombre d'heures avant expiration
 */
export function isTokenExpired(createdAt: Date, expiryHours: number = 24): boolean {
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + expiryHours * 60 * 60 * 1000);
  return now > expiryTime;
}

/**
 * Génère un token aléatoire
 * @param prefix Préfixe du token (par défaut: 'token')
 * @returns Token aléatoire
 */
export function generateRandomToken(prefix: string = 'token'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Vérifie si un mot de passe est suffisamment fort
 * @param password Mot de passe à vérifier
 */
export function isStrongPassword(password: string): boolean {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

/**
 * Vérifie si une adresse email est valide
 * @param email Adresse email à vérifier
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Caractères utilisés pour la génération de mots de passe
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Génère un mot de passe sécurisé avec des caractères aléatoires
 * @param length Longueur du mot de passe (par défaut: 12)
 * @param options Options de génération
 * @returns Mot de passe généré
 */
export function generateSecurePassword(
  length: number = 12,
  options: {
    includeLowercase?: boolean;
    includeUppercase?: boolean;
    includeNumbers?: boolean;
    includeSpecial?: boolean;
    excludeSimilar?: boolean;
  } = {}
): string {
  const {
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSpecial = true,
    excludeSimilar = false
  } = options;

  // Filtrer les caractères similaires si nécessaire
  const filterSimilar = (str: string) => 
    excludeSimilar ? str.replace(/[1lI0Oo]/g, '') : str;

  // Construire le jeu de caractères
  let charset = '';
  if (includeLowercase) charset += filterSimilar(LOWERCASE);
  if (includeUppercase) charset += filterSimilar(UPPERCASE);
  if (includeNumbers) charset += filterSimilar(NUMBERS);
  if (includeSpecial) charset += SPECIAL;

  // S'assurer que le jeu de caractères n'est pas vide
  if (charset.length === 0) {
    charset = filterSimilar(LOWERCASE + UPPERCASE + NUMBERS);
  }

  // Générer le mot de passe
  const getRandomChar = () => {
    const randomBytes = crypto.randomBytes(1);
    const randomIndex = randomBytes[0] % charset.length;
    return charset[randomIndex];
  };

  // Assurer au moins un caractère de chaque type requis
  let password = '';
  
  if (includeLowercase) {
    password += filterSimilar(LOWERCASE)[crypto.randomInt(filterSimilar(LOWERCASE).length)];
  }
  
  if (includeUppercase) {
    password += filterSimilar(UPPERCASE)[crypto.randomInt(filterSimilar(UPPERCASE).length)];
  }
  
  if (includeNumbers) {
    password += filterSimilar(NUMBERS)[crypto.randomInt(filterSimilar(NUMBERS).length)];
  }
  
  if (includeSpecial) {
    password += SPECIAL[crypto.randomInt(SPECIAL.length)];
  }

  // Compléter jusqu'à la longueur demandée
  while (password.length < length) {
    password += getRandomChar();
  }

  // Mélanger le mot de passe pour éviter un schéma prévisible
  return shuffleString(password);
}

/**
 * Mélange les caractères d'une chaîne de façon aléatoire
 * @param str Chaîne à mélanger
 * @returns Chaîne mélangée
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  
  // Algorithme de Fisher-Yates pour mélanger
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
}

/**
 * Calcule le hash SHA-256 d'une chaîne
 * @param input Chaîne à hacher
 * @returns Hash SHA-256 sous forme hexadécimale
 */
export function sha256Hash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Vérifie la force d'un mot de passe
 * @param password Mot de passe à vérifier
 * @returns Score de force du mot de passe (0-5) et feedback
 */
export function checkPasswordStrength(password: string): { score: number; feedback: string } {
  let score = 0;
  let feedback = '';

  // Vérifier la longueur minimale
  if (password.length < 8) {
    return { score: 0, feedback: 'Le mot de passe doit contenir au moins 8 caractères' };
  } else if (password.length >= 12) {
    score += 1;
  }

  // Vérifier la présence de lettres minuscules
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    return { score, feedback: 'Le mot de passe doit contenir au moins une lettre minuscule' };
  }

  // Vérifier la présence de lettres majuscules
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    return { score, feedback: 'Le mot de passe doit contenir au moins une lettre majuscule' };
  }

  // Vérifier la présence de chiffres
  if (/\d/.test(password)) {
    score += 1;
  } else {
    return { score, feedback: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  // Vérifier la présence de caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    return { score, feedback: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }

  // Retourner le score et un feedback approprié
  if (score < 3) {
    feedback = 'Mot de passe faible';
  } else if (score < 4) {
    feedback = 'Mot de passe moyen';
  } else if (score < 5) {
    feedback = 'Mot de passe fort';
  } else {
    feedback = 'Mot de passe très fort';
  }

  return { score, feedback };
}

/**
 * Génère un mot de passe temporaire et son hash
 * @returns Objet contenant le mot de passe temporaire et son hash SHA-256
 */
export function generateTemporaryPassword(): { password: string; hash: string } {
  const password = generateSecurePassword(12, {
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSpecial: true,
    excludeSimilar: true
  });
  
  const hash = sha256Hash(password);
  
  return { password, hash };
} 