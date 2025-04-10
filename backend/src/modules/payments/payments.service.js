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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const payment_status_enum_1 = require("./enums/payment-status.enum");
const transaction_type_enum_1 = require("./enums/transaction-type.enum");
const transaction_status_enum_1 = require("./enums/transaction-status.enum");
let PaymentsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentRepository;
        transactionRepository;
        ordersService;
        usersService;
        constructor(paymentRepository, transactionRepository, ordersService, usersService) {
            this.paymentRepository = paymentRepository;
            this.transactionRepository = transactionRepository;
            this.ordersService = ordersService;
            this.usersService = usersService;
        }
        async createPayment(createPaymentDto, userId) {
            // Vérifier que la commande existe
            const order = await this.ordersService.findOne(createPaymentDto.orderId, { id: userId });
            // Générer un ID de transaction unique
            const transactionId = `TXN-${Date.now().toString().slice(-6)}`;
            // Créer le paiement
            const payment = this.paymentRepository.create({
                ...createPaymentDto,
                userId,
                transactionId,
                status: payment_status_enum_1.PaymentStatus.PENDING
            });
            const savedPayment = await this.paymentRepository.save(payment);
            // Créer une transaction associée
            const transaction = this.transactionRepository.create({
                userId,
                amount: createPaymentDto.amount,
                type: transaction_type_enum_1.TransactionType.PAYMENT,
                status: transaction_status_enum_1.TransactionStatus.PENDING,
                orderId: createPaymentDto.orderId,
                description: `Paiement pour la commande #${order.orderNumber}`,
                transactionId
            });
            await this.transactionRepository.save(transaction);
            return {
                payment: savedPayment,
                paymentUrl: this.generatePaymentUrl(savedPayment)
            };
        }
        generatePaymentUrl(payment) {
            // Logique pour générer une URL de paiement en fonction de la méthode sélectionnée
            // Cette URL redirigerait vers la passerelle de paiement appropriée
            // Pour le moment, nous retournons simplement une URL factice
            return `https://api.example.com/pay/${payment.method}/${payment.transactionId}`;
        }
        async findAll() {
            return this.paymentRepository.find({
                relations: ['user', 'order']
            });
        }
        async findUserPayments(userId) {
            return this.paymentRepository.find({
                where: { userId },
                relations: ['order']
            });
        }
        async findOne(id, user) {
            const payment = await this.paymentRepository.findOne({
                where: { id },
                relations: ['user', 'order']
            });
            if (!payment) {
                throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
            }
            // Si ce n'est pas un admin et que l'utilisateur n'est pas le propriétaire
            if (user.role !== 'admin' && payment.userId !== user.id) {
                throw new common_1.ForbiddenException('You do not have permission to access this payment');
            }
            return payment;
        }
        async handleWebhook(webhookData) {
            // Trouver le paiement par l'ID de transaction
            const payment = await this.paymentRepository.findOne({
                where: { transactionId: webhookData.transactionId }
            });
            if (!payment) {
                throw new common_1.NotFoundException(`Payment with transaction ID ${webhookData.transactionId} not found`);
            }
            // Mettre à jour le statut du paiement
            await this.paymentRepository.update(payment.id, {
                status: webhookData.status,
                providerTransactionId: webhookData.providerTransactionId,
                providerResponse: webhookData.providerResponse
            });
            // Mettre à jour la transaction associée
            const transaction = await this.transactionRepository.findOne({
                where: { transactionId: webhookData.transactionId }
            });
            if (transaction) {
                await this.transactionRepository.update(transaction.id, {
                    status: this.mapPaymentStatusToTransactionStatus(webhookData.status),
                    gatewayResponse: JSON.stringify(webhookData.providerResponse)
                });
            }
            // Si le paiement est complété, mettre à jour le statut de la commande
            if (webhookData.status === payment_status_enum_1.PaymentStatus.COMPLETED && payment.orderId) {
                // Utiliser la méthode updateOrderStatus du service des commandes
                await this.ordersService.updateOrderStatus(payment.orderId, { status: 'PAID' });
            }
            return { success: true };
        }
        mapPaymentStatusToTransactionStatus(paymentStatus) {
            const statusMap = {
                [payment_status_enum_1.PaymentStatus.PENDING]: transaction_status_enum_1.TransactionStatus.PENDING,
                [payment_status_enum_1.PaymentStatus.PROCESSING]: transaction_status_enum_1.TransactionStatus.PROCESSING,
                [payment_status_enum_1.PaymentStatus.COMPLETED]: transaction_status_enum_1.TransactionStatus.COMPLETED,
                [payment_status_enum_1.PaymentStatus.FAILED]: transaction_status_enum_1.TransactionStatus.FAILED,
                [payment_status_enum_1.PaymentStatus.REFUNDED]: transaction_status_enum_1.TransactionStatus.REFUNDED,
                [payment_status_enum_1.PaymentStatus.CANCELLED]: transaction_status_enum_1.TransactionStatus.CANCELLED
            };
            return statusMap[paymentStatus] || transaction_status_enum_1.TransactionStatus.PENDING;
        }
        async updateStatus(id, statusData) {
            const payment = await this.paymentRepository.findOne({
                where: { id }
            });
            if (!payment) {
                throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
            }
            await this.paymentRepository.update(id, {
                status: statusData.status,
                failureReason: statusData.reason
            });
            return this.paymentRepository.findOne({
                where: { id },
                relations: ['user', 'order']
            });
        }
        async requestWithdrawal(withdrawalDto, userId) {
            // Vérifier que l'utilisateur existe
            const user = await this.usersService.findOne(userId);
            // Vérifier que l'utilisateur a suffisamment de fonds
            if (user.balance < withdrawalDto.amount) {
                throw new common_1.BadRequestException('Insufficient funds for withdrawal');
            }
            // Générer un ID de transaction unique
            const transactionId = `WTH-${Date.now().toString().slice(-6)}`;
            // Créer une nouvelle transaction de retrait
            const transaction = this.transactionRepository.create({
                userId,
                amount: withdrawalDto.amount,
                type: transaction_type_enum_1.TransactionType.WITHDRAWAL,
                status: transaction_status_enum_1.TransactionStatus.PENDING,
                description: `Retrait via ${withdrawalDto.method}`,
                transactionId,
                metadata: {
                    accountDetails: withdrawalDto.accountDetails,
                    method: withdrawalDto.method
                }
            });
            await this.transactionRepository.save(transaction);
            // Mettre à jour le solde de l'utilisateur
            await this.usersService.update(userId, {
                balance: user.balance - withdrawalDto.amount
            });
            return transaction;
        }
        async getWithdrawalHistory(userId) {
            return this.transactionRepository.find({
                where: {
                    userId,
                    type: transaction_type_enum_1.TransactionType.WITHDRAWAL
                },
                order: {
                    createdAt: 'DESC'
                }
            });
        }
        async getUserTransactions(userId) {
            return this.transactionRepository.find({
                where: { userId },
                order: {
                    createdAt: 'DESC'
                }
            });
        }
        async getUserBalance(userId) {
            const user = await this.usersService.findOne(userId);
            return { balance: user.balance };
        }
    };
    return PaymentsService = _classThis;
})();
exports.PaymentsService = PaymentsService;
