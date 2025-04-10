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
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
const zod_validation_pipe_1 = require("../../../common/pipes/zod-validation.pipe");
const order_schema_1 = require("../schemas/order.schema");
let OrdersController = (() => {
    let _classDecorators = [(0, common_1.Controller)('orders'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _deliver_decorators;
    let _accept_decorators;
    let _requestRevision_decorators;
    let _complete_decorators;
    let _cancel_decorators;
    let _updateStatus_decorators;
    let _findByClient_decorators;
    let _findByFreelancer_decorators;
    var OrdersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [(0, common_1.Post)(), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.createOrderSchema))];
            _findAll_decorators = [(0, common_1.Get)()];
            _findOne_decorators = [(0, common_1.Get)(':id')];
            _update_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.updateOrderSchema))];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN)];
            _deliver_decorators = [(0, common_1.Post)(':id/deliver'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.deliverOrderSchema))];
            _accept_decorators = [(0, common_1.Post)(':id/accept'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.acceptOrderSchema))];
            _requestRevision_decorators = [(0, common_1.Post)(':id/revision'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.requestRevisionSchema))];
            _complete_decorators = [(0, common_1.Post)(':id/complete')];
            _cancel_decorators = [(0, common_1.Post)(':id/cancel'), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.cancelOrderSchema))];
            _updateStatus_decorators = [(0, common_1.Patch)(':id/status'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(order_schema_1.updateOrderStatusSchema))];
            _findByClient_decorators = [(0, common_1.Get)('client/:clientId'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN)];
            _findByFreelancer_decorators = [(0, common_1.Get)('freelancer/:freelancerId'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN)];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deliver_decorators, { kind: "method", name: "deliver", static: false, private: false, access: { has: obj => "deliver" in obj, get: obj => obj.deliver }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _accept_decorators, { kind: "method", name: "accept", static: false, private: false, access: { has: obj => "accept" in obj, get: obj => obj.accept }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _requestRevision_decorators, { kind: "method", name: "requestRevision", static: false, private: false, access: { has: obj => "requestRevision" in obj, get: obj => obj.requestRevision }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _complete_decorators, { kind: "method", name: "complete", static: false, private: false, access: { has: obj => "complete" in obj, get: obj => obj.complete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByClient_decorators, { kind: "method", name: "findByClient", static: false, private: false, access: { has: obj => "findByClient" in obj, get: obj => obj.findByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByFreelancer_decorators, { kind: "method", name: "findByFreelancer", static: false, private: false, access: { has: obj => "findByFreelancer" in obj, get: obj => obj.findByFreelancer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OrdersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        ordersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(ordersService) {
            this.ordersService = ordersService;
        }
        create(createOrderDto, req) {
            return this.ordersService.create(createOrderDto, req.user.id);
        }
        findAll(req) {
            return this.ordersService.findAll(req.user);
        }
        findOne(id, req) {
            return this.ordersService.findOne(id, req.user);
        }
        update(id, updateOrderDto, req) {
            return this.ordersService.update(id, updateOrderDto, req.user);
        }
        remove(id) {
            return this.ordersService.remove(id);
        }
        deliver(id, deliverOrderDto, req) {
            return this.ordersService.deliver(id, deliverOrderDto, req.user);
        }
        accept(id, acceptOrderDto, req) {
            return this.ordersService.accept(id, acceptOrderDto, req.user);
        }
        requestRevision(id, revisionDto, req) {
            return this.ordersService.requestRevision(id, revisionDto, req.user);
        }
        complete(id, req) {
            return this.ordersService.complete(id, req.user);
        }
        cancel(id, cancelDto, req) {
            return this.ordersService.cancel(id, cancelDto, req.user);
        }
        updateStatus(id, statusDto) {
            return this.ordersService.updateStatus(id, statusDto);
        }
        findByClient(clientId) {
            return this.ordersService.findByClient(clientId);
        }
        findByFreelancer(freelancerId) {
            return this.ordersService.findByFreelancer(freelancerId);
        }
    };
    return OrdersController = _classThis;
})();
exports.OrdersController = OrdersController;
