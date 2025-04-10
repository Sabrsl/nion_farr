"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../users/enums/user-role.enum");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersRepository;
        jwtService;
        configService;
        constructor(usersRepository, jwtService, configService) {
            this.usersRepository = usersRepository;
            this.jwtService = jwtService;
            this.configService = configService;
        }
        async register(registerDto) {
            const { email, password, passwordConfirm, firstName, lastName, role, isFreelancer } = registerDto;
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await this.usersRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new common_1.ConflictException('Cet email est déjà utilisé');
            }
            // Vérifier que les mots de passe correspondent
            if (password !== passwordConfirm) {
                throw new common_1.BadRequestException('Les mots de passe ne correspondent pas');
            }
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
            // Générer un username à partir du prénom et nom
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
            // Créer un nouvel utilisateur
            const newUser = new user_entity_1.User({
                email,
                firstName,
                lastName,
                password: hashedPassword,
                username,
                isActive: true,
                status: user_entity_1.UserStatus.PENDING_VERIFICATION,
                role: role || user_role_enum_1.UserRole.CLIENT,
                isFreelancer: isFreelancer || false,
                emailVerificationToken: Math.random().toString(36).substring(2, 15),
            });
            // Sauvegarder l'utilisateur
            const savedUser = await this.usersRepository.save(newUser);
            // Retourner l'utilisateur sans le mot de passe et le token
            const { password: _, emailVerificationToken: __, ...result } = savedUser;
            return {
                message: 'Inscription réussie',
                user: result,
            };
        }
        async login(loginDto) {
            const { email, password } = loginDto;
            // Trouver l'utilisateur par email
            const user = await this.usersRepository.findOne({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    role: true,
                    isFreelancer: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    isActive: true,
                    status: true
                }
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
            }
            // Vérifier le mot de passe
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
            }
            // Vérifier si l'utilisateur est actif
            if (user.status !== user_entity_1.UserStatus.ACTIVE && user.status !== user_entity_1.UserStatus.PENDING_VERIFICATION) {
                throw new common_1.UnauthorizedException('Votre compte est désactivé');
            }
            // Générer les tokens
            const tokens = this.generateTokens(user);
            // Retourner l'utilisateur connecté avec les tokens
            const { password: _, ...result } = user;
            return {
                message: 'Connexion réussie',
                ...tokens,
                user: result,
            };
        }
        async refreshToken(refreshTokenDto) {
            try {
                const { refreshToken } = refreshTokenDto;
                if (!refreshToken) {
                    throw new common_1.UnauthorizedException('Token de rafraîchissement non fourni');
                }
                // Vérifier la validité du token de rafraîchissement
                const payload = this.jwtService.verify(refreshToken, {
                    secret: this.configService.get('JWT_REFRESH_SECRET'),
                });
                // Trouver l'utilisateur
                const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
                if (!user || user.status !== user_entity_1.UserStatus.ACTIVE) {
                    throw new common_1.UnauthorizedException('Utilisateur non trouvé ou inactif');
                }
                // Générer de nouveaux tokens
                const tokens = this.generateTokens(user);
                return {
                    message: 'Tokens renouvelés avec succès',
                    ...tokens,
                };
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Token de rafraîchissement invalide ou expiré');
            }
        }
        /**
         * Génère les tokens JWT pour l'authentification
         * @param user Utilisateur pour lequel générer les tokens
         * @returns Tokens JWT (access et refresh)
         */
        generateTokens(user) {
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                isFreelancer: user.isFreelancer
            };
            const accessToken = this.jwtService.sign(payload, {
                expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
                secret: this.configService.get('JWT_SECRET')
            });
            const refreshToken = this.jwtService.sign(payload, {
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
                secret: this.configService.get('JWT_REFRESH_SECRET')
            });
            return { accessToken, refreshToken };
        }
    };
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
