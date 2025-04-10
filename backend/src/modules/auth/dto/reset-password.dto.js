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
exports.ResetPasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
let ResetPasswordDto = (() => {
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    let _newPassword_decorators;
    let _newPassword_initializers = [];
    let _newPassword_extraInitializers = [];
    let _passwordConfirmation_decorators;
    let _passwordConfirmation_initializers = [];
    let _passwordConfirmation_extraInitializers = [];
    return class ResetPasswordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _token_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    description: 'Token de réinitialisation de mot de passe',
                }), (0, class_validator_1.IsString)({ message: 'Le token doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'Le token est requis' })];
            _newPassword_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'StrongP@ssw0rd123',
                    description: 'Nouveau mot de passe',
                }), (0, class_validator_1.IsString)({ message: 'Le mot de passe doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'Le mot de passe est requis' }), (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }), (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
                    message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
                })];
            _passwordConfirmation_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'StrongP@ssw0rd123',
                    description: 'Confirmation du nouveau mot de passe',
                }), (0, class_validator_1.IsString)({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' }), (0, class_validator_1.IsNotEmpty)({ message: 'La confirmation du mot de passe est requise' })];
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            __esDecorate(null, null, _newPassword_decorators, { kind: "field", name: "newPassword", static: false, private: false, access: { has: obj => "newPassword" in obj, get: obj => obj.newPassword, set: (obj, value) => { obj.newPassword = value; } }, metadata: _metadata }, _newPassword_initializers, _newPassword_extraInitializers);
            __esDecorate(null, null, _passwordConfirmation_decorators, { kind: "field", name: "passwordConfirmation", static: false, private: false, access: { has: obj => "passwordConfirmation" in obj, get: obj => obj.passwordConfirmation, set: (obj, value) => { obj.passwordConfirmation = value; } }, metadata: _metadata }, _passwordConfirmation_initializers, _passwordConfirmation_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        token = __runInitializers(this, _token_initializers, void 0);
        newPassword = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _newPassword_initializers, void 0));
        passwordConfirmation = (__runInitializers(this, _newPassword_extraInitializers), __runInitializers(this, _passwordConfirmation_initializers, void 0));
        constructor() {
            __runInitializers(this, _passwordConfirmation_extraInitializers);
        }
    };
})();
exports.ResetPasswordDto = ResetPasswordDto;
