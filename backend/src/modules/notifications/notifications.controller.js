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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NotificationsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('notifications'), (0, common_1.Controller)('notifications'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _countUnread_decorators;
    let _markAsRead_decorators;
    let _markAllAsRead_decorators;
    let _remove_decorators;
    var NotificationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les notifications de l\'utilisateur connecté' }), (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean, description: 'Filtre par statut de lecture' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des notifications' })];
            _countUnread_decorators = [(0, common_1.Get)('count-unread'), (0, swagger_1.ApiOperation)({ summary: 'Compter les notifications non lues' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de notifications non lues' })];
            _markAsRead_decorators = [(0, common_1.Patch)(':id/read'), (0, swagger_1.ApiOperation)({ summary: 'Marquer une notification comme lue' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notification' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marquée comme lue' })];
            _markAllAsRead_decorators = [(0, common_1.Patch)('read-all'), (0, swagger_1.ApiOperation)({ summary: 'Marquer toutes les notifications comme lues' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Toutes les notifications marquées comme lues' })];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Supprimer une notification' }), (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notification' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification supprimée' })];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _countUnread_decorators, { kind: "method", name: "countUnread", static: false, private: false, access: { has: obj => "countUnread" in obj, get: obj => obj.countUnread }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: obj => "markAsRead" in obj, get: obj => obj.markAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAllAsRead_decorators, { kind: "method", name: "markAllAsRead", static: false, private: false, access: { has: obj => "markAllAsRead" in obj, get: obj => obj.markAllAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(notificationsService) {
            this.notificationsService = notificationsService;
        }
        async findAll(req, isRead) {
            const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
            return this.notificationsService.findAllForUser(req.user.id, isReadBool);
        }
        async countUnread(req) {
            const count = await this.notificationsService.countUnread(req.user.id);
            return { count };
        }
        async markAsRead(id, req) {
            return this.notificationsService.markAsRead(id, req.user.id);
        }
        async markAllAsRead(req) {
            await this.notificationsService.markAllAsRead(req.user.id);
            return { message: 'Toutes les notifications ont été marquées comme lues' };
        }
        async remove(id, req) {
            await this.notificationsService.remove(id, req.user.id);
            return { message: 'Notification supprimée' };
        }
    };
    return NotificationsController = _classThis;
})();
exports.NotificationsController = NotificationsController;
