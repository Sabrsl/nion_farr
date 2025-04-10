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
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
let SmsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SmsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SmsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        // private client: twilio.Twilio;
        constructor(configService) {
            this.configService = configService;
            /*
            this.client = twilio(
              this.configService.get<string>('TWILIO_ACCOUNT_SID'),
              this.configService.get<string>('TWILIO_AUTH_TOKEN')
            );
            */
            console.log('Service SMS initialisé en mode simulation');
        }
        async sendSms(toOrOptions, body) {
            // Simulation d'envoi de SMS
            if (typeof toOrOptions === 'string') {
                console.log(`[SMS Simulation] Envoi à ${toOrOptions}: ${body}`);
            }
            else {
                console.log(`[SMS Simulation] Envoi à ${toOrOptions.to}: ${toOrOptions.message}`);
            }
            /*
            try {
              if (typeof toOrOptions === 'string') {
                // Legacy format
                await this.client.messages.create({
                  body,
                  from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
                  to: toOrOptions,
                });
              } else {
                // New format with options object
                const { to, message } = toOrOptions;
                await this.client.messages.create({
                  body: message,
                  from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
                  to,
                });
              }
            } catch (error) {
              console.error('Erreur lors de l\'envoi du SMS:', error);
              throw error;
            }
            */
        }
        async sendVerificationCode(to, code) {
            const message = `Votre code de vérification NionFar est: ${code}`;
            await this.sendSms(to, message);
        }
    };
    return SmsService = _classThis;
})();
exports.SmsService = SmsService;
