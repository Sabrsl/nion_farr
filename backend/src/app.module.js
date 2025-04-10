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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const env_validation_1 = require("./config/env.validation");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./modules/auth/auth.module");
const health_module_1 = require("./health/health.module");
const backup_1 = require("./scripts/backup");
// Modules
const users_module_1 = require("./modules/users/users.module");
const services_module_1 = require("./modules/services/services.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const messages_module_1 = require("./modules/messages/messages.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const admin_module_1 = require("./modules/admin/admin.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const email_module_1 = require("./modules/email/email.module");
const sms_module_1 = require("./modules/sms/sms.module");
const disputes_module_1 = require("./modules/disputes/disputes.module");
const app_service_1 = require("./app.service");
const security_module_1 = require("./security/security.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
const queue_module_1 = require("./modules/queue/queue.module");
const ip_module_1 = require("./ip/ip.module");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                // Configuration
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    validate: env_validation_1.validate,
                }),
                // Database - TypeORM configuré avec MongoDB
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        type: 'mongodb',
                        url: configService.get('MONGODB_URI'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: false,
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        retryAttempts: 5,
                        retryDelay: 3000,
                    }),
                }),
                // Rate limiting
                throttler_1.ThrottlerModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ([
                        {
                            ttl: configService.get('THROTTLE_TTL', 60) * 1000,
                            limit: configService.get('THROTTLE_LIMIT', 10),
                        },
                    ]),
                }),
                // JWT
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => ({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: {
                            expiresIn: configService.get('JWT_EXPIRES_IN'),
                        },
                    }),
                }),
                // Connexion à MongoDB via Mongoose
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (config) => ({
                        uri: config.get('MONGODB_URI'),
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        retryAttempts: 5,
                        retryDelay: 3000,
                        serverSelectionTimeoutMS: 5000,
                        connectTimeoutMS: 10000,
                    }),
                }),
                // Planification des tâches
                schedule_1.ScheduleModule.forRoot(),
                // Application modules
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                services_module_1.ServicesModule,
                orders_module_1.OrdersModule,
                payments_module_1.PaymentsModule,
                messages_module_1.MessagesModule,
                reviews_module_1.ReviewsModule,
                admin_module_1.AdminModule,
                notifications_module_1.NotificationsModule,
                email_module_1.EmailModule,
                sms_module_1.SmsModule,
                disputes_module_1.DisputesModule,
                health_module_1.HealthModule,
                security_module_1.SecurityModule,
                queue_module_1.QueueModule,
                ip_module_1.IpModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [
                app_service_1.AppService,
                backup_1.BackupService,
                {
                    provide: core_1.APP_GUARD,
                    useClass: throttler_1.ThrottlerGuard,
                },
                {
                    provide: core_1.APP_GUARD,
                    useClass: jwt_auth_guard_1.JwtAuthGuard,
                },
                {
                    provide: core_1.APP_GUARD,
                    useClass: roles_guard_1.RolesGuard,
                },
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
