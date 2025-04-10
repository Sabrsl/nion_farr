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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_role_enum_1 = require("./enums/user-role.enum");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usersRepository;
        constructor(usersRepository) {
            this.usersRepository = usersRepository;
        }
        async findAll() {
            return this.usersRepository.find();
        }
        async findOne(id) {
            const user = await this.usersRepository.findOne({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        }
        async findByEmail(email) {
            return this.usersRepository.findOne({ where: { email } });
        }
        async findByRole(role) {
            return this.usersRepository.find({ where: { role } });
        }
        async create(user) {
            // Vérifier si l'email existe déjà
            const existingUser = await this.findByEmail(user.email);
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
            // Hash du mot de passe avant de sauvegarder
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            return this.usersRepository.save(user);
        }
        async update(id, updatedUser) {
            const user = await this.findOne(id);
            // Si on essaie de changer l'email, vérifier qu'il n'existe pas déjà
            if (updatedUser.email && updatedUser.email !== user.email) {
                const existingUser = await this.findByEmail(updatedUser.email);
                if (existingUser && existingUser.id !== id) {
                    throw new common_1.ConflictException('Email already exists');
                }
            }
            // Ne pas mettre à jour le mot de passe via cette méthode
            if (updatedUser.password) {
                delete updatedUser.password;
            }
            await this.usersRepository.update(id, updatedUser);
            return this.findOne(id);
        }
        async remove(id) {
            const result = await this.usersRepository.delete(id);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
        }
        async changePassword(userId, changePasswordDto) {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'password'] // S'assurer qu'on récupère le mot de passe hashé
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            // Vérifier l'ancien mot de passe
            const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            // Hash et mettre à jour le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
            await this.usersRepository.update(userId, { password: hashedPassword });
        }
        async findFreelancers() {
            return this.usersRepository.find({
                where: {
                    isFreelancer: true,
                    isActive: true
                },
                order: {
                    rating: 'DESC'
                }
            });
        }
        /**
         * Compte le nombre d'utilisateurs par rôle
         * @param role Rôle optionnel pour filtrer les utilisateurs
         * @returns Nombre d'utilisateurs
         */
        async countByRole(role) {
            try {
                const query = {
                    isActive: true // Compter seulement les utilisateurs actifs
                };
                // Si un rôle est spécifié, filtrer par ce rôle
                if (role) {
                    if (role === 'provider' || role === 'freelancer') {
                        query.isFreelancer = true;
                    }
                    else if (role === 'client') {
                        query.role = user_role_enum_1.UserRole.CLIENT;
                    }
                    else {
                        query.role = role;
                    }
                }
                const count = await this.usersRepository.count({ where: query });
                return { count };
            }
            catch (error) {
                console.error('Error counting users by role:', error);
                return { count: 0 };
            }
        }
    };
    return UsersService = _classThis;
})();
exports.UsersService = UsersService;
