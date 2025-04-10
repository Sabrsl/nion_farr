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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EmailService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EmailService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        transporter;
        logger = new common_1.Logger(EmailService.name);
        constructor(configService) {
            this.configService = configService;
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('EMAIL_HOST'),
                port: this.configService.get('EMAIL_PORT'),
                secure: this.configService.get('EMAIL_SECURE'),
                auth: {
                    user: this.configService.get('EMAIL_USER'),
                    pass: this.configService.get('EMAIL_PASSWORD'),
                },
            });
            // Vérifier la connexion au serveur SMTP au démarrage
            this.verifyConnection();
        }
        // Vérification de la connexion au serveur SMTP
        async verifyConnection() {
            try {
                await this.transporter.verify();
                this.logger.log('Connection au serveur SMTP établie avec succès');
            }
            catch (error) {
                this.logger.error('Erreur de connexion au serveur SMTP:', error);
            }
        }
        async sendEmail(toOrOptions, subject, html) {
            try {
                if (typeof toOrOptions === 'string') {
                    // Format ancien
                    this.logger.debug(`Envoi d'email à ${toOrOptions}: ${subject}`);
                    await this.transporter.sendMail({
                        from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM')}>`,
                        to: toOrOptions,
                        subject,
                        html,
                    });
                    this.logger.debug(`Email envoyé avec succès à ${toOrOptions}`);
                }
                else {
                    // Format avec options
                    const { to, subject, html: htmlContent, template, context } = toOrOptions;
                    this.logger.debug(`Envoi d'email à ${to}: ${subject} (${template ? 'avec template' : 'sans template'})`);
                    // TODO: implémenter le traitement des templates si nécessaire
                    const finalHtml = htmlContent || `Template: ${template}, Context: ${JSON.stringify(context)}`;
                    await this.transporter.sendMail({
                        from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM')}>`,
                        to,
                        subject,
                        html: finalHtml,
                    });
                    this.logger.debug(`Email envoyé avec succès à ${to}`);
                }
            }
            catch (error) {
                this.logger.error('Erreur lors de l\'envoi de l\'email:', error);
                throw error;
            }
        }
        /**
         * Envoie un email de bienvenue
         */
        async sendWelcomeEmail(to, firstName) {
            const subject = 'Bienvenue sur Nionfar';
            const html = `
      <h1>Bienvenue sur Nionfar, ${firstName}!</h1>
      <p>Nous sommes ravis de vous compter parmi nos membres.</p>
      <p>Vous pouvez maintenant explorer notre plateforme et découvrir nos services.</p>
      <p>À bientôt,</p>
      <p>L'équipe Nionfar</p>
    `;
            await this.sendEmail(to, subject, html);
        }
        /**
         * Envoie un email de vérification
         */
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
            await this.sendEmail(to, subject, html);
        }
        /**
         * Envoie un email de réinitialisation de mot de passe
         */
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
            await this.sendEmail(to, subject, html);
        }
    };
    return EmailService = _classThis;
})();
exports.EmailService = EmailService;
