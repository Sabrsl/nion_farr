import fs from 'fs';
import path from 'path';

// Types pour les données stockées
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin';
  password: string; // Dans une véritable application, ce serait un hash
  isVerified: boolean;
  createdAt: string; // Date en format ISO
  passwordTemporary?: boolean;
  passwordExpiresAt?: string;
  passwordLastChanged?: string;
  lastLoginAt?: string; // Date de dernière connexion
}

export interface VerificationData {
  email: string;
  code: string;
  expiresAt: string; // Date en format ISO
}

export interface ResetTokenData {
  email: string;
  token: string;
  expiresAt: string; // Date en format ISO
}

// Structure de stockage
interface AuthStorage {
  users: Record<string, UserData>;
  verificationCodes: Record<string, VerificationData>;
  passwordResetTokens: Record<string, ResetTokenData>;
  lastUpdated: string;
}

// Chemin du fichier de stockage
const DATA_DIR = path.join(process.cwd(), '.data');
const STORAGE_FILE = path.join(DATA_DIR, 'auth-storage.json');

// État en mémoire
let memoryStorage: AuthStorage = {
  users: {},
  verificationCodes: {},
  passwordResetTokens: {},
  lastUpdated: new Date().toISOString()
};

// Assurer que le répertoire de données existe
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Erreur lors de la création du répertoire de données:', error);
}

// Charger les données depuis le fichier
export function loadData(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      memoryStorage = JSON.parse(data);
      console.log(`[AUTH STORAGE] Données chargées avec succès (${Object.keys(memoryStorage.users).length} utilisateurs)`);
    } else {
      console.log('[AUTH STORAGE] Aucun fichier de stockage trouvé, utilisation d\'un stockage vide');
      saveData(); // Créer le fichier
    }
  } catch (error) {
    console.error('[AUTH STORAGE] Erreur lors du chargement des données:', error);
  }
}

// Sauvegarder les données dans le fichier
export function saveData(): void {
  try {
    memoryStorage.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(memoryStorage, null, 2), 'utf8');
    console.log('[AUTH STORAGE] Données sauvegardées avec succès');
  } catch (error) {
    console.error('[AUTH STORAGE] Erreur lors de la sauvegarde des données:', error);
  }
}

// API pour les utilisateurs
export const userStorage = {
  getAll(): UserData[] {
    return Object.values(memoryStorage.users);
  },
  
  getById(id: string): UserData | undefined {
    return memoryStorage.users[id];
  },
  
  getByEmail(email: string): UserData | undefined {
    return Object.values(memoryStorage.users).find(user => user.email === email);
  },
  
  create(userData: UserData): void {
    memoryStorage.users[userData.id] = userData;
    saveData();
  },
  
  update(id: string, userData: Partial<UserData>): void {
    if (memoryStorage.users[id]) {
      memoryStorage.users[id] = { ...memoryStorage.users[id], ...userData };
      saveData();
    }
  },
  
  delete(id: string): void {
    delete memoryStorage.users[id];
    saveData();
  },
  
  exists(email: string): boolean {
    return Object.values(memoryStorage.users).some(user => user.email === email);
  }
};

// API pour les codes de vérification
export const verificationStorage = {
  getAll(): VerificationData[] {
    return Object.values(memoryStorage.verificationCodes);
  },
  
  getByEmail(email: string): VerificationData | undefined {
    return memoryStorage.verificationCodes[email];
  },
  
  create(email: string, data: VerificationData): void {
    memoryStorage.verificationCodes[email] = data;
    saveData();
  },
  
  delete(email: string): void {
    delete memoryStorage.verificationCodes[email];
    saveData();
  },
  
  clearExpired(): void {
    const now = new Date();
    let hasChanges = false;
    
    Object.entries(memoryStorage.verificationCodes).forEach(([email, data]) => {
      if (new Date(data.expiresAt) < now) {
        delete memoryStorage.verificationCodes[email];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      saveData();
    }
  }
};

// API pour les tokens de réinitialisation
export const resetTokenStorage = {
  getAll(): ResetTokenData[] {
    return Object.values(memoryStorage.passwordResetTokens);
  },
  
  getByToken(token: string): ResetTokenData | undefined {
    return memoryStorage.passwordResetTokens[token];
  },
  
  create(token: string, data: ResetTokenData): void {
    memoryStorage.passwordResetTokens[token] = data;
    saveData();
  },
  
  delete(token: string): void {
    delete memoryStorage.passwordResetTokens[token];
    saveData();
  },
  
  deleteByEmail(email: string): void {
    Object.entries(memoryStorage.passwordResetTokens).forEach(([token, data]) => {
      if (data.email === email) {
        delete memoryStorage.passwordResetTokens[token];
      }
    });
    saveData();
  },
  
  clearExpired(): void {
    const now = new Date();
    let hasChanges = false;
    
    Object.entries(memoryStorage.passwordResetTokens).forEach(([token, data]) => {
      if (new Date(data.expiresAt) < now) {
        delete memoryStorage.passwordResetTokens[token];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      saveData();
    }
  }
};

// Charger les données au démarrage
loadData();

// Nettoyer les données expirées toutes les heures
setInterval(() => {
  verificationStorage.clearExpired();
  resetTokenStorage.clearExpired();
}, 60 * 60 * 1000);

// Compatibilité avec les Map utilisées précédemment
export const users = {
  set: (id: string, userData: UserData) => userStorage.create(userData),
  get: (id: string) => userStorage.getById(id),
  has: (id: string) => !!userStorage.getById(id),
  delete: (id: string) => userStorage.delete(id),
  values: () => userStorage.getAll()
};

export const verificationCodes = {
  set: (email: string, data: VerificationData) => verificationStorage.create(email, data),
  get: (email: string) => verificationStorage.getByEmail(email),
  has: (email: string) => !!verificationStorage.getByEmail(email),
  delete: (email: string) => verificationStorage.delete(email)
};

export const passwordResetTokens = {
  set: (token: string, data: ResetTokenData) => resetTokenStorage.create(token, data),
  get: (token: string) => resetTokenStorage.getByToken(token),
  has: (token: string) => !!resetTokenStorage.getByToken(token),
  delete: (token: string) => resetTokenStorage.delete(token),
  entries: () => Object.entries(memoryStorage.passwordResetTokens)
}; 