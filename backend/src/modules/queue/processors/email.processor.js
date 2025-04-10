"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailQueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let EmailQueueProcessor = (() => {
    let _classDecorators = [(0, bull_1.Processor)('email')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _handleSendEmail_decorators;
    var EmailQueueProcessor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _handleSendEmail_decorators = [(0, bull_1.Process)('send-email')];
            __esDecorate(this, null, _handleSendEmail_decorators, { kind: "method", name: "handleSendEmail", static: false, private: false, access: { has: obj => "handleSendEmail" in obj, get: obj => obj.handleSendEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EmailQueueProcessor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        emailService = __runInitializers(this, _instanceExtraInitializers);
        logger = new common_1.Logger(EmailQueueProcessor.name);
        constructor(emailService) {
            this.emailService = emailService;
        }
        async handleSendEmail(job) {
            try {
                this.logger.debug(`Traitement du job d'email #${job.id} - [${job.data.subject}]`);
                // Mettre à jour la progression du job
                await job.progress(10);
                const { to, subject, template, html, context } = job.data;
                // Envoyer l'email en fonction des données fournies
                if (template) {
                    // Si un template est spécifié, utiliser le service de template
                    await this.emailService.sendEmail({
                        to,
                        subject,
                        template,
                        context: context || {},
                    });
                }
                else if (html) {
                    // Sinon, envoyer l'email avec le contenu HTML fourni
                    await this.emailService.sendEmail(to, subject, html);
                }
                else {
                    throw new Error('Aucun contenu d\'email spécifié (template ou HTML)');
                }
                // Mise à jour finale de la progression
                await job.progress(100);
                this.logger.debug(`Email envoyé avec succès: ${subject} à ${to}`);
                return { success: true, to, subject };
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'envoi de l'email [Job #${job.id}]:`, error);
                throw error;
            }
        }
    };
    return EmailQueueProcessor = _classThis;
})();
exports.EmailQueueProcessor = EmailQueueProcessor;
