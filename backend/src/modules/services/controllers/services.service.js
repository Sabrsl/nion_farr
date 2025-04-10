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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
let ServicesService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ServicesService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ServicesService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        serviceRepository;
        categoryRepository;
        constructor(serviceRepository, categoryRepository) {
            this.serviceRepository = serviceRepository;
            this.categoryRepository = categoryRepository;
        }
        async create(createServiceDto) {
            const service = this.serviceRepository.create(createServiceDto);
            return this.serviceRepository.save(service);
        }
        async findAll(query) {
            // Filtres de base pour exclure les services fictifs/placeholder
            const baseWhere = {
                isActive: true
            };
            // Si le paramètre providerId est fourni, filtrer par fournisseur
            if (query.providerId) {
                baseWhere.providerId = query.providerId;
            }
            // Si le paramètre categoryId est fourni, filtrer par catégorie
            if (query.categoryId) {
                baseWhere.categoryId = query.categoryId;
            }
            // Si une recherche par texte est fournie, filtrer par titre ou description
            if (query.search) {
                return this.serviceRepository
                    .createQueryBuilder('service')
                    .leftJoinAndSelect('service.provider', 'provider')
                    .leftJoinAndSelect('service.category', 'category')
                    .leftJoinAndSelect('service.reviews', 'reviews')
                    .where(baseWhere)
                    .andWhere('(service.title LIKE :search OR service.description LIKE :search)', { search: `%${query.search}%` })
                    .orderBy('service.createdAt', 'DESC')
                    .getMany();
            }
            // Requête standard sans recherche textuelle
            return this.serviceRepository.find({
                where: baseWhere,
                relations: ['provider', 'category', 'reviews'],
                order: { createdAt: 'DESC' }
            });
        }
        async findOne(id) {
            const service = await this.serviceRepository.findOne({
                where: { id, isActive: true },
                relations: ['provider', 'category', 'reviews'],
            });
            if (!service) {
                throw new common_1.NotFoundException(`Service with ID ${id} not found`);
            }
            return service;
        }
        async update(id, updateServiceDto) {
            const service = await this.findOne(id);
            this.serviceRepository.merge(service, updateServiceDto);
            return this.serviceRepository.save(service);
        }
        async remove(id) {
            const service = await this.findOne(id);
            return this.serviceRepository.remove(service);
        }
        async findByProvider(providerId) {
            return this.serviceRepository.find({
                where: { providerId, isActive: true },
                relations: ['provider', 'category', 'reviews'],
                order: { createdAt: 'DESC' }
            });
        }
        async findByCategory(category) {
            return this.serviceRepository.find({
                where: { categoryId: category, isActive: true },
                relations: ['provider', 'category', 'reviews'],
                order: { createdAt: 'DESC' }
            });
        }
        async getCategoriesCount() {
            // Récupérer toutes les catégories
            const categories = await this.categoryRepository.find({
                where: { isActive: true },
            });
            // Pour chaque catégorie, compter le nombre de services actifs
            const categoriesWithCount = await Promise.all(categories.map(async (category) => {
                const count = await this.serviceRepository.count({
                    where: {
                        categoryId: category.id,
                        isActive: true,
                    },
                });
                return {
                    id: category.id,
                    name: category.name,
                    slug: category.name.toLowerCase().replace(/\s+/g, '-'),
                    count,
                };
            }));
            return {
                categories: categoriesWithCount,
            };
        }
        /**
         * Récupère diverses statistiques sur les services
         * @returns Statistiques des services
         */
        async getServiceStats() {
            try {
                // Récupérer tous les services actifs
                const services = await this.serviceRepository.find({
                    where: { isActive: true },
                    relations: ['reviews'],
                });
                if (!services || services.length === 0) {
                    return {
                        stats: {
                            avgRating: 0,
                            monthlyOrders: 0,
                            avgDeliveryTime: 0,
                            avgPrice: 0,
                            totalServices: 0,
                        }
                    };
                }
                // Calculer la note moyenne
                const totalRating = services.reduce((sum, service) => sum + (service.rating || 0), 0);
                const avgRating = services.length > 0 ? parseFloat((totalRating / services.length).toFixed(1)) : 0;
                // Calculer les commandes mensuelles (simulées pour l'instant)
                // Dans un système réel, vous pourriez calculer cela à partir d'une table de commandes
                const monthlyOrders = services.reduce((sum, service) => sum + (service.totalOrders || 0), 0);
                // Calculer le temps de livraison moyen
                const totalDeliveryTime = services.reduce((sum, service) => sum + (service.deliveryTime || 0), 0);
                const avgDeliveryTime = services.length > 0 ? Math.round(totalDeliveryTime / services.length) : 0;
                // Calculer le prix moyen
                const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
                const avgPrice = services.length > 0 ? Math.round(totalPrice / services.length) : 0;
                return {
                    stats: {
                        avgRating,
                        monthlyOrders,
                        avgDeliveryTime,
                        avgPrice,
                        totalServices: services.length,
                    }
                };
            }
            catch (error) {
                console.error('Error calculating service stats:', error);
                return {
                    stats: {
                        avgRating: 0,
                        monthlyOrders: 0,
                        avgDeliveryTime: 0,
                        avgPrice: 0,
                        totalServices: 0,
                    }
                };
            }
        }
    };
    return ServicesService = _classThis;
})();
exports.ServicesService = ServicesService;
