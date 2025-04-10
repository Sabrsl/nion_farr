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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../decorators/roles.decorator");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
let RolesGuard = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RolesGuard = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RolesGuard = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reflector;
        constructor(reflector) {
            this.reflector = reflector;
        }
        canActivate(context) {
            // Récupérer les rôles nécessaires à partir du décorateur
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            // Si aucun rôle n'est requis, autoriser l'accès
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            const { user } = context.switchToHttp().getRequest();
            // Si aucun utilisateur n'est trouvé, refuser l'accès
            if (!user) {
                throw new common_1.ForbiddenException('Vous devez être connecté pour accéder à cette ressource');
            }
            // Vérifier si l'utilisateur a le rôle ADMIN ou SUPER_ADMIN (qui ont tous les droits)
            if (user.role === user_role_enum_1.UserRole.ADMIN || user.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                return true;
            }
            // Vérifier si l'utilisateur a au moins l'un des rôles requis
            const hasRole = requiredRoles.some(role => user.role === role);
            if (!hasRole) {
                // Journaliser la tentative d'accès non autorisée
                console.log(`[SECURITY WARNING] Tentative d'accès non autorisée: ${user.email} (${user.role}) a tenté d'accéder à une ressource nécessitant les rôles ${requiredRoles.join(', ')}`);
                throw new common_1.ForbiddenException(`Accès refusé. Vous devez avoir l'un des rôles suivants: ${requiredRoles.join(', ')}`);
            }
            return hasRole;
        }
    };
    return RolesGuard = _classThis;
})();
exports.RolesGuard = RolesGuard;
