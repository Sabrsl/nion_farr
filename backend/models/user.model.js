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
exports.UserSchema = exports.User = exports.UserStatus = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["PROVIDER"] = "provider";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({
            timestamps: true,
            toJSON: {
                virtuals: true,
                transform: (doc, ret) => {
                    delete ret.password;
                    delete ret.__v;
                    ret.id = ret._id;
                    delete ret._id;
                    return ret;
                },
            },
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mongoose_2.Document;
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _firstName_extraInitializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _lastName_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _password_extraInitializers = [];
    let _username_decorators;
    let _username_initializers = [];
    let _username_extraInitializers = [];
    let _role_decorators;
    let _role_initializers = [];
    let _role_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _city_decorators;
    let _city_initializers = [];
    let _city_extraInitializers = [];
    let _country_decorators;
    let _country_initializers = [];
    let _country_extraInitializers = [];
    let _avatar_decorators;
    let _avatar_initializers = [];
    let _avatar_extraInitializers = [];
    let _bio_decorators;
    let _bio_initializers = [];
    let _bio_extraInitializers = [];
    let _skills_decorators;
    let _skills_initializers = [];
    let _skills_extraInitializers = [];
    let _isEmailVerified_decorators;
    let _isEmailVerified_initializers = [];
    let _isEmailVerified_extraInitializers = [];
    let _isPhoneVerified_decorators;
    let _isPhoneVerified_initializers = [];
    let _isPhoneVerified_extraInitializers = [];
    let _isIdentityVerified_decorators;
    let _isIdentityVerified_initializers = [];
    let _isIdentityVerified_extraInitializers = [];
    let _emailVerificationToken_decorators;
    let _emailVerificationToken_initializers = [];
    let _emailVerificationToken_extraInitializers = [];
    let _phoneVerificationCode_decorators;
    let _phoneVerificationCode_initializers = [];
    let _phoneVerificationCode_extraInitializers = [];
    let _resetPasswordToken_decorators;
    let _resetPasswordToken_initializers = [];
    let _resetPasswordToken_extraInitializers = [];
    let _resetPasswordExpires_decorators;
    let _resetPasswordExpires_initializers = [];
    let _resetPasswordExpires_extraInitializers = [];
    let _lastLogin_decorators;
    let _lastLogin_initializers = [];
    let _lastLogin_extraInitializers = [];
    let _twoFactorAuthEnabled_decorators;
    let _twoFactorAuthEnabled_initializers = [];
    let _twoFactorAuthEnabled_extraInitializers = [];
    let _twoFactorAuthSecret_decorators;
    let _twoFactorAuthSecret_initializers = [];
    let _twoFactorAuthSecret_extraInitializers = [];
    let _providerProfile_decorators;
    let _providerProfile_initializers = [];
    let _providerProfile_extraInitializers = [];
    let _completedOrders_decorators;
    let _completedOrders_initializers = [];
    let _completedOrders_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _totalReviews_decorators;
    let _totalReviews_initializers = [];
    let _totalReviews_extraInitializers = [];
    let _memberSince_decorators;
    let _memberSince_initializers = [];
    let _memberSince_extraInitializers = [];
    let _paymentInfo_decorators;
    let _paymentInfo_initializers = [];
    let _paymentInfo_extraInitializers = [];
    let _notificationPreferences_decorators;
    let _notificationPreferences_initializers = [];
    let _notificationPreferences_extraInitializers = [];
    var User = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _firstName_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _lastName_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _email_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true })];
            _password_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _username_decorators = [(0, mongoose_1.Prop)({ unique: true, sparse: true })];
            _role_decorators = [(0, mongoose_1.Prop)({ default: UserRole.CLIENT, enum: Object.values(UserRole) })];
            _status_decorators = [(0, mongoose_1.Prop)({ default: UserStatus.PENDING_VERIFICATION, enum: Object.values(UserStatus) })];
            _phone_decorators = [(0, mongoose_1.Prop)()];
            _address_decorators = [(0, mongoose_1.Prop)()];
            _city_decorators = [(0, mongoose_1.Prop)()];
            _country_decorators = [(0, mongoose_1.Prop)()];
            _avatar_decorators = [(0, mongoose_1.Prop)()];
            _bio_decorators = [(0, mongoose_1.Prop)()];
            _skills_decorators = [(0, mongoose_1.Prop)([String])];
            _isEmailVerified_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _isPhoneVerified_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _isIdentityVerified_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _emailVerificationToken_decorators = [(0, mongoose_1.Prop)()];
            _phoneVerificationCode_decorators = [(0, mongoose_1.Prop)()];
            _resetPasswordToken_decorators = [(0, mongoose_1.Prop)()];
            _resetPasswordExpires_decorators = [(0, mongoose_1.Prop)()];
            _lastLogin_decorators = [(0, mongoose_1.Prop)()];
            _twoFactorAuthEnabled_decorators = [(0, mongoose_1.Prop)({ default: false })];
            _twoFactorAuthSecret_decorators = [(0, mongoose_1.Prop)()];
            _providerProfile_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _completedOrders_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _rating_decorators = [(0, mongoose_1.Prop)({ default: 0, min: 0, max: 5 })];
            _totalReviews_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
            _memberSince_decorators = [(0, mongoose_1.Prop)()];
            _paymentInfo_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed })];
            _notificationPreferences_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, default: {} })];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: obj => "username" in obj, get: obj => obj.username, set: (obj, value) => { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: obj => "role" in obj, get: obj => obj.role, set: (obj, value) => { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: obj => "city" in obj, get: obj => obj.city, set: (obj, value) => { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: obj => "country" in obj, get: obj => obj.country, set: (obj, value) => { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
            __esDecorate(null, null, _avatar_decorators, { kind: "field", name: "avatar", static: false, private: false, access: { has: obj => "avatar" in obj, get: obj => obj.avatar, set: (obj, value) => { obj.avatar = value; } }, metadata: _metadata }, _avatar_initializers, _avatar_extraInitializers);
            __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: obj => "bio" in obj, get: obj => obj.bio, set: (obj, value) => { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
            __esDecorate(null, null, _skills_decorators, { kind: "field", name: "skills", static: false, private: false, access: { has: obj => "skills" in obj, get: obj => obj.skills, set: (obj, value) => { obj.skills = value; } }, metadata: _metadata }, _skills_initializers, _skills_extraInitializers);
            __esDecorate(null, null, _isEmailVerified_decorators, { kind: "field", name: "isEmailVerified", static: false, private: false, access: { has: obj => "isEmailVerified" in obj, get: obj => obj.isEmailVerified, set: (obj, value) => { obj.isEmailVerified = value; } }, metadata: _metadata }, _isEmailVerified_initializers, _isEmailVerified_extraInitializers);
            __esDecorate(null, null, _isPhoneVerified_decorators, { kind: "field", name: "isPhoneVerified", static: false, private: false, access: { has: obj => "isPhoneVerified" in obj, get: obj => obj.isPhoneVerified, set: (obj, value) => { obj.isPhoneVerified = value; } }, metadata: _metadata }, _isPhoneVerified_initializers, _isPhoneVerified_extraInitializers);
            __esDecorate(null, null, _isIdentityVerified_decorators, { kind: "field", name: "isIdentityVerified", static: false, private: false, access: { has: obj => "isIdentityVerified" in obj, get: obj => obj.isIdentityVerified, set: (obj, value) => { obj.isIdentityVerified = value; } }, metadata: _metadata }, _isIdentityVerified_initializers, _isIdentityVerified_extraInitializers);
            __esDecorate(null, null, _emailVerificationToken_decorators, { kind: "field", name: "emailVerificationToken", static: false, private: false, access: { has: obj => "emailVerificationToken" in obj, get: obj => obj.emailVerificationToken, set: (obj, value) => { obj.emailVerificationToken = value; } }, metadata: _metadata }, _emailVerificationToken_initializers, _emailVerificationToken_extraInitializers);
            __esDecorate(null, null, _phoneVerificationCode_decorators, { kind: "field", name: "phoneVerificationCode", static: false, private: false, access: { has: obj => "phoneVerificationCode" in obj, get: obj => obj.phoneVerificationCode, set: (obj, value) => { obj.phoneVerificationCode = value; } }, metadata: _metadata }, _phoneVerificationCode_initializers, _phoneVerificationCode_extraInitializers);
            __esDecorate(null, null, _resetPasswordToken_decorators, { kind: "field", name: "resetPasswordToken", static: false, private: false, access: { has: obj => "resetPasswordToken" in obj, get: obj => obj.resetPasswordToken, set: (obj, value) => { obj.resetPasswordToken = value; } }, metadata: _metadata }, _resetPasswordToken_initializers, _resetPasswordToken_extraInitializers);
            __esDecorate(null, null, _resetPasswordExpires_decorators, { kind: "field", name: "resetPasswordExpires", static: false, private: false, access: { has: obj => "resetPasswordExpires" in obj, get: obj => obj.resetPasswordExpires, set: (obj, value) => { obj.resetPasswordExpires = value; } }, metadata: _metadata }, _resetPasswordExpires_initializers, _resetPasswordExpires_extraInitializers);
            __esDecorate(null, null, _lastLogin_decorators, { kind: "field", name: "lastLogin", static: false, private: false, access: { has: obj => "lastLogin" in obj, get: obj => obj.lastLogin, set: (obj, value) => { obj.lastLogin = value; } }, metadata: _metadata }, _lastLogin_initializers, _lastLogin_extraInitializers);
            __esDecorate(null, null, _twoFactorAuthEnabled_decorators, { kind: "field", name: "twoFactorAuthEnabled", static: false, private: false, access: { has: obj => "twoFactorAuthEnabled" in obj, get: obj => obj.twoFactorAuthEnabled, set: (obj, value) => { obj.twoFactorAuthEnabled = value; } }, metadata: _metadata }, _twoFactorAuthEnabled_initializers, _twoFactorAuthEnabled_extraInitializers);
            __esDecorate(null, null, _twoFactorAuthSecret_decorators, { kind: "field", name: "twoFactorAuthSecret", static: false, private: false, access: { has: obj => "twoFactorAuthSecret" in obj, get: obj => obj.twoFactorAuthSecret, set: (obj, value) => { obj.twoFactorAuthSecret = value; } }, metadata: _metadata }, _twoFactorAuthSecret_initializers, _twoFactorAuthSecret_extraInitializers);
            __esDecorate(null, null, _providerProfile_decorators, { kind: "field", name: "providerProfile", static: false, private: false, access: { has: obj => "providerProfile" in obj, get: obj => obj.providerProfile, set: (obj, value) => { obj.providerProfile = value; } }, metadata: _metadata }, _providerProfile_initializers, _providerProfile_extraInitializers);
            __esDecorate(null, null, _completedOrders_decorators, { kind: "field", name: "completedOrders", static: false, private: false, access: { has: obj => "completedOrders" in obj, get: obj => obj.completedOrders, set: (obj, value) => { obj.completedOrders = value; } }, metadata: _metadata }, _completedOrders_initializers, _completedOrders_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _totalReviews_decorators, { kind: "field", name: "totalReviews", static: false, private: false, access: { has: obj => "totalReviews" in obj, get: obj => obj.totalReviews, set: (obj, value) => { obj.totalReviews = value; } }, metadata: _metadata }, _totalReviews_initializers, _totalReviews_extraInitializers);
            __esDecorate(null, null, _memberSince_decorators, { kind: "field", name: "memberSince", static: false, private: false, access: { has: obj => "memberSince" in obj, get: obj => obj.memberSince, set: (obj, value) => { obj.memberSince = value; } }, metadata: _metadata }, _memberSince_initializers, _memberSince_extraInitializers);
            __esDecorate(null, null, _paymentInfo_decorators, { kind: "field", name: "paymentInfo", static: false, private: false, access: { has: obj => "paymentInfo" in obj, get: obj => obj.paymentInfo, set: (obj, value) => { obj.paymentInfo = value; } }, metadata: _metadata }, _paymentInfo_initializers, _paymentInfo_extraInitializers);
            __esDecorate(null, null, _notificationPreferences_decorators, { kind: "field", name: "notificationPreferences", static: false, private: false, access: { has: obj => "notificationPreferences" in obj, get: obj => obj.notificationPreferences, set: (obj, value) => { obj.notificationPreferences = value; } }, metadata: _metadata }, _notificationPreferences_initializers, _notificationPreferences_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            User = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        firstName = __runInitializers(this, _firstName_initializers, void 0);
        lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
        email = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _email_initializers, void 0));
        password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
        username = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _username_initializers, void 0));
        role = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _role_initializers, void 0));
        status = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _status_initializers, void 0));
        phone = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
        address = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _address_initializers, void 0));
        city = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _city_initializers, void 0));
        country = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _country_initializers, void 0));
        avatar = (__runInitializers(this, _country_extraInitializers), __runInitializers(this, _avatar_initializers, void 0));
        bio = (__runInitializers(this, _avatar_extraInitializers), __runInitializers(this, _bio_initializers, void 0));
        skills = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _skills_initializers, void 0));
        isEmailVerified = (__runInitializers(this, _skills_extraInitializers), __runInitializers(this, _isEmailVerified_initializers, void 0));
        isPhoneVerified = (__runInitializers(this, _isEmailVerified_extraInitializers), __runInitializers(this, _isPhoneVerified_initializers, void 0));
        isIdentityVerified = (__runInitializers(this, _isPhoneVerified_extraInitializers), __runInitializers(this, _isIdentityVerified_initializers, void 0));
        emailVerificationToken = (__runInitializers(this, _isIdentityVerified_extraInitializers), __runInitializers(this, _emailVerificationToken_initializers, void 0));
        phoneVerificationCode = (__runInitializers(this, _emailVerificationToken_extraInitializers), __runInitializers(this, _phoneVerificationCode_initializers, void 0));
        resetPasswordToken = (__runInitializers(this, _phoneVerificationCode_extraInitializers), __runInitializers(this, _resetPasswordToken_initializers, void 0));
        resetPasswordExpires = (__runInitializers(this, _resetPasswordToken_extraInitializers), __runInitializers(this, _resetPasswordExpires_initializers, void 0));
        lastLogin = (__runInitializers(this, _resetPasswordExpires_extraInitializers), __runInitializers(this, _lastLogin_initializers, void 0));
        twoFactorAuthEnabled = (__runInitializers(this, _lastLogin_extraInitializers), __runInitializers(this, _twoFactorAuthEnabled_initializers, void 0));
        twoFactorAuthSecret = (__runInitializers(this, _twoFactorAuthEnabled_extraInitializers), __runInitializers(this, _twoFactorAuthSecret_initializers, void 0));
        // Champs spécifiques pour les prestataires (freelancers)
        providerProfile = (__runInitializers(this, _twoFactorAuthSecret_extraInitializers), __runInitializers(this, _providerProfile_initializers, void 0));
        // Champs pour les statistiques et évaluations
        completedOrders = (__runInitializers(this, _providerProfile_extraInitializers), __runInitializers(this, _completedOrders_initializers, void 0));
        rating = (__runInitializers(this, _completedOrders_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
        totalReviews = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _totalReviews_initializers, void 0));
        memberSince = (__runInitializers(this, _totalReviews_extraInitializers), __runInitializers(this, _memberSince_initializers, void 0));
        // Champs pour la gestion des paiements
        paymentInfo = (__runInitializers(this, _memberSince_extraInitializers), __runInitializers(this, _paymentInfo_initializers, void 0));
        // Préférences de notification
        notificationPreferences = (__runInitializers(this, _paymentInfo_extraInitializers), __runInitializers(this, _notificationPreferences_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _notificationPreferences_extraInitializers);
        }
    };
    return User = _classThis;
})();
exports.User = User;
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
