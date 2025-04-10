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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ResendService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ResendService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ResendService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        logger = new common_1.Logger(ResendService.name);
        apiKey;
        defaultSender;
        constructor(configService) {
            this.configService = configService;
            this.apiKey = this.configService.get('RESEND_API_KEY');
            this.defaultSender = this.configService.get('EMAIL_SENDER') || 'Nionfar <onboarding@resend.dev>';
            if (!this.apiKey) {
                this.logger.error('RESEND_API_KEY n\'est pas défini dans les variables d\'environnement!');
            }
            else {
                this.logger.log('Service Resend initialisé avec succès');
            }
        }
        async sendEmail(options) {
            try {
                if (!this.apiKey) {
                    this.logger.error('Impossible d\'envoyer un email: RESEND_API_KEY n\'est pas défini');
                    return null;
                }
                const { to, subject, html, from = this.defaultSender, ...rest } = options;
                this.logger.debug(`Envoi d'email via Resend à ${typeof to === 'string' ? to : to.join(', ')}: ${subject}`);
                const response = await axios_1.default.post('https://api.resend.com/emails', {
                    from,
                    to,
                    subject,
                    html,
                    ...rest
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                });
                this.logger.debug(`Email envoyé avec succès via Resend, ID: ${response.data.id}`);
                return response.data;
            }
            catch (error) {
                this.logger.error('Erreur lors de l\'envoi de l\'email via Resend:', error.response?.data || error.message);
                throw error;
            }
        }
        async sendVerificationEmail(to, token) {
            const baseUrl = this.configService.get('FRONTEND_URL');
            const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
            const subject = 'Vérification de votre adresse email';
            const html = `
      <h1>Vérification de votre adresse email</h1>
      <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <p><a href="${verificationUrl}">Vérifier mon email</a></p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte sur Nionfar, vous pouvez ignorer cet email.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
            return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'verification' }] });
        }
        async sendPasswordResetEmail(to, token) {
            const baseUrl = this.configService.get('FRONTEND_URL');
            const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
            const subject = 'Réinitialisation de votre mot de passe';
            const html = `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien ci-dessous :</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez nous contacter immédiatement.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
            return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'password_reset' }] });
        }
        async sendWelcomeEmail(to, firstName) {
            const subject = 'Bienvenue sur Nionfar';
            const html = `
      <h1>Bienvenue sur Nionfar, ${firstName}!</h1>
      <p>Nous sommes ravis de vous compter parmi nos membres.</p>
      <p>Vous pouvez maintenant explorer notre plateforme et découvrir nos services.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
            return this.sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'welcome' }] });
        }
    };
    return ResendService = _classThis;
})();
exports.ResendService = ResendService;
