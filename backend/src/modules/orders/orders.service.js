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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_status_enum_1 = require("./enums/order-status.enum");
let OrdersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OrdersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OrdersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderRepository;
        constructor(orderRepository) {
            this.orderRepository = orderRepository;
        }
        async create(createOrderDto, userId) {
            // Implementation will go here
            const order = this.orderRepository.create({
                ...createOrderDto,
                clientId: userId,
                status: order_status_enum_1.OrderStatus.PENDING,
                orderNumber: `ORD-${Date.now().toString().slice(-6)}`
            });
            return this.orderRepository.save(order);
        }
        async findAll(user) {
            // Si admin, retourner toutes les commandes
            if (user.role === 'admin') {
                return this.orderRepository.find({
                    relations: ['client', 'freelancer', 'service']
                });
            }
            // Sinon, retourner uniquement les commandes de l'utilisateur
            return this.orderRepository.find({
                where: [
                    { clientId: user.id },
                    { freelancerId: user.id }
                ],
                relations: ['client', 'freelancer', 'service']
            });
        }
        async findAllByUser(userId) {
            return this.orderRepository.find({
                where: [
                    { clientId: userId },
                    { freelancerId: userId }
                ],
                relations: ['client', 'freelancer', 'service']
            });
        }
        async findByClient(clientId) {
            return this.orderRepository.find({
                where: { clientId },
                relations: ['client', 'freelancer', 'service']
            });
        }
        async findByFreelancer(freelancerId) {
            return this.orderRepository.find({
                where: { freelancerId },
                relations: ['client', 'freelancer', 'service']
            });
        }
        async findOne(id, user) {
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['client', 'freelancer', 'service', 'options']
            });
            if (!order) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            // Si ce n'est pas un admin et que l'utilisateur n'est ni le client ni le freelancer
            if (user && user.role !== 'admin' && order.clientId !== user.id && order.freelancerId !== user.id) {
                throw new common_1.ForbiddenException('You do not have permission to access this order');
            }
            return order;
        }
        async update(id, updateOrderDto, user) {
            const order = await this.findOne(id, user);
            // Seul le client peut mettre à jour la commande et uniquement si elle est en attente
            if (order.clientId !== user.id && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only the client can update the order');
            }
            if (order.status !== order_status_enum_1.OrderStatus.PENDING && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Orders can only be updated when in pending status');
            }
            await this.orderRepository.update(id, updateOrderDto);
            return this.findOne(id);
        }
        async remove(id) {
            const result = await this.orderRepository.delete(id);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            return { id, deleted: true };
        }
        async getServiceById(serviceId) {
            // Implementation will go here
            return { id: serviceId, providerId: 'provider-id' };
        }
        async updateOrderStatus(orderId, statusData) {
            const order = await this.findOne(orderId);
            await this.orderRepository.update(orderId, {
                status: statusData.status,
                cancelReason: statusData.reason
            });
            return this.findOne(orderId);
        }
        async updateStatus(orderId, statusData) {
            return this.updateOrderStatus(orderId, statusData);
        }
        async deliver(id, deliverOrderDto, user) {
            const order = await this.findOne(id, user);
            // Seul le freelancer peut livrer la commande
            if (order.freelancerId !== user.id && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only the freelancer can deliver the order');
            }
            // La commande doit être en cours
            if (order.status !== order_status_enum_1.OrderStatus.IN_PROGRESS && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Orders can only be delivered when in progress');
            }
            await this.orderRepository.update(id, {
                status: order_status_enum_1.OrderStatus.DELIVERED,
                deliveryMessage: deliverOrderDto.deliveryMessage,
                deliveryFiles: deliverOrderDto.deliveryFiles
            });
            return this.findOne(id);
        }
        async accept(id, acceptOrderDto, user) {
            const order = await this.findOne(id, user);
            // Seul le freelancer peut accepter la commande
            if (order.freelancerId !== user.id && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only the freelancer can accept the order');
            }
            // La commande doit être en attente de paiement
            if (order.status !== order_status_enum_1.OrderStatus.PAID && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Orders can only be accepted when paid');
            }
            const startDate = acceptOrderDto.startDate ? new Date(acceptOrderDto.startDate) : new Date();
            let completionDate = null;
            if (acceptOrderDto.estimatedCompletionDate) {
                completionDate = new Date(acceptOrderDto.estimatedCompletionDate);
            }
            else {
                // Calcul basé sur le délai de livraison du service
                completionDate = new Date(startDate);
                completionDate.setDate(completionDate.getDate() + order.service.deliveryTime);
            }
            await this.orderRepository.update(id, {
                status: order_status_enum_1.OrderStatus.IN_PROGRESS,
                startDate,
                deadline: completionDate
            });
            return this.findOne(id);
        }
        async requestRevision(id, revisionDto, user) {
            const order = await this.findOne(id, user);
            // Seul le client peut demander une révision
            if (order.clientId !== user.id && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only the client can request a revision');
            }
            // La commande doit être livrée
            if (order.status !== order_status_enum_1.OrderStatus.DELIVERED && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Revisions can only be requested for delivered orders');
            }
            await this.orderRepository.update(id, {
                status: order_status_enum_1.OrderStatus.REVISION,
                // Stocker les détails de la révision dans un champ supplémentaire ou une table liée
            });
            return this.findOne(id);
        }
        async complete(id, user) {
            const order = await this.findOne(id, user);
            // Seul le client peut terminer la commande
            if (order.clientId !== user.id && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only the client can complete the order');
            }
            // La commande doit être livrée
            if (order.status !== order_status_enum_1.OrderStatus.DELIVERED && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only delivered orders can be completed');
            }
            await this.orderRepository.update(id, {
                status: order_status_enum_1.OrderStatus.COMPLETED,
                completionDate: new Date()
            });
            return this.findOne(id);
        }
        async cancel(id, cancelDto, user) {
            const order = await this.findOne(id, user);
            // La commande peut être annulée par le client ou le freelancer
            const isParticipant = order.clientId === user.id || order.freelancerId === user.id;
            if (!isParticipant && user.role !== 'admin') {
                throw new common_1.ForbiddenException('Only participants can cancel the order');
            }
            // On ne peut annuler que les commandes en attente, payées ou en cours
            const cancellableStatuses = [order_status_enum_1.OrderStatus.PENDING, order_status_enum_1.OrderStatus.PAID, order_status_enum_1.OrderStatus.IN_PROGRESS];
            if (!cancellableStatuses.includes(order.status) && user.role !== 'admin') {
                throw new common_1.ForbiddenException('This order cannot be cancelled at its current status');
            }
            await this.orderRepository.update(id, {
                status: order_status_enum_1.OrderStatus.CANCELLED,
                cancelReason: cancelDto.cancelReason
            });
            return this.findOne(id);
        }
    };
    return OrdersService = _classThis;
})();
exports.OrdersService = OrdersService;
