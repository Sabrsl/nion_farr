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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const self_order_guard_1 = require("./guards/self-order.guard");
let OrdersController = (() => {
    let _classDecorators = [(0, common_1.Controller)('orders')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findByClient_decorators;
    let _findByFreelancer_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    var OrdersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, self_order_guard_1.SelfOrderGuard)];
            _findAll_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _findByClient_decorators = [(0, common_1.Get)('client/:clientId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _findByFreelancer_decorators = [(0, common_1.Get)('freelancer/:freelancerId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _findOne_decorators = [(0, common_1.Get)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByClient_decorators, { kind: "method", name: "findByClient", static: false, private: false, access: { has: obj => "findByClient" in obj, get: obj => obj.findByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByFreelancer_decorators, { kind: "method", name: "findByFreelancer", static: false, private: false, access: { has: obj => "findByFreelancer" in obj, get: obj => obj.findByFreelancer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OrdersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        ordersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(ordersService) {
            this.ordersService = ordersService;
        }
        /**
         * Crée une nouvelle commande
         * Utilise SelfOrderGuard pour empêcher un utilisateur de commander son propre service
         */
        async create(createOrderDto, req) {
            // Extraire l'ID de l'utilisateur authentifié de la requête
            const userId = req.user['id'];
            // Ajouter automatiquement l'ID du client à partir de l'utilisateur connecté
            createOrderDto.clientId = userId;
            // Ajouter l'ID du vendeur à partir du service (sera vérifié dans le service)
            const service = await this.ordersService.getServiceById(createOrderDto.serviceId);
            createOrderDto.freelancerId = service.providerId;
            return this.ordersService.create(createOrderDto, userId);
        }
        /**
         * Récupère toutes les commandes
         * Limite l'accès aux administrateurs
         */
        findAll(query, req) {
            // Vérifier si l'utilisateur est admin
            const isAdmin = req.user['role'] === 'admin';
            if (!isAdmin) {
                return this.ordersService.findAllByUser(req.user['id']);
            }
            return this.ordersService.findAll(query);
        }
        /**
         * Récupère les commandes d'un client spécifique
         */
        findByClient(clientId, req) {
            // Vérifier que l'utilisateur demande ses propres commandes ou est admin
            const userId = req.user['id'];
            const isAdmin = req.user['role'] === 'admin';
            if (userId !== clientId && !isAdmin) {
                return { message: 'Non autorisé', orders: [] };
            }
            return this.ordersService.findByClient(clientId);
        }
        /**
         * Récupère les commandes d'un vendeur spécifique
         */
        findByFreelancer(freelancerId, req) {
            // Vérifier que l'utilisateur demande ses propres commandes ou est admin
            const userId = req.user['id'];
            const isAdmin = req.user['role'] === 'admin';
            if (userId !== freelancerId && !isAdmin) {
                return { message: 'Non autorisé', orders: [] };
            }
            return this.ordersService.findByFreelancer(freelancerId);
        }
        /**
         * Récupère une commande spécifique
         */
        findOne(id, req) {
            return this.ordersService.findOne(id);
        }
        /**
         * Met à jour une commande
         */
        update(id, updateOrderDto, req) {
            const user = req.user;
            return this.ordersService.update(id, updateOrderDto, user);
        }
        /**
         * Supprime une commande (admin uniquement)
         */
        remove(id, req) {
            // Vérifier si l'utilisateur est admin
            const isAdmin = req.user['role'] === 'admin';
            if (!isAdmin) {
                return { message: 'Non autorisé' };
            }
            return this.ordersService.remove(id);
        }
    };
    return OrdersController = _classThis;
})();
exports.OrdersController = OrdersController;
