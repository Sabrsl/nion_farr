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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
let AdminService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderModel;
        userModel;
        serviceModel;
        constructor(orderModel, userModel, serviceModel) {
            this.orderModel = orderModel;
            this.userModel = userModel;
            this.serviceModel = serviceModel;
        }
        async getDashboardStats() {
            const totalUsers = await this.userModel.countDocuments();
            const totalServices = await this.serviceModel.countDocuments();
            const totalOrders = await this.orderModel.countDocuments();
            // Récupérer quelques transactions récentes
            const recentTransactions = await this.orderModel.find({
                order: { createdAt: 'DESC' },
                take: 10,
                relations: ['client', 'freelancer', 'service']
            });
            return {
                totalUsers,
                totalServices,
                totalOrders,
                recentTransactions,
            };
        }
        async getPlatformStats() {
            // Obtenir les statistiques des visiteurs
            const visitors = await this.getVisitorsCount();
            // Obtenir les statistiques des paiements
            const payments = await this.getPaymentsTotal();
            // Taux de satisfaction fixe pour l'instant
            const satisfaction = 98;
            // Compter les freelancers
            const freelancersCount = await this.userModel.countDocuments({
                isFreelancer: true,
                isActive: true
            });
            // Compter les clients
            const clientsCount = await this.userModel.countDocuments({
                isFreelancer: false,
                isActive: true
            });
            return {
                success: true,
                stats: {
                    visitors: visitors.count,
                    payments: payments.total,
                    satisfaction,
                    freelancersCount,
                    clientsCount
                }
            };
        }
        async getVisitorsCount() {
            try {
                // Calculer le nombre de visiteurs actifs par mois
                // Pour l'instant, on utilise une estimation basée sur le nombre d'utilisateurs * 5
                const userCount = await this.userModel.countDocuments();
                const estimatedVisitors = userCount * 5;
                return { count: estimatedVisitors };
            }
            catch (error) {
                console.error('Erreur lors du calcul des visiteurs:', error);
                return { count: 5000 }; // Valeur par défaut
            }
        }
        async getPaymentsTotal() {
            try {
                // Utiliser l'agrégation MongoDB pour calculer le total
                const result = await this.orderModel.aggregate([
                    {
                        $match: {
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$price' }
                        }
                    }
                ]).exec();
                // Extraire le total du résultat de l'agrégation
                const total = result.length > 0 ? result[0].total : 0;
                return { total: Number(total) || 10000000 };
            }
            catch (error) {
                console.error('Erreur lors du calcul des paiements:', error);
                return { total: 10000000 }; // Valeur par défaut (10M FCFA)
            }
        }
    };
    return AdminService = _classThis;
})();
exports.AdminService = AdminService;
