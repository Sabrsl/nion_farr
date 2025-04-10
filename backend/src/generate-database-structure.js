"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcrypt"));
// Constantes pour les enums
const UserRole = {
    CLIENT: 'client',
    PROVIDER: 'provider',
    ADMIN: 'admin',
};
const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending_verification',
};
const ServiceCategory = {
    GRAPHIC_DESIGN: 'graphic_design',
    WEB_DEVELOPMENT: 'web_development',
    MOBILE_DEVELOPMENT: 'mobile_development',
    CONTENT_WRITING: 'content_writing',
    TRANSLATION: 'translation',
    MARKETING: 'marketing',
    VIDEO_EDITING: 'video_editing',
    VOICE_OVER: 'voice_over',
    SOCIAL_MEDIA: 'social_media',
    OTHER: 'other',
};
const ServiceStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    REJECTED: 'rejected',
};
const OrderStatus = {
    EN_ATTENTE: 'en_attente',
    EN_ATTENTE_PAIEMENT: 'en_attente_paiement',
    EN_ATTENTE_ACCEPTATION: 'en_attente_acceptation',
    EN_COURS: 'en_cours',
    LIVRE: 'livre',
    REVISION_DEMANDEE: 'revision_demandee',
    EN_MODIFICATION: 'en_modification',
    TERMINE: 'termine',
    ANNULE: 'annule',
    LITIGE: 'litige',
    LIVRAISON_EN_RETARD: 'livraison_en_retard',
};
const PaymentStatus = {
    EN_ATTENTE: 'en_attente',
    PAYE: 'paye',
    REMBOURSE: 'rembourse',
    ANNULE: 'annule',
};
const PaymentMethod = {
    WAVE: 'wave',
    ORANGE_MONEY: 'orange_money',
    FREE_MONEY: 'free_money',
    CARTE_BANCAIRE: 'carte_bancaire',
};
const DisputeStatus = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    RESOLVED_FOR_CLIENT: 'resolved_for_client',
    RESOLVED_FOR_PROVIDER: 'resolved_for_provider',
    CANCELLED: 'cancelled',
};
const WithdrawalStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
};
const TransactionType = {
    ORDER_PAYMENT: 'order_payment',
    WITHDRAWAL: 'withdrawal',
    REFUND: 'refund',
    COMMISSION: 'commission',
    SYSTEM_ADJUSTMENT: 'system_adjustment',
};
const TransactionStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};
async function generateDatabase() {
    try {
        console.log('Génération de la structure de la base de données...');
        // Mot de passe commun haché
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        // Structure de la base de données
        const database = {
            users: [],
            services: [],
            orders: [],
            messages: [],
            conversations: [],
            withdrawals: [],
            disputes: [],
            transactions: [],
        };
        // Création de l'administrateur
        const adminId = (0, uuid_1.v4)();
        const admin = {
            _id: adminId,
            firstName: 'Admin',
            lastName: 'Nionfar',
            email: 'admin@nionfar.sn',
            password: hashedPassword,
            username: 'admin',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            phone: '+221777777777',
            address: 'Dakar, Sénégal',
            city: 'Dakar',
            country: 'Sénégal',
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdentityVerified: true,
            memberSince: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        database.users.push(admin);
        // Création de clients
        const clientIds = [];
        for (let i = 1; i <= 5; i++) {
            const clientId = (0, uuid_1.v4)();
            const client = {
                _id: clientId,
                firstName: `Client${i}`,
                lastName: `Utilisateur${i}`,
                email: `client${i}@example.com`,
                password: hashedPassword,
                username: `client${i}`,
                role: UserRole.CLIENT,
                status: UserStatus.ACTIVE,
                phone: `+22178${i}000${i}${i}`,
                address: 'Dakar, Sénégal',
                city: 'Dakar',
                country: 'Sénégal',
                isEmailVerified: true,
                isPhoneVerified: i % 2 === 0,
                memberSince: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000), // i mois dans le passé
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            database.users.push(client);
            clientIds.push(clientId);
        }
        // Création de freelances
        const freelanceIds = [];
        const skills = [
            ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
            ['Photoshop', 'Illustrator', 'InDesign', 'Figma'],
            ['Rédaction', 'SEO', 'Copywriting', 'Storytelling'],
            ['Montage vidéo', 'After Effects', 'Premiere Pro'],
            ['Traduction', 'Français', 'Anglais', 'Wolof']
        ];
        for (let i = 1; i <= 5; i++) {
            const freelanceId = (0, uuid_1.v4)();
            const freelance = {
                _id: freelanceId,
                firstName: `Freelance${i}`,
                lastName: `Prestataire${i}`,
                email: `freelance${i}@example.com`,
                password: hashedPassword,
                username: `freelance${i}`,
                role: UserRole.PROVIDER,
                status: UserStatus.ACTIVE,
                phone: `+22176${i}000${i}${i}`,
                address: 'Dakar, Sénégal',
                city: 'Dakar',
                country: 'Sénégal',
                bio: `Je suis un freelance professionnel avec plus de ${i} ans d'expérience dans mon domaine.`,
                skills: skills[i - 1],
                isEmailVerified: true,
                isPhoneVerified: true,
                isIdentityVerified: i <= 3,
                memberSince: new Date(Date.now() - i * 60 * 24 * 60 * 60 * 1000), // i * 2 mois dans le passé
                completedOrders: i * 5,
                rating: 3.5 + i * 0.3,
                totalReviews: i * 3,
                providerProfile: {
                    title: `Freelance professionnel en ${skills[i - 1][0]}`,
                    description: `Je vous propose mes services de qualité en ${skills[i - 1].join(', ')}. J'ai plus de ${i} ans d'expérience.`,
                    experience: i,
                    hourlyRate: 5000 + i * 1000,
                    languages: ['Français', 'Anglais', 'Wolof'],
                    responseTime: '~2h',
                    availability: 'Full-time',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            database.users.push(freelance);
            freelanceIds.push(freelanceId);
        }
        // Création des services
        const services = [
            {
                title: 'Création de site web sur mesure',
                shortDescription: 'Site web professionnel adapté à vos besoins',
                description: 'Je crée des sites web professionnels et responsifs qui répondent parfaitement à vos besoins et aux attentes de vos clients. Du design à l\'intégration, je m\'occupe de tout.',
                category: ServiceCategory.WEB_DEVELOPMENT,
                tags: ['web', 'site', 'responsive', 'design'],
                price: 150000,
                deliveryTime: 7,
                revisions: 3,
                provider: freelanceIds[0],
            },
            {
                title: 'Design de logo professionnel',
                shortDescription: 'Logo unique et mémorable pour votre marque',
                description: 'Je crée des logos uniques et mémorables qui représentent parfaitement votre marque et ses valeurs. Livraison en plusieurs formats adaptés à tous vos supports.',
                category: ServiceCategory.GRAPHIC_DESIGN,
                tags: ['logo', 'branding', 'identité visuelle'],
                price: 75000,
                deliveryTime: 3,
                revisions: 5,
                provider: freelanceIds[1],
            },
            {
                title: 'Rédaction d\'articles optimisés SEO',
                shortDescription: 'Contenu de qualité optimisé pour les moteurs de recherche',
                description: 'Je rédige des articles de qualité, optimisés pour les moteurs de recherche, qui augmenteront votre visibilité sur internet et engageront vos lecteurs.',
                category: ServiceCategory.CONTENT_WRITING,
                tags: ['seo', 'rédaction', 'blog', 'contenu'],
                price: 25000,
                deliveryTime: 2,
                revisions: 2,
                provider: freelanceIds[2],
            },
            {
                title: 'Montage vidéo professionnel',
                shortDescription: 'Montage vidéo de qualité pour tous vos projets',
                description: 'Je réalise des montages vidéo professionnels pour vos projets personnels ou professionnels. Animations, transitions, effets spéciaux, tout est possible.',
                category: ServiceCategory.VIDEO_EDITING,
                tags: ['vidéo', 'montage', 'animation'],
                price: 50000,
                deliveryTime: 4,
                revisions: 2,
                provider: freelanceIds[3],
            },
            {
                title: 'Traduction français-anglais professionnelle',
                shortDescription: 'Traduction précise et de qualité pour vos documents',
                description: 'Je traduis vos documents du français vers l\'anglais (et vice versa) avec précision et dans le respect du sens original de vos textes.',
                category: ServiceCategory.TRANSLATION,
                tags: ['traduction', 'français', 'anglais'],
                price: 15000,
                deliveryTime: 1,
                revisions: 1,
                provider: freelanceIds[4],
            },
        ];
        const serviceIds = [];
        for (const service of services) {
            const serviceId = (0, uuid_1.v4)();
            const serviceObj = {
                _id: serviceId,
                ...service,
                images: [`/images/services/service-${services.indexOf(service) + 1}.jpg`],
                thumbnail: `/images/services/thumbnail-${services.indexOf(service) + 1}.jpg`,
                status: ServiceStatus.ACTIVE,
                isFeatured: services.indexOf(service) < 3,
                views: Math.floor(Math.random() * 100) + 20,
                sales: Math.floor(Math.random() * 10) + 1,
                rating: 4 + (Math.random() * 1),
                totalReviews: Math.floor(Math.random() * 20) + 5,
                faqs: [
                    {
                        question: 'Quel est le délai de livraison ?',
                        answer: `Le délai standard est de ${service.deliveryTime} jours, mais cela peut varier selon la complexité du projet.`
                    },
                    {
                        question: 'Combien de révisions sont incluses ?',
                        answer: `${service.revisions} révisions sont incluses dans le prix. Des révisions supplémentaires peuvent être négociées.`
                    },
                ],
                requirements: [
                    {
                        title: 'Informations sur votre projet',
                        description: 'Veuillez fournir une description détaillée de ce que vous attendez.',
                        isRequired: true,
                        type: 'text',
                    },
                    {
                        title: 'Références ou exemples',
                        description: 'Si vous avez des exemples ou des références, merci de les partager.',
                        isRequired: false,
                        type: 'file',
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            database.services.push(serviceObj);
            serviceIds.push(serviceId);
        }
        // Création des commandes et conversations
        const orderStatuses = Object.values(OrderStatus);
        const orders = [];
        for (let i = 0; i < 10; i++) {
            const serviceIndex = i % serviceIds.length;
            const clientIndex = i % clientIds.length;
            const serviceId = serviceIds[serviceIndex];
            const service = database.services.find(s => s._id === serviceId);
            const providerId = service.provider;
            const provider = database.users.find(u => u._id === providerId);
            const status = orderStatuses[Math.floor(Math.random() * (orderStatuses.length - 2)) + 1]; // Éviter les statuts extrêmes
            const orderDate = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000); // Échelonné sur le dernier mois
            const orderId = (0, uuid_1.v4)();
            const order = {
                _id: orderId,
                orderNumber: `ORD-${Date.now().toString().slice(-8)}-${i}`,
                service: serviceId,
                client: clientIds[clientIndex],
                provider: providerId,
                status: status,
                price: service.price,
                serviceFee: Math.round(service.price * 0.05),
                totalAmount: Math.round(service.price * 1.05),
                paymentStatus: status === OrderStatus.EN_ATTENTE_PAIEMENT ? PaymentStatus.EN_ATTENTE : PaymentStatus.PAYE,
                paymentMethod: [PaymentMethod.WAVE, PaymentMethod.ORANGE_MONEY, PaymentMethod.FREE_MONEY][i % 3],
                transactionId: `TXN-${(0, uuid_1.v4)().substring(0, 8)}`,
                paymentDate: status !== OrderStatus.EN_ATTENTE_PAIEMENT ? orderDate : null,
                deliveryTime: service.deliveryTime,
                deadline: new Date(orderDate.getTime() + service.deliveryTime * 24 * 60 * 60 * 1000),
                expectedDeliveryDate: new Date(orderDate.getTime() + service.deliveryTime * 24 * 60 * 60 * 1000),
                requirements: [
                    {
                        question: 'Que souhaitez-vous exactement ?',
                        answer: `Je souhaite un ${service.title} qui répond à ces critères...`,
                        attachment: '',
                    },
                ],
                revisionsRemaining: service.revisions,
                deliverables: [],
                isReviewed: false,
                review: null,
                createdAt: orderDate,
                updatedAt: new Date(),
            };
            // Ajouter des livrables pour les commandes livrées
            if (status === OrderStatus.LIVRE || status === OrderStatus.TERMINE) {
                order.deliverables = [
                    {
                        title: `Livraison de ${service.title}`,
                        description: 'Voici la première version du travail demandé.',
                        files: ['/uploads/deliverable-example.zip'],
                        deliveredAt: new Date(orderDate.getTime() + (service.deliveryTime - 1) * 24 * 60 * 60 * 1000),
                        status: 'pending',
                    },
                ];
            }
            // Ajouter une review pour les commandes terminées
            if (status === OrderStatus.TERMINE) {
                order.isReviewed = true;
                order.review = {
                    rating: 4 + Math.random(),
                    comment: `Excellent travail ! ${provider.firstName} a parfaitement compris mes besoins.`,
                    createdAt: new Date(orderDate.getTime() + (service.deliveryTime + 2) * 24 * 60 * 60 * 1000),
                };
            }
            database.orders.push(order);
            orders.push(order);
            // Création de la conversation pour cette commande
            const conversationId = (0, uuid_1.v4)();
            const conversation = {
                _id: conversationId,
                participants: [order.client, order.provider],
                order: orderId,
                isActive: true,
                isOrderRelated: true,
                title: `Conversation pour commande ${order.orderNumber}`,
                unreadCount: { [order.client]: 0, [order.provider]: 0 },
                lastMessage: null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };
            database.conversations.push(conversation);
            // Création des messages pour cette conversation
            const client = database.users.find(u => u._id === order.client);
            const messages = [
                {
                    _id: (0, uuid_1.v4)(),
                    sender: order.client,
                    recipient: order.provider,
                    conversation: conversationId,
                    order: orderId,
                    content: `Bonjour, je viens de commander votre service "${service.title}". J'aimerais discuter de quelques détails.`,
                    type: 'text',
                    isRead: true,
                    createdAt: new Date(order.createdAt.getTime() + 1 * 60 * 60 * 1000),
                    updatedAt: new Date(order.createdAt.getTime() + 1 * 60 * 60 * 1000),
                },
                {
                    _id: (0, uuid_1.v4)(),
                    sender: order.provider,
                    recipient: order.client,
                    conversation: conversationId,
                    order: orderId,
                    content: `Bonjour ${client.firstName}, merci pour votre commande ! Je suis disponible pour discuter des détails. Quelles sont vos attentes précises ?`,
                    type: 'text',
                    isRead: true,
                    createdAt: new Date(order.createdAt.getTime() + 3 * 60 * 60 * 1000),
                    updatedAt: new Date(order.createdAt.getTime() + 3 * 60 * 60 * 1000),
                },
            ];
            if (status !== OrderStatus.EN_ATTENTE && status !== OrderStatus.EN_ATTENTE_PAIEMENT) {
                messages.push({
                    _id: (0, uuid_1.v4)(),
                    sender: order.client,
                    recipient: order.provider,
                    conversation: conversationId,
                    order: orderId,
                    content: `Voici quelques précisions supplémentaires pour ma commande : j'aimerais que le style soit moderne et épuré.`,
                    type: 'text',
                    isRead: true,
                    createdAt: new Date(order.createdAt.getTime() + 5 * 60 * 60 * 1000),
                    updatedAt: new Date(order.createdAt.getTime() + 5 * 60 * 60 * 1000),
                });
                messages.push({
                    _id: (0, uuid_1.v4)(),
                    sender: order.provider,
                    recipient: order.client,
                    conversation: conversationId,
                    order: orderId,
                    content: `C'est bien noté ! Je vais travailler dans ce sens. Je vous tiendrai informé de l'avancement.`,
                    type: 'text',
                    isRead: order.status !== OrderStatus.EN_COURS,
                    createdAt: new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000),
                    updatedAt: new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000),
                });
            }
            database.messages.push(...messages);
            // Mettre à jour le dernier message dans la conversation
            conversation.lastMessage = {
                content: messages[messages.length - 1].content,
                createdAt: messages[messages.length - 1].createdAt,
                sender: messages[messages.length - 1].sender,
                type: messages[messages.length - 1].type,
            };
        }
        // Création des litiges
        const disputeOrder = orders.find(o => o.status === OrderStatus.LITIGE);
        if (disputeOrder) {
            const disputeId = (0, uuid_1.v4)();
            const dispute = {
                _id: disputeId,
                order: disputeOrder._id,
                openedBy: disputeOrder.client,
                reason: 'quality_not_as_expected',
                description: 'Le travail livré ne correspond pas du tout à ce que j\'attendais.',
                evidence: ['/uploads/dispute-evidence.jpg'],
                status: 'under_review',
                timeline: [
                    {
                        status: 'pending',
                        date: new Date(disputeOrder.createdAt.getTime() + 15 * 24 * 60 * 60 * 1000),
                        comments: 'Litige ouvert par le client',
                        actor: disputeOrder.client,
                    },
                    {
                        status: 'under_review',
                        date: new Date(disputeOrder.createdAt.getTime() + 16 * 24 * 60 * 60 * 1000),
                        comments: 'Litige en cours d\'examen par l\'administrateur',
                        actor: adminId,
                    },
                ],
                messages: [
                    {
                        sender: disputeOrder.client,
                        content: 'Le prestataire n\'a pas respecté mes exigences malgré plusieurs explications.',
                        createdAt: new Date(disputeOrder.createdAt.getTime() + 15 * 24 * 60 * 60 * 1000),
                        isAdmin: false,
                        attachments: [],
                    },
                ],
                createdAt: new Date(disputeOrder.createdAt.getTime() + 15 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(disputeOrder.createdAt.getTime() + 16 * 24 * 60 * 60 * 1000),
            };
            database.disputes.push(dispute);
        }
        // Création des retraits
        for (let i = 0; i < 3; i++) {
            const freelanceId = freelanceIds[i];
            const freelance = database.users.find(u => u._id === freelanceId);
            const withdrawalId = (0, uuid_1.v4)();
            const withdrawal = {
                _id: withdrawalId,
                user: freelanceId,
                amount: 50000 + i * 20000,
                status: i === 0 ? 'completed' : i === 1 ? 'processing' : 'pending',
                method: ['wave', 'orange_money', 'bank_transfer'][i],
                paymentDetails: {
                    accountName: `${freelance.firstName} ${freelance.lastName}`,
                    mobileNumber: freelance.phone,
                    provider: ['Wave', 'Orange Money', 'Bank'][i],
                },
                transactionId: i === 0 ? `WTH-${(0, uuid_1.v4)().substring(0, 8)}` : null,
                processedAt: i === 0 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : i === 1 ? new Date() : null,
                completedAt: i === 0 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : null,
                history: [
                    {
                        status: 'pending',
                        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                        notes: 'Demande de retrait soumise',
                        by: freelanceId,
                    },
                ],
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: i === 0 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : i === 1 ? new Date() : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            };
            database.withdrawals.push(withdrawal);
        }
        // Création des transactions
        for (const order of orders.filter(o => o.status !== OrderStatus.EN_ATTENTE_PAIEMENT)) {
            const transactionId = (0, uuid_1.v4)();
            const transaction = {
                _id: transactionId,
                transactionId: order.transactionId,
                type: 'order_payment',
                amount: order.totalAmount,
                user: order.client,
                status: 'completed',
                order: order._id,
                paymentMethod: order.paymentMethod,
                paymentProvider: order.paymentMethod === PaymentMethod.WAVE ? 'Wave'
                    : order.paymentMethod === PaymentMethod.ORANGE_MONEY ? 'Orange Money'
                        : order.paymentMethod === PaymentMethod.FREE_MONEY ? 'Free Money'
                            : 'Card',
                externalTransactionId: `EXT-${(0, uuid_1.v4)().substring(0, 8)}`,
                description: `Paiement pour la commande ${order.orderNumber}`,
                processedAt: order.paymentDate,
                source: order.client,
                destination: 'platform',
                fee: order.serviceFee,
                currency: 'XOF',
                createdAt: order.paymentDate,
                updatedAt: order.paymentDate,
            };
            database.transactions.push(transaction);
        }
        // Ajouter des transactions pour les retraits
        const completedWithdrawal = database.withdrawals.find(w => w.status === 'completed');
        if (completedWithdrawal) {
            const transactionId = (0, uuid_1.v4)();
            const transaction = {
                _id: transactionId,
                transactionId: completedWithdrawal.transactionId,
                type: 'withdrawal',
                amount: completedWithdrawal.amount,
                user: completedWithdrawal.user,
                status: 'completed',
                withdrawal: completedWithdrawal._id,
                paymentMethod: completedWithdrawal.method,
                paymentProvider: completedWithdrawal.paymentDetails.provider,
                externalTransactionId: `EXT-${(0, uuid_1.v4)().substring(0, 8)}`,
                description: `Retrait de fonds vers ${completedWithdrawal.method}`,
                processedAt: completedWithdrawal.completedAt,
                source: 'platform',
                destination: completedWithdrawal.user,
                fee: 500,
                currency: 'XOF',
                createdAt: completedWithdrawal.createdAt,
                updatedAt: completedWithdrawal.updatedAt,
            };
            database.transactions.push(transaction);
        }
        // Écrire la structure dans un fichier
        const outputDir = path.join(__dirname, '../db');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outputDir, 'database-structure.json'), JSON.stringify(database, null, 2), 'utf8');
        console.log('Structure de la base de données générée avec succès !');
        console.log(`Fichier sauvegardé dans: ${path.join(outputDir, 'database-structure.json')}`);
        // Générer des statistiques sur la structure
        console.log('\n=== STATISTIQUES DE LA BASE DE DONNÉES ===');
        console.log(`Utilisateurs: ${database.users.length} (${database.users.filter(u => u.role === UserRole.CLIENT).length} clients, ${database.users.filter(u => u.role === UserRole.PROVIDER).length} prestataires, ${database.users.filter(u => u.role === UserRole.ADMIN).length} administrateurs)`);
        console.log(`Services: ${database.services.length}`);
        console.log(`Commandes: ${database.orders.length}`);
        console.log(`Conversations: ${database.conversations.length}`);
        console.log(`Messages: ${database.messages.length}`);
        console.log(`Litiges: ${database.disputes.length}`);
        console.log(`Retraits: ${database.withdrawals.length}`);
        console.log(`Transactions: ${database.transactions.length}`);
    }
    catch (error) {
        console.error('Erreur lors de la génération de la structure:', error);
    }
}
generateDatabase();
