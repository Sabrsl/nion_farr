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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const user_role_enum_1 = require("../users/enums/user-role.enum");
let ReviewsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReviewsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReviewsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reviewRepository;
        ordersService;
        usersService;
        constructor(reviewRepository, ordersService, usersService) {
            this.reviewRepository = reviewRepository;
            this.ordersService = ordersService;
            this.usersService = usersService;
        }
        async create(createReviewDto, userId) {
            // Vérifier que la commande existe et qu'elle est complétée
            const order = await this.ordersService.findOne(createReviewDto.orderId, { id: userId });
            // Vérifier que l'utilisateur est le client de la commande
            if (order.clientId !== userId) {
                throw new common_1.ForbiddenException('Seul le client peut laisser un avis sur une commande');
            }
            // Vérifier que la commande est terminée
            if (order.status !== 'completed') {
                throw new common_1.ForbiddenException('Les avis ne peuvent être laissés que sur des commandes terminées');
            }
            // Vérifier qu'il n'y a pas déjà un avis pour cette commande
            const existingReview = await this.reviewRepository.findOne({
                where: { orderId: createReviewDto.orderId }
            });
            if (existingReview) {
                throw new common_1.ForbiddenException('Un avis a déjà été laissé pour cette commande');
            }
            // Créer l'avis
            const review = this.reviewRepository.create({
                ...createReviewDto,
                reviewerId: userId,
                revieweeId: order.freelancerId,
                serviceId: order.serviceId
            });
            const savedReview = await this.reviewRepository.save(review);
            // Mettre à jour le statut de la commande pour indiquer qu'elle a été notée
            await this.ordersService.update(createReviewDto.orderId, { isRated: true }, { id: userId });
            // Mettre à jour la note moyenne du freelancer
            await this.updateFreelancerRating(order.freelancerId);
            return savedReview;
        }
        async findAll() {
            return this.reviewRepository.find({
                relations: ['reviewer', 'reviewee', 'service', 'order']
            });
        }
        async findOne(id) {
            const review = await this.reviewRepository.findOne({
                where: { id },
                relations: ['reviewer', 'reviewee', 'service', 'order']
            });
            if (!review) {
                throw new common_1.NotFoundException(`Review with ID ${id} not found`);
            }
            return review;
        }
        async update(id, updateReviewDto, user) {
            const review = await this.findOne(id);
            // Vérifier que l'utilisateur est l'auteur de l'avis ou un admin
            if (review.reviewerId !== user.id && user.role !== user_role_enum_1.UserRole.ADMIN) {
                throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à modifier cet avis');
            }
            await this.reviewRepository.update(id, updateReviewDto);
            // Si la note a été modifiée, mettre à jour la note moyenne du freelancer
            if (updateReviewDto.rating) {
                await this.updateFreelancerRating(review.revieweeId);
            }
            return this.findOne(id);
        }
        async remove(id) {
            const review = await this.findOne(id);
            await this.reviewRepository.remove(review);
            // Mettre à jour la note moyenne du freelancer
            await this.updateFreelancerRating(review.revieweeId);
            return { id, removed: true };
        }
        async respond(id, respondDto, user) {
            const review = await this.findOne(id);
            // Vérifier que l'utilisateur est le freelancer évalué
            if (review.revieweeId !== user.id && user.role !== user_role_enum_1.UserRole.ADMIN) {
                throw new common_1.ForbiddenException('Seul le prestataire évalué peut répondre à cet avis');
            }
            const updateData = {
                response: respondDto.response,
                responseDate: new Date()
            };
            await this.reviewRepository.update(id, updateData);
            return this.findOne(id);
        }
        async report(id, reportDto, userId) {
            const review = await this.findOne(id);
            // Ajouter le signalement à l'avis
            // Dans un système complet, cela pourrait être stocké dans une table séparée
            const updateData = {
                isReported: true,
                reportReason: reportDto.reason,
                reportDetails: reportDto.details
            };
            await this.reviewRepository.update(id, updateData);
            return this.findOne(id);
        }
        async findByUser(userId) {
            return this.reviewRepository.find({
                where: [
                    { reviewerId: userId },
                    { revieweeId: userId }
                ],
                relations: ['reviewer', 'reviewee', 'service', 'order']
            });
        }
        async findByService(serviceId) {
            return this.reviewRepository.find({
                where: { serviceId },
                relations: ['reviewer', 'service']
            });
        }
        async findByOrder(orderId, user) {
            // Vérifier que l'utilisateur a accès à la commande
            const order = await this.ordersService.findOne(orderId, user);
            return this.reviewRepository.findOne({
                where: { orderId },
                relations: ['reviewer', 'reviewee', 'service', 'order']
            });
        }
        async updateFreelancerRating(freelancerId) {
            // Calculer la nouvelle note moyenne
            const reviews = await this.reviewRepository.find({
                where: { revieweeId: freelancerId }
            });
            if (reviews.length === 0) {
                return;
            }
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            // Mettre à jour la note moyenne du freelancer
            await this.usersService.update(freelancerId, {
                rating: parseFloat(averageRating.toFixed(2)),
                totalReviews: reviews.length
            });
        }
    };
    return ReviewsService = _classThis;
})();
exports.ReviewsService = ReviewsService;
