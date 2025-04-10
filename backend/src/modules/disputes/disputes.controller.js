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
exports.DisputesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("../auth");
const user_role_enum_1 = require("../users/enums/user-role.enum");
let DisputesController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('disputes'), (0, common_1.Controller)('disputes'), (0, common_1.UseGuards)(auth_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findAllAdmin_decorators;
    let _findOne_decorators;
    let _findByOrder_decorators;
    let _update_decorators;
    let _addMessage_decorators;
    let _remove_decorators;
    var DisputesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau litige' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Litige créé avec succès' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Non autorisé' })];
            _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les litiges' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litiges récupérés avec succès' })];
            _findAllAdmin_decorators = [(0, common_1.Get)('admin'), (0, common_1.UseGuards)(auth_1.RolesGuard), (0, auth_1.Roles)(user_role_enum_1.UserRole.ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les litiges (admin)' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litiges récupérés avec succès' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Non autorisé' })];
            _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Récupérer un litige par ID' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du litige' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litige récupéré avec succès' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Litige non trouvé' })];
            _findByOrder_decorators = [(0, common_1.Get)('order/:orderId'), (0, swagger_1.ApiOperation)({ summary: 'Récupérer un litige par ID de commande' }), (0, swagger_1.ApiParam)({ name: 'orderId', description: 'ID de la commande' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litige récupéré avec succès' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Litige non trouvé' })];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un litige' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du litige' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litige mis à jour avec succès' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Non autorisé' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Litige non trouvé' })];
            _addMessage_decorators = [(0, common_1.Post)(':id/messages'), (0, swagger_1.ApiOperation)({ summary: 'Ajouter un message à un litige' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du litige' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Message ajouté avec succès' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Non autorisé' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Litige non trouvé' })];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(auth_1.RolesGuard), (0, auth_1.Roles)(user_role_enum_1.UserRole.ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Supprimer un litige (admin uniquement)' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du litige' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Litige supprimé avec succès' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Non autorisé' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Litige non trouvé' })];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAllAdmin_decorators, { kind: "method", name: "findAllAdmin", static: false, private: false, access: { has: obj => "findAllAdmin" in obj, get: obj => obj.findAllAdmin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByOrder_decorators, { kind: "method", name: "findByOrder", static: false, private: false, access: { has: obj => "findByOrder" in obj, get: obj => obj.findByOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addMessage_decorators, { kind: "method", name: "addMessage", static: false, private: false, access: { has: obj => "addMessage" in obj, get: obj => obj.addMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DisputesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        disputesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(disputesService) {
            this.disputesService = disputesService;
        }
        async create(createDisputeDto, req) {
            try {
                return await this.disputesService.create(createDisputeDto, req.user.id);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException ||
                    error instanceof common_1.ForbiddenException ||
                    error instanceof common_1.BadRequestException) {
                    throw error;
                }
                throw new common_1.BadRequestException('Création du litige impossible: ' + error.message);
            }
        }
        async findAll(req) {
            const { id, role } = req.user;
            // Seuls les admins peuvent voir tous les litiges
            // Les autres ne voient que leurs propres litiges
            return this.disputesService.findAll(id, role);
        }
        async findAllAdmin() {
            return this.disputesService.findAll();
        }
        async findOne(id, req) {
            const dispute = await this.disputesService.findOne(id);
            // Vérifier les permissions (sauf pour l'admin)
            if (req.user.role !== user_role_enum_1.UserRole.ADMIN) {
                const order = await this.disputesService.getOrder(dispute.order.toString());
                const isInvolved = order.client.toString() === req.user.id ||
                    order.provider.toString() === req.user.id;
                if (!isInvolved) {
                    throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à accéder à ce litige');
                }
            }
            return dispute;
        }
        async findByOrder(orderId, req) {
            const dispute = await this.disputesService.findByOrder(orderId);
            // Vérifier les permissions (sauf pour l'admin)
            if (req.user.role !== user_role_enum_1.UserRole.ADMIN) {
                const order = await this.disputesService.getOrder(dispute.order.toString());
                const isInvolved = order.client.toString() === req.user.id ||
                    order.provider.toString() === req.user.id;
                if (!isInvolved) {
                    throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à accéder à ce litige');
                }
            }
            return dispute;
        }
        async update(id, updateDisputeDto, req) {
            // Les utilisateurs non-admin ne peuvent changer que certains statuts
            const isAdmin = req.user.role === user_role_enum_1.UserRole.ADMIN;
            if (!isAdmin && updateDisputeDto.status) {
                const allowedStatusForUsers = ['pending']; // Statuts autorisés pour les utilisateurs non-admin
                if (!allowedStatusForUsers.includes(updateDisputeDto.status)) {
                    throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à changer le statut de ce litige');
                }
            }
            return this.disputesService.update(id, updateDisputeDto, req.user.id, isAdmin);
        }
        async addMessage(id, messageDto, req) {
            return this.disputesService.addMessage(id, messageDto, req.user.id);
        }
        async remove(id, req) {
            const isAdmin = req.user.role === user_role_enum_1.UserRole.ADMIN;
            await this.disputesService.remove(id, isAdmin);
            return { message: 'Litige supprimé avec succès' };
        }
    };
    return DisputesController = _classThis;
})();
exports.DisputesController = DisputesController;
