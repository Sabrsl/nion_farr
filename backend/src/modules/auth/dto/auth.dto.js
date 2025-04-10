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
exports.VerifyTwoFactorDto = exports.EnableTwoFactorDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.LoginDto = exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
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
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    return class RegisterDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }), (0, class_validator_1.IsEmail)()];
            _firstName_decorators = [(0, swagger_1.ApiProperty)({ example: 'John' }), (0, class_validator_1.IsString)()];
            _lastName_decorators = [(0, swagger_1.ApiProperty)({ example: 'Doe' }), (0, class_validator_1.IsString)()];
            _password_decorators = [(0, swagger_1.ApiProperty)({ example: 'Password123!' }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(8)];
            _role_decorators = [(0, swagger_1.ApiProperty)({ example: 'CLIENT' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        firstName = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _firstName_initializers, void 0));
        lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
        password = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        role = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        constructor() {
            __runInitializers(this, _role_extraInitializers);
        }
    };
})();
exports.RegisterDto = RegisterDto;
let LoginDto = (() => {
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _rememberMe_decorators;
    let _rememberMe_initializers = [];
    let _rememberMe_extraInitializers = [];
    return class LoginDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }), (0, class_validator_1.IsEmail)()];
            _password_decorators = [(0, swagger_1.ApiProperty)({ example: 'Password123!' }), (0, class_validator_1.IsString)()];
            _rememberMe_decorators = [(0, swagger_1.ApiProperty)({ example: true, required: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _rememberMe_decorators, { kind: "field", name: "rememberMe", static: false, private: false, access: { has: obj => "rememberMe" in obj, get: obj => obj.rememberMe, set: (obj, value) => { obj.rememberMe = value; } }, metadata: _metadata }, _rememberMe_initializers, _rememberMe_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        rememberMe = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _rememberMe_initializers, void 0));
        constructor() {
            __runInitializers(this, _rememberMe_extraInitializers);
        }
    };
})();
exports.LoginDto = LoginDto;
let ForgotPasswordDto = (() => {
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    return class ForgotPasswordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }), (0, class_validator_1.IsEmail)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        email = __runInitializers(this, _email_initializers, void 0);
        constructor() {
            __runInitializers(this, _email_extraInitializers);
        }
    };
})();
exports.ForgotPasswordDto = ForgotPasswordDto;
let ResetPasswordDto = (() => {
    let _token_decorators;
    let _token_initializers = [];
    let _token_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    return class ResetPasswordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _token_decorators = [(0, swagger_1.ApiProperty)({ example: 'reset-token-123' }), (0, class_validator_1.IsString)()];
            _password_decorators = [(0, swagger_1.ApiProperty)({ example: 'NewPassword123!' }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(8)];
            __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: obj => "token" in obj, get: obj => obj.token, set: (obj, value) => { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        token = __runInitializers(this, _token_initializers, void 0);
        password = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        constructor() {
            __runInitializers(this, _password_extraInitializers);
        }
    };
})();
exports.ResetPasswordDto = ResetPasswordDto;
let EnableTwoFactorDto = (() => {
    let _twoFactorCode_decorators;
    let _twoFactorCode_initializers = [];
    let _twoFactorCode_extraInitializers = [];
    return class EnableTwoFactorDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _twoFactorCode_decorators = [(0, swagger_1.ApiProperty)({ example: '123456' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _twoFactorCode_decorators, { kind: "field", name: "twoFactorCode", static: false, private: false, access: { has: obj => "twoFactorCode" in obj, get: obj => obj.twoFactorCode, set: (obj, value) => { obj.twoFactorCode = value; } }, metadata: _metadata }, _twoFactorCode_initializers, _twoFactorCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        twoFactorCode = __runInitializers(this, _twoFactorCode_initializers, void 0);
        constructor() {
            __runInitializers(this, _twoFactorCode_extraInitializers);
        }
    };
})();
exports.EnableTwoFactorDto = EnableTwoFactorDto;
let VerifyTwoFactorDto = (() => {
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _twoFactorCode_decorators;
    let _twoFactorCode_initializers = [];
    let _twoFactorCode_extraInitializers = [];
    return class VerifyTwoFactorDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _userId_decorators = [(0, swagger_1.ApiProperty)({ example: 'user-id-123' }), (0, class_validator_1.IsString)()];
            _twoFactorCode_decorators = [(0, swagger_1.ApiProperty)({ example: '123456' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _twoFactorCode_decorators, { kind: "field", name: "twoFactorCode", static: false, private: false, access: { has: obj => "twoFactorCode" in obj, get: obj => obj.twoFactorCode, set: (obj, value) => { obj.twoFactorCode = value; } }, metadata: _metadata }, _twoFactorCode_initializers, _twoFactorCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        userId = __runInitializers(this, _userId_initializers, void 0);
        twoFactorCode = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _twoFactorCode_initializers, void 0));
        constructor() {
            __runInitializers(this, _twoFactorCode_extraInitializers);
        }
    };
})();
exports.VerifyTwoFactorDto = VerifyTwoFactorDto;
