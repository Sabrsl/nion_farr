/**
 * Script pour corriger les relations circulaires entre entités
 * Ce script crée des versions simplifiées des entités dans le dossier dist pour éviter les erreurs MODULE_NOT_FOUND
 */

const fs = require('fs');
const path = require('path');

// Définition des chemins
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Assurez-vous que le dossier existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Création du dossier: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// Créer les dossiers des entités
function createEntityDirectories() {
  const entityDirs = [
    path.join(DIST_DIR, 'modules', 'users', 'entities'),
    path.join(DIST_DIR, 'modules', 'users', 'enums'),
    path.join(DIST_DIR, 'modules', 'services', 'entities'),
    path.join(DIST_DIR, 'modules', 'orders', 'entities'),
    path.join(DIST_DIR, 'modules', 'reviews', 'entities'),
    path.join(DIST_DIR, 'modules', 'messages', 'entities')
  ];

  entityDirs.forEach(dir => ensureDirectoryExists(dir));
  
  console.log('✅ Dossiers des entités créés');
}

// Créer user-role.enum.js
function createUserRoleEnum() {
  const filePath = path.join(DIST_DIR, 'modules', 'users', 'enums', 'user-role.enum.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;

var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["PROVIDER"] = "provider";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
    // Garder les anciennes valeurs pour compatibilité
    UserRole["USER"] = "user";
    UserRole["FREELANCER"] = "freelancer";
})(UserRole = exports.UserRole || (exports.UserRole = {}));

var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["BANNED"] = "banned";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Créer user.entity.js (version simplifiée)
function createUserEntity() {
  const filePath = path.join(DIST_DIR, 'modules', 'users', 'entities', 'user.entity.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserStatus = void 0;

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const user_role_enum_1 = require("../enums/user-role.enum");

var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));

let User = class User {
    constructor(partial) {
        Object.assign(this, partial);
    }
    get fullName() {
        return \`\${this.firstName} \${this.lastName}\`;
    }
};

__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);

__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);

__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);

__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);

__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);

__decorate([
    (0, typeorm_1.Column)({ select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);

__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_role_enum_1.UserRole,
        default: user_role_enum_1.UserRole.CLIENT
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);

__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING_VERIFICATION
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);

__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isFreelancer", void 0);

__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);

__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);

__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);

User = __decorate([
    (0, typeorm_1.Entity)('users'),
    __metadata("design:paramtypes", [Object])
], User);
exports.User = User;`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Créer service.entity.js (version simplifiée)
function createServiceEntity() {
  const filePath = path.join(DIST_DIR, 'modules', 'services', 'entities', 'service.entity.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

const typeorm_1 = require("typeorm");

let Service = class Service {
    constructor(partial) {
        Object.assign(this, partial);
    }
};

__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Service.prototype, "id", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Service.prototype, "title", void 0);

__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);

__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Service.prototype, "price", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Service.prototype, "providerId", void 0);

__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Service.prototype, "createdAt", void 0);

__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Service.prototype, "updatedAt", void 0);

Service = __decorate([
    (0, typeorm_1.Entity)('services'),
    __metadata("design:paramtypes", [Object])
], Service);
exports.Service = Service;`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Créer order.entity.js (version simplifiée)
function createOrderEntity() {
  const filePath = path.join(DIST_DIR, 'modules', 'orders', 'entities', 'order.entity.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

const typeorm_1 = require("typeorm");

let Order = class Order {
    constructor(partial) {
        Object.assign(this, partial);
    }
};

__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "clientId", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "freelancerId", void 0);

__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);

__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);

Order = __decorate([
    (0, typeorm_1.Entity)('orders'),
    __metadata("design:paramtypes", [Object])
], Order);
exports.Order = Order;`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Créer review.entity.js (version simplifiée)
function createReviewEntity() {
  const filePath = path.join(DIST_DIR, 'modules', 'reviews', 'entities', 'review.entity.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

const typeorm_1 = require("typeorm");

let Review = class Review {
    constructor(partial) {
        Object.assign(this, partial);
    }
};

__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);

__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Review.prototype, "content", void 0);

__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "reviewerId", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "revieweeId", void 0);

__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);

__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);

Review = __decorate([
    (0, typeorm_1.Entity)('reviews'),
    __metadata("design:paramtypes", [Object])
], Review);
exports.Review = Review;`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Créer message.entity.js (version simplifiée)
function createMessageEntity() {
  const filePath = path.join(DIST_DIR, 'modules', 'messages', 'entities', 'message.entity.js');
  
  if (!fs.existsSync(filePath)) {
    const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

const typeorm_1 = require("typeorm");

let Message = class Message {
    constructor(partial) {
        Object.assign(this, partial);
    }
};

__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);

__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);

__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Message.prototype, "receiverId", void 0);

__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);

__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "updatedAt", void 0);

Message = __decorate([
    (0, typeorm_1.Entity)('messages'),
    __metadata("design:paramtypes", [Object])
], Message);
exports.Message = Message;`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
  } else {
    console.log(`⏩ Le fichier existe déjà: ${filePath}`);
  }
}

// Fonction principale
function main() {
  console.log('🔧 Démarrage de la correction des relations circulaires entre entités...');
  
  // Créer les dossiers des entités
  createEntityDirectories();
  
  // Créer les fichiers d'entités simplifiés
  createUserRoleEnum();
  createUserEntity();
  createServiceEntity();
  createOrderEntity();
  createReviewEntity();
  createMessageEntity();
  
  console.log('✅ Correction des relations circulaires terminée');
}

// Exécuter la fonction principale
main(); 