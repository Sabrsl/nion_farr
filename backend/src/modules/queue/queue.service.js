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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
let QueueService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var QueueService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            QueueService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        emailQueue;
        notificationQueue;
        logger = new common_1.Logger(QueueService.name);
        constructor(emailQueue, notificationQueue) {
            this.emailQueue = emailQueue;
            this.notificationQueue = notificationQueue;
        }
        /**
         * Ajouter un email à la file d'attente
         * @param emailJob Les données de l'email à envoyer
         * @param priority Priorité du job (1 = la plus haute)
         * @param delay Délai en millisecondes avant l'exécution
         */
        async addEmailToQueue(emailJob, options = {}) {
            try {
                const { priority = 5, delay = 0, jobId } = options;
                this.logger.debug(`Ajout d'un email à la file d'attente: ${emailJob.subject} pour ${emailJob.to}`);
                const job = await this.emailQueue.add('send-email', emailJob, {
                    priority,
                    delay,
                    jobId,
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                });
                this.logger.debug(`Email ajouté à la file d'attente avec l'ID: ${job.id}`);
                return job.id;
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'ajout d'un email à la file d'attente:`, error);
                throw error;
            }
        }
        /**
         * Ajouter une notification à la file d'attente
         * @param notificationJob Les données de la notification à envoyer
         * @param priority Priorité du job (1 = la plus haute)
         * @param delay Délai en millisecondes avant l'exécution
         */
        async addNotificationToQueue(notificationJob, options = {}) {
            try {
                const { priority = 5, delay = 0, jobId } = options;
                this.logger.debug(`Ajout d'une notification à la file d'attente: ${notificationJob.title} pour l'utilisateur ${notificationJob.userId}`);
                const job = await this.notificationQueue.add('send-notification', notificationJob, {
                    priority,
                    delay,
                    jobId,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                });
                this.logger.debug(`Notification ajoutée à la file d'attente avec l'ID: ${job.id}`);
                return job.id;
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'ajout d'une notification à la file d'attente:`, error);
                throw error;
            }
        }
        /**
         * Vérifier l'état d'un job d'email
         */
        async getEmailJobStatus(jobId) {
            try {
                const job = await this.emailQueue.getJob(jobId);
                if (!job) {
                    throw new Error(`Job d'email non trouvé avec l'ID: ${jobId}`);
                }
                const state = await job.getState();
                const progress = await job.progress();
                return {
                    id: job.id,
                    state,
                    progress,
                    data: job.data,
                    attempts: job.attemptsMade,
                    failedReason: job.failedReason,
                    stacktrace: job.stacktrace,
                    timestamp: job.timestamp,
                };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la récupération de l'état du job d'email:`, error);
                throw error;
            }
        }
        /**
         * Vérifier l'état d'un job de notification
         */
        async getNotificationJobStatus(jobId) {
            try {
                const job = await this.notificationQueue.getJob(jobId);
                if (!job) {
                    throw new Error(`Job de notification non trouvé avec l'ID: ${jobId}`);
                }
                const state = await job.getState();
                const progress = await job.progress();
                return {
                    id: job.id,
                    state,
                    progress,
                    data: job.data,
                    attempts: job.attemptsMade,
                    failedReason: job.failedReason,
                    stacktrace: job.stacktrace,
                    timestamp: job.timestamp,
                };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la récupération de l'état du job de notification:`, error);
                throw error;
            }
        }
        /**
         * Obtenir les statistiques des files d'attente
         */
        async getQueueStats() {
            try {
                const [emailCount, notificationCount] = await Promise.all([
                    this.emailQueue.count(),
                    this.notificationQueue.count(),
                ]);
                const [emailFailed, notificationFailed] = await Promise.all([
                    this.emailQueue.getFailed(),
                    this.notificationQueue.getFailed(),
                ]);
                return {
                    email: {
                        waiting: emailCount,
                        failed: emailFailed.length,
                    },
                    notification: {
                        waiting: notificationCount,
                        failed: notificationFailed.length,
                    },
                };
            }
            catch (error) {
                this.logger.error(`Erreur lors de la récupération des statistiques des files d'attente:`, error);
                throw error;
            }
        }
        /**
         * Nettoyer les jobs échoués
         */
        async cleanFailedJobs() {
            try {
                await Promise.all([
                    this.emailQueue.clean(0, 'failed'),
                    this.notificationQueue.clean(0, 'failed'),
                ]);
                this.logger.log('Les jobs échoués ont été nettoyés.');
            }
            catch (error) {
                this.logger.error(`Erreur lors du nettoyage des jobs échoués:`, error);
                throw error;
            }
        }
    };
    return QueueService = _classThis;
})();
exports.QueueService = QueueService;
