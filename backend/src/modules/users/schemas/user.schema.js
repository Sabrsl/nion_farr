"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = exports.changePasswordSchema = exports.updateUserSchema = exports.fullUserSchema = exports.notificationPreferencesSchema = exports.paymentInfoSchema = exports.providerProfileSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const user_role_enum_1 = require("../enums/user-role.enum");
const user_entity_1 = require("../entities/user.entity");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
// Schéma de base pour la création d'un utilisateur
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email({ message: 'Adresse e-mail invalide' })
        .min(5, { message: 'L\'e-mail doit contenir au moins 5 caractères' })
        .max(255, { message: 'L\'e-mail ne peut pas dépasser 255 caractères' }),
    firstName: zod_1.z
        .string()
        .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
        .max(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' }),
    lastName: zod_1.z
        .string()
        .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
        .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
    username: zod_1.z
        .string()
        .min(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' })
        .max(50, { message: 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères' })
        .optional(),
    password: zod_1.z
        .string()
        .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
        .max(100, { message: 'Le mot de passe ne peut pas dépasser 100 caractères' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre'
    }),
    role: zod_1.z
        .nativeEnum(user_role_enum_1.UserRole)
        .optional()
        .default(user_role_enum_1.UserRole.CLIENT),
    status: zod_1.z
        .nativeEnum(user_entity_1.UserStatus)
        .optional()
        .default(user_entity_1.UserStatus.PENDING_VERIFICATION),
    phone: zod_1.z
        .string()
        .min(8, { message: 'Le numéro de téléphone doit contenir au moins 8 caractères' })
        .max(20, { message: 'Le numéro de téléphone ne peut pas dépasser 20 caractères' })
        .optional(),
    address: zod_1.z
        .string()
        .max(255, { message: 'L\'adresse ne peut pas dépasser 255 caractères' })
        .optional(),
    city: zod_1.z
        .string()
        .max(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
        .optional(),
    country: zod_1.z
        .string()
        .max(100, { message: 'Le pays ne peut pas dépasser 100 caractères' })
        .optional(),
    bio: zod_1.z
        .string()
        .max(1000, { message: 'La biographie ne peut pas dépasser 1000 caractères' })
        .optional(),
    skills: zod_1.z
        .array(zod_1.z.string())
        .max(20, { message: 'Maximum 20 compétences autorisées' })
        .optional(),
    isFreelancer: zod_1.z
        .boolean()
        .optional()
        .default(false),
    avatar: zod_1.z
        .string()
        .url({ message: 'URL d\'avatar invalide' })
        .optional(),
    bioText: zod_1.z
        .string()
        .max(5000, { message: 'Le texte biographique ne peut pas dépasser 5000 caractères' })
        .optional(),
});
// Schéma pour le profil prestataire
exports.providerProfileSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(5, { message: 'Le titre doit contenir au moins 5 caractères' })
        .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
    description: zod_1.z
        .string()
        .min(50, { message: 'La description doit contenir au moins 50 caractères' })
        .max(1000, { message: 'La description ne peut pas dépasser 1000 caractères' }),
    experience: zod_1.z
        .number()
        .int()
        .min(0, { message: 'L\'expérience ne peut pas être négative' })
        .max(100, { message: 'L\'expérience ne peut pas dépasser 100 ans' }),
    hourlyRate: zod_1.z
        .number()
        .min(1000, { message: 'Le taux horaire minimum est de 1000 FCFA' })
        .max(100000, { message: 'Le taux horaire maximum est de 100000 FCFA' }),
    languages: zod_1.z
        .array(zod_1.z.string())
        .min(1, { message: 'Au moins une langue est requise' })
        .max(10, { message: 'Maximum 10 langues autorisées' }),
    responseTime: zod_1.z
        .string()
        .min(2, { message: 'Le temps de réponse doit contenir au moins 2 caractères' })
        .max(50, { message: 'Le temps de réponse ne peut pas dépasser 50 caractères' }),
    availability: zod_1.z
        .string()
        .min(2, { message: 'La disponibilité doit contenir au moins 2 caractères' })
        .max(100, { message: 'La disponibilité ne peut pas dépasser 100 caractères' }),
});
// Schéma pour les informations de paiement
exports.paymentInfoSchema = zod_1.z.object({
    accountType: zod_1.z
        .string()
        .min(2, { message: 'Le type de compte doit contenir au moins 2 caractères' })
        .max(50, { message: 'Le type de compte ne peut pas dépasser 50 caractères' })
        .optional(),
    accountName: zod_1.z
        .string()
        .min(2, { message: 'Le nom du compte doit contenir au moins 2 caractères' })
        .max(100, { message: 'Le nom du compte ne peut pas dépasser 100 caractères' })
        .optional(),
    accountNumber: zod_1.z
        .string()
        .min(5, { message: 'Le numéro de compte doit contenir au moins 5 caractères' })
        .max(50, { message: 'Le numéro de compte ne peut pas dépasser 50 caractères' })
        .optional(),
    bankName: zod_1.z
        .string()
        .min(2, { message: 'Le nom de la banque doit contenir au moins 2 caractères' })
        .max(100, { message: 'Le nom de la banque ne peut pas dépasser 100 caractères' })
        .optional(),
    swiftCode: zod_1.z
        .string()
        .min(8, { message: 'Le code SWIFT doit contenir au moins 8 caractères' })
        .max(11, { message: 'Le code SWIFT ne peut pas dépasser 11 caractères' })
        .optional(),
    mobileMoneyProvider: zod_1.z
        .string()
        .min(2, { message: 'Le fournisseur de mobile money doit contenir au moins 2 caractères' })
        .max(50, { message: 'Le fournisseur de mobile money ne peut pas dépasser 50 caractères' })
        .optional(),
    mobileMoneyNumber: zod_1.z
        .string()
        .min(8, { message: 'Le numéro de mobile money doit contenir au moins 8 caractères' })
        .max(20, { message: 'Le numéro de mobile money ne peut pas dépasser 20 caractères' })
        .optional(),
});
// Schéma pour les préférences de notification
exports.notificationPreferencesSchema = zod_1.z.object({
    email: zod_1.z.boolean().optional().default(true),
    sms: zod_1.z.boolean().optional().default(true),
    browserPush: zod_1.z.boolean().optional().default(true),
    orderUpdates: zod_1.z.boolean().optional().default(true),
    marketingEmails: zod_1.z.boolean().optional().default(true),
    newMessages: zod_1.z.boolean().optional().default(true),
});
// Schéma complet pour l'utilisateur
exports.fullUserSchema = exports.createUserSchema.extend({
    providerProfile: exports.providerProfileSchema.optional(),
    paymentInfo: exports.paymentInfoSchema.optional(),
    notificationPreferences: exports.notificationPreferencesSchema.optional(),
});
// Schéma pour la mise à jour de l'utilisateur (tous les champs sont optionnels)
exports.updateUserSchema = exports.createUserSchema
    .omit({ password: true }) // Exclure le mot de passe des mises à jour générales
    .extend({
    providerProfile: exports.providerProfileSchema.optional(),
    paymentInfo: exports.paymentInfoSchema.optional(),
    notificationPreferences: exports.notificationPreferencesSchema.optional(),
})
    .partial();
// Schéma pour le changement de mot de passe
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, { message: 'Le mot de passe actuel est requis' }),
    newPassword: zod_1.z
        .string()
        .min(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
        .max(100, { message: 'Le nouveau mot de passe ne peut pas dépasser 100 caractères' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre'
    }),
    confirmPassword: zod_1.z.string().min(1, { message: 'La confirmation du mot de passe est requise' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});
let User = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mongoose_2.Document;
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _firstName_extraInitializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _lastName_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _isEmailVerified_decorators;
    let _isEmailVerified_initializers = [];
    let _isEmailVerified_extraInitializers = [];
    let _isPhoneVerified_decorators;
    let _isPhoneVerified_initializers = [];
    let _isPhoneVerified_extraInitializers = [];
    let _phoneNumber_decorators;
    let _phoneNumber_initializers = [];
    let _phoneNumber_extraInitializers = [];
    let _refreshToken_decorators;
    let _refreshToken_initializers = [];
    let _refreshToken_extraInitializers = [];
    let _isTwoFactorEnabled_decorators;
    let _isTwoFactorEnabled_initializers = [];
    let _isTwoFactorEnabled_extraInitializers = [];
    let _twoFactorSecret_decorators;
    let _twoFactorSecret_initializers = [];
    let _twoFactorSecret_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _lastLoginAt_decorators;
    let _lastLoginAt_initializers = [];
    let _lastLoginAt_extraInitializers = [];
    var User = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _email_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true })];
            _password_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _firstName_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _lastName_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _role_decorators = [(0, mongoose_1.Prop)({ required: true, enum: user_role_enum_1.UserRole, default: user_role_enum_1.UserRole.CLIENT })];
            _isEmailVerified_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _isPhoneVerified_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _phoneNumber_decorators = [(0, mongoose_1.Prop)()];
            _refreshToken_decorators = [(0, mongoose_1.Prop)()];
            _isTwoFactorEnabled_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _twoFactorSecret_decorators = [(0, mongoose_1.Prop)()];
            _createdAt_decorators = [(0, mongoose_1.Prop)({ default: Date.now })];
            _updatedAt_decorators = [(0, mongoose_1.Prop)({ default: Date.now })];
            _lastLoginAt_decorators = [(0, mongoose_1.Prop)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _isEmailVerified_decorators, { kind: "field", name: "isEmailVerified", static: false, private: false, access: { has: obj => "isEmailVerified" in obj, get: obj => obj.isEmailVerified, set: (obj, value) => { obj.isEmailVerified = value; } }, metadata: _metadata }, _isEmailVerified_initializers, _isEmailVerified_extraInitializers);
            __esDecorate(null, null, _isPhoneVerified_decorators, { kind: "field", name: "isPhoneVerified", static: false, private: false, access: { has: obj => "isPhoneVerified" in obj, get: obj => obj.isPhoneVerified, set: (obj, value) => { obj.isPhoneVerified = value; } }, metadata: _metadata }, _isPhoneVerified_initializers, _isPhoneVerified_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: obj => "phoneNumber" in obj, get: obj => obj.phoneNumber, set: (obj, value) => { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: obj => "refreshToken" in obj, get: obj => obj.refreshToken, set: (obj, value) => { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            __esDecorate(null, null, _isTwoFactorEnabled_decorators, { kind: "field", name: "isTwoFactorEnabled", static: false, private: false, access: { has: obj => "isTwoFactorEnabled" in obj, get: obj => obj.isTwoFactorEnabled, set: (obj, value) => { obj.isTwoFactorEnabled = value; } }, metadata: _metadata }, _isTwoFactorEnabled_initializers, _isTwoFactorEnabled_extraInitializers);
            __esDecorate(null, null, _twoFactorSecret_decorators, { kind: "field", name: "twoFactorSecret", static: false, private: false, access: { has: obj => "twoFactorSecret" in obj, get: obj => obj.twoFactorSecret, set: (obj, value) => { obj.twoFactorSecret = value; } }, metadata: _metadata }, _twoFactorSecret_initializers, _twoFactorSecret_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, null, _lastLoginAt_decorators, { kind: "field", name: "lastLoginAt", static: false, private: false, access: { has: obj => "lastLoginAt" in obj, get: obj => obj.lastLoginAt, set: (obj, value) => { obj.lastLoginAt = value; } }, metadata: _metadata }, _lastLoginAt_initializers, _lastLoginAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            User = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        email = __runInitializers(this, _email_initializers, void 0);
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        firstName = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _firstName_initializers, void 0));
        lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
        role = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        isEmailVerified = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _isEmailVerified_initializers, void 0));
        isPhoneVerified = (__runInitializers(this, _isEmailVerified_extraInitializers), __runInitializers(this, _isPhoneVerified_initializers, void 0));
        phoneNumber = (__runInitializers(this, _isPhoneVerified_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
        refreshToken = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _refreshToken_initializers, void 0));
        isTwoFactorEnabled = (__runInitializers(this, _refreshToken_extraInitializers), __runInitializers(this, _isTwoFactorEnabled_initializers, void 0));
        twoFactorSecret = (__runInitializers(this, _isTwoFactorEnabled_extraInitializers), __runInitializers(this, _twoFactorSecret_initializers, void 0));
        createdAt = (__runInitializers(this, _twoFactorSecret_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        lastLoginAt = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _lastLoginAt_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _lastLoginAt_extraInitializers);
        }
    };
    return User = _classThis;
})();
exports.User = User;
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
