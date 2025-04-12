/**
 * Script d'urgence pour créer manuellement le fichier user.entity.js
 * Ce script est utilisé en dernier recours si les autres méthodes échouent
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Création manuelle du fichier user.entity.js...');

// Définition des chemins
const DIST_DIR = path.join(__dirname, '..', 'dist');
const USER_ENTITY_DIR = path.join(DIST_DIR, 'modules', 'users', 'entities');
const USER_ENTITY_PATH = path.join(USER_ENTITY_DIR, 'user.entity.js');

// Assurer que le dossier existe
if (!fs.existsSync(USER_ENTITY_DIR)) {
  console.log(`📁 Création du dossier: ${USER_ENTITY_DIR}`);
  fs.mkdirSync(USER_ENTITY_DIR, { recursive: true });
}

// Contenu du fichier user.entity.js
const userEntityContent = `"use strict";
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
// const user_role_enum_1 = require("../enums/user-role.enum");

var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));

var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["PROVIDER"] = "provider";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["USER"] = "user";
    UserRole["FREELANCER"] = "freelancer";
})(UserRole = exports.UserRole || (exports.UserRole = {}));

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
        enum: UserRole,
        default: UserRole.CLIENT
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

// Écrire le fichier
try {
  fs.writeFileSync(USER_ENTITY_PATH, userEntityContent);
  console.log(`✅ Fichier créé avec succès: ${USER_ENTITY_PATH}`);
} catch (error) {
  console.error(`❌ Erreur lors de la création du fichier: ${error.message}`);
  process.exit(1);
}

// Vérifier que le fichier a bien été créé
if (fs.existsSync(USER_ENTITY_PATH)) {
  const stats = fs.statSync(USER_ENTITY_PATH);
  console.log(`✅ Taille du fichier: ${stats.size} octets`);
  console.log('✅ Le fichier user.entity.js a été créé avec succès!');
  process.exit(0);
} else {
  console.error('❌ ERREUR: Le fichier user.entity.js n\'a pas pu être créé!');
  process.exit(1);
} 