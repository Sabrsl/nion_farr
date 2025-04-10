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
exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
let RegisterDto = (() => {
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _firstName_extraInitializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _lastName_extraInitializers = [];
    let _phoneNumber_decorators;
    let _phoneNumber_initializers = [];
    let _phoneNumber_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _passwordConfirm_decorators;
    let _passwordConfirm_initializers = [];
    let _passwordConfirm_extraInitializers = [];
    let _termsAccepted_decorators;
    let _termsAccepted_initializers = [];
    let _termsAccepted_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _isFreelancer_decorators;
    let _isFreelancer_initializers = [];
    let _isFreelancer_extraInitializers = [];
    return class RegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'john.doe@example.com',
                    description: 'Adresse email de l\'utilisateur',
                }), (0, class_validator_1.IsEmail)({}, { message: 'Veuillez fournir une adresse email valide' }), (0, class_validator_1.IsNotEmpty)({ message: 'L\'email est requis' })];
            _firstName_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'John',
                    description: 'Prénom de l\'utilisateur',
                }), (0, class_validator_1.IsString)({ message: 'Le prénom doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'Le prénom est requis' })];
            _lastName_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'Doe',
                    description: 'Nom de famille de l\'utilisateur',
                }), (0, class_validator_1.IsString)({ message: 'Le nom doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'Le nom est requis' })];
            _phoneNumber_decorators = [(0, swagger_1.ApiProperty)({
                    example: '+221777777777',
                    description: 'Numéro de téléphone (optionnel)',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'Le numéro de téléphone doit être une chaîne de caractères' })];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'StrongP@ssw0rd123',
                    description: 'Mot de passe (minimum 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial)',
                }), (0, class_validator_1.IsString)({ message: 'Le mot de passe doit être une chaîne de caractères' }), (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }), (0, class_validator_1.Matches)(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
                    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre ou un caractère spécial',
                })];
            _passwordConfirm_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'StrongP@ssw0rd123',
                    description: 'Confirmation du mot de passe',
                }), (0, class_validator_1.IsString)({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'La confirmation du mot de passe est requise' })];
            _termsAccepted_decorators = [(0, swagger_1.ApiProperty)({
                    example: true,
                    description: 'Acceptation des conditions d\'utilisation',
                    default: false,
                }), (0, class_validator_1.IsNotEmpty)({ message: 'Vous devez accepter les conditions d\'utilisation' })];
            _role_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Rôle de l\'utilisateur',
                    enum: user_role_enum_1.UserRole,
                    default: user_role_enum_1.UserRole.CLIENT,
                }), (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole), (0, class_validator_1.IsOptional)()];
            _isFreelancer_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Indique si l\'utilisateur souhaite devenir freelance',
                    example: false,
                    default: false,
                }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: obj => "phoneNumber" in obj, get: obj => obj.phoneNumber, set: (obj, value) => { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _passwordConfirm_decorators, { kind: "field", name: "passwordConfirm", static: false, private: false, access: { has: obj => "passwordConfirm" in obj, get: obj => obj.passwordConfirm, set: (obj, value) => { obj.passwordConfirm = value; } }, metadata: _metadata }, _passwordConfirm_initializers, _passwordConfirm_extraInitializers);
            __esDecorate(null, null, _termsAccepted_decorators, { kind: "field", name: "termsAccepted", static: false, private: false, access: { has: obj => "termsAccepted" in obj, get: obj => obj.termsAccepted, set: (obj, value) => { obj.termsAccepted = value; } }, metadata: _metadata }, _termsAccepted_initializers, _termsAccepted_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _isFreelancer_decorators, { kind: "field", name: "isFreelancer", static: false, private: false, access: { has: obj => "isFreelancer" in obj, get: obj => obj.isFreelancer, set: (obj, value) => { obj.isFreelancer = value; } }, metadata: _metadata }, _isFreelancer_initializers, _isFreelancer_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        firstName = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _firstName_initializers, void 0));
        lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
        phoneNumber = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
        password = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        passwordConfirm = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _passwordConfirm_initializers, void 0));
        termsAccepted = (__runInitializers(this, _passwordConfirm_extraInitializers), __runInitializers(this, _termsAccepted_initializers, void 0));
        role = (__runInitializers(this, _termsAccepted_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        isFreelancer = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _isFreelancer_initializers, void 0));
        constructor() {
            __runInitializers(this, _isFreelancer_extraInitializers);
        }
    };
})();
exports.RegisterDto = RegisterDto;
