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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
let UserService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UserService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UserService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userModel;
        constructor(userModel) {
            this.userModel = userModel;
        }
        async create(createUserDto) {
            // Vérifier si l'email existe déjà
            const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
            if (existingUser) {
                throw new common_1.ConflictException('Un utilisateur avec cette adresse email existe déjà');
            }
            // Vérifier si le nom d'utilisateur existe déjà (s'il est fourni)
            if (createUserDto.username) {
                const existingUsername = await this.userModel.findOne({ username: createUserDto.username }).exec();
                if (existingUsername) {
                    throw new common_1.ConflictException('Ce nom d\'utilisateur est déjà pris');
                }
            }
            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            // Créer le nouvel utilisateur
            const newUser = new this.userModel({
                ...createUserDto,
                password: hashedPassword,
                memberSince: new Date(),
            });
            // Sauvegarder et retourner l'utilisateur
            return newUser.save();
        }
        async findAll() {
            return this.userModel.find().select('-password').exec();
        }
        async findOne(id) {
            const user = await this.userModel.findById(id).select('-password').exec();
            if (!user) {
                throw new common_1.NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
            }
            return user;
        }
        async findByEmail(email) {
            return this.userModel.findOne({ email }).exec();
        }
        async findByUsername(username) {
            return this.userModel.findOne({ username }).exec();
        }
        async update(id, updateUserDto) {
            // Vérifier si l'utilisateur existe
            const existingUser = await this.userModel.findById(id).exec();
            if (!existingUser) {
                throw new common_1.NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
            }
            // Si le mot de passe est fourni, le hacher
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            // Mettre à jour l'utilisateur
            const updatedUser = await this.userModel
                .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
                .select('-password')
                .exec();
            return updatedUser;
        }
        async remove(id) {
            const result = await this.userModel.deleteOne({ _id: id }).exec();
            if (result.deletedCount === 0) {
                throw new common_1.NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
            }
            return { deleted: true, message: `Utilisateur avec ID "${id}" supprimé avec succès` };
        }
        async validatePassword(email, password) {
            const user = await this.userModel.findOne({ email }).exec();
            if (!user) {
                return null;
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return null;
            }
            return user;
        }
    };
    return UserService = _classThis;
})();
exports.UserService = UserService;
