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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
const zod_validation_pipe_1 = require("../../../common/pipes/zod-validation.pipe");
const service_schema_1 = require("../schemas/service.schema");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let ServicesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('services'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findOne_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _findByProvider_decorators;
    let _findByCategory_decorators;
    let _getCategoriesCount_decorators;
    let _getServiceStats_decorators;
    var ServicesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.FREELANCER, user_role_enum_1.UserRole.ADMIN), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(service_schema_1.createServiceSchema))];
            _findAll_decorators = [(0, common_1.Get)(), (0, public_decorator_1.Public)()];
            _findOne_decorators = [(0, common_1.Get)(':id'), (0, public_decorator_1.Public)()];
            _update_decorators = [(0, common_1.Put)(':id'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.FREELANCER, user_role_enum_1.UserRole.ADMIN), (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(service_schema_1.updateServiceSchema))];
            _remove_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.FREELANCER, user_role_enum_1.UserRole.ADMIN)];
            _findByProvider_decorators = [(0, common_1.Get)('provider/:providerId'), (0, public_decorator_1.Public)()];
            _findByCategory_decorators = [(0, common_1.Get)('category/:category'), (0, public_decorator_1.Public)()];
            _getCategoriesCount_decorators = [(0, common_1.Get)('categories/count'), (0, public_decorator_1.Public)()];
            _getServiceStats_decorators = [(0, common_1.Get)('stats'), (0, public_decorator_1.Public)()];
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByProvider_decorators, { kind: "method", name: "findByProvider", static: false, private: false, access: { has: obj => "findByProvider" in obj, get: obj => obj.findByProvider }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByCategory_decorators, { kind: "method", name: "findByCategory", static: false, private: false, access: { has: obj => "findByCategory" in obj, get: obj => obj.findByCategory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCategoriesCount_decorators, { kind: "method", name: "getCategoriesCount", static: false, private: false, access: { has: obj => "getCategoriesCount" in obj, get: obj => obj.getCategoriesCount }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getServiceStats_decorators, { kind: "method", name: "getServiceStats", static: false, private: false, access: { has: obj => "getServiceStats" in obj, get: obj => obj.getServiceStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        servicesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(servicesService) {
            this.servicesService = servicesService;
        }
        create(createServiceDto) {
            return this.servicesService.create(createServiceDto);
        }
        findAll(query) {
            return this.servicesService.findAll(query);
        }
        findOne(id) {
            return this.servicesService.findOne(id);
        }
        update(id, updateServiceDto) {
            return this.servicesService.update(id, updateServiceDto);
        }
        remove(id) {
            return this.servicesService.remove(id);
        }
        findByProvider(providerId) {
            return this.servicesService.findByProvider(providerId);
        }
        findByCategory(category) {
            return this.servicesService.findByCategory(category);
        }
        async getCategoriesCount() {
            return this.servicesService.getCategoriesCount();
        }
        async getServiceStats() {
            return this.servicesService.getServiceStats();
        }
    };
    return ServicesController = _classThis;
})();
exports.ServicesController = ServicesController;
