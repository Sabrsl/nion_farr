import { connect, disconnect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, UserStatus } from '../models/user.model';
import { ServiceCategory, ServiceStatus } from '../models/service.model';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../models/order.model';

// Charger les variables d'environnement
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nionfar';

async function seed() {
  try {
    console.log('Connexion à MongoDB...');
    await connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Supprimer toutes les collections existantes
    console.log('Nettoyage de la base de données...');
    const db = (await connect(MONGODB_URI)).connection.db;
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.dropCollection(collection.name);
    }
    console.log('Base de données nettoyée');

    // Définition des modèles
    const User = db.collection('users');
    const Service = db.collection('services');
    const Order = db.collection('orders');
    const Message = db.collection('messages');
    const Conversation = db.collection('conversations');
    const Withdrawal = db.collection('withdrawals');
    const Dispute = db.collection('disputes');
    const Transaction = db.collection('transactions');

    // Création des utilisateurs
    console.log('Création des utilisateurs...');
    
    // Mot de passe commun haché
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    // Création de l'administrateur
    const adminId = (await User.insertOne({
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
    })).insertedId;
    
    // Création de clients
    const clientIds = [];
    for (let i = 1; i <= 5; i++) {
      const clientId = (await User.insertOne({
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
      })).insertedId;
      
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
      const freelanceId = (await User.insertOne({
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
        skills: skills[i-1],
        isEmailVerified: true,
        isPhoneVerified: true,
        isIdentityVerified: i <= 3,
        memberSince: new Date(Date.now() - i * 60 * 24 * 60 * 60 * 1000), // i * 2 mois dans le passé
        completedOrders: i * 5,
        rating: 3.5 + i * 0.3,
        totalReviews: i * 3,
        providerProfile: {
          title: `Freelance professionnel en ${skills[i-1][0]}`,
          description: `Je vous propose mes services de qualité en ${skills[i-1].join(', ')}. J'ai plus de ${i} ans d'expérience.`,
          experience: i,
          hourlyRate: 5000 + i * 1000,
          languages: ['Français', 'Anglais', 'Wolof'],
          responseTime: '~2h',
          availability: 'Full-time',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })).insertedId;
      
      freelanceIds.push(freelanceId);
    }
    
    console.log('Utilisateurs créés');
    
    // Création des services
    console.log('Création des services...');
    
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
      const serviceId = (await Service.insertOne({
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
      })).insertedId;
      
      serviceIds.push(serviceId);
    }
    
    console.log('Services créés');
    
    // Création des commandes
    console.log('Création des commandes...');
    
    const orders = [];
    const orderStatuses = Object.values(OrderStatus);
    
    for (let i = 0; i < 10; i++) {
      const serviceIndex = i % serviceIds.length;
      const clientIndex = i % clientIds.length;
      const service = await Service.findOne({ _id: serviceIds[serviceIndex] });
      const provider = await User.findOne({ _id: service.provider });
      
      const status = orderStatuses[Math.floor(Math.random() * (orderStatuses.length - 2)) + 1]; // Éviter les statuts extrêmes
      const orderDate = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000); // Échelonné sur le dernier mois
      
      const order = {
        orderNumber: `ORD-${Date.now().toString().slice(-8)}-${i}`,
        service: serviceIds[serviceIndex],
        client: clientIds[clientIndex],
        provider: service.provider,
        status: status,
        price: service.price,
        serviceFee: Math.round(service.price * 0.05),
        totalAmount: Math.round(service.price * 1.05),
        paymentStatus: status === OrderStatus.EN_ATTENTE_PAIEMENT ? PaymentStatus.EN_ATTENTE : PaymentStatus.PAYE,
        paymentMethod: [PaymentMethod.WAVE, PaymentMethod.ORANGE_MONEY, PaymentMethod.FREE_MONEY][i % 3],
        transactionId: `TXN-${uuidv4().substring(0, 8)}`,
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
        createdAt: orderDate,
        updatedAt: new Date(),
        deliverables: [] as any[],
        isReviewed: false,
        review: null as any,
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

      const orderId = (await Order.insertOne(order)).insertedId;
      orders.push({ id: orderId, ...order });
    }
    
    console.log('Commandes créées');
    
    // Création des conversations et messages
    console.log('Création des conversations et messages...');
    
    for (const order of orders) {
      const conversationId = (await Conversation.insertOne({
        participants: [order.client, order.provider],
        order: order.id,
        isActive: true,
        isOrderRelated: true,
        title: `Conversation pour commande ${order.orderNumber}`,
        unreadCount: { [order.client.toString()]: 0, [order.provider.toString()]: 0 },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })).insertedId;
      
      // Générer quelques messages
      const client = await User.findOne({ _id: order.client });
      const provider = await User.findOne({ _id: order.provider });
      
      const messages = [
        {
          sender: order.client,
          recipient: order.provider,
          conversation: conversationId,
          order: order.id,
          content: `Bonjour, je viens de commander votre service "${(await Service.findOne({ _id: order.service })).title}". J'aimerais discuter de quelques détails.`,
          type: 'text',
          isRead: true,
          createdAt: new Date(order.createdAt.getTime() + 1 * 60 * 60 * 1000),
          updatedAt: new Date(order.createdAt.getTime() + 1 * 60 * 60 * 1000),
        },
        {
          sender: order.provider,
          recipient: order.client,
          conversation: conversationId,
          order: order.id,
          content: `Bonjour ${client.firstName}, merci pour votre commande ! Je suis disponible pour discuter des détails. Quelles sont vos attentes précises ?`,
          type: 'text',
          isRead: true,
          createdAt: new Date(order.createdAt.getTime() + 3 * 60 * 60 * 1000),
          updatedAt: new Date(order.createdAt.getTime() + 3 * 60 * 60 * 1000),
        },
      ];
      
      if (order.status !== OrderStatus.EN_ATTENTE && order.status !== OrderStatus.EN_ATTENTE_PAIEMENT) {
        messages.push({
          sender: order.client,
          recipient: order.provider,
          conversation: conversationId,
          order: order.id,
          content: `Voici quelques précisions supplémentaires pour ma commande : j'aimerais que le style soit moderne et épuré.`,
          type: 'text',
          isRead: true,
          createdAt: new Date(order.createdAt.getTime() + 5 * 60 * 60 * 1000),
          updatedAt: new Date(order.createdAt.getTime() + 5 * 60 * 60 * 1000),
        });
        
        messages.push({
          sender: order.provider,
          recipient: order.client,
          conversation: conversationId,
          order: order.id,
          content: `C'est bien noté ! Je vais travailler dans ce sens. Je vous tiendrai informé de l'avancement.`,
          type: 'text',
          isRead: order.status !== OrderStatus.EN_COURS,
          createdAt: new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000),
          updatedAt: new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000),
        });
      }
      
      await Message.insertMany(messages);
      
      // Mettre à jour le dernier message dans la conversation
      await Conversation.updateOne(
        { _id: conversationId },
        {
          $set: {
            lastMessage: {
              content: messages[messages.length - 1].content,
              createdAt: messages[messages.length - 1].createdAt,
              sender: messages[messages.length - 1].sender,
              type: messages[messages.length - 1].type,
            },
          },
        }
      );
    }
    
    console.log('Conversations et messages créés');
    
    // Création de quelques litiges
    console.log('Création des litiges...');
    
    const disputeOrder = orders.find(o => o.status === OrderStatus.LITIGE);
    if (disputeOrder) {
      await Dispute.insertOne({
        order: disputeOrder.id,
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
            actor: disputeOrder.client.toString(),
          },
          {
            status: 'under_review',
            date: new Date(disputeOrder.createdAt.getTime() + 16 * 24 * 60 * 60 * 1000),
            comments: 'Litige en cours d\'examen par l\'administrateur',
            actor: adminId.toString(),
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
      });
      
      console.log('Litige créé');
    }
    
    // Création de quelques retraits
    console.log('Création des retraits...');
    
    for (let i = 0; i < 3; i++) {
      const freelanceId = freelanceIds[i];
      const freelance = await User.findOne({ _id: freelanceId });
      
      await Withdrawal.insertOne({
        user: freelanceId,
        amount: 50000 + i * 20000,
        status: i === 0 ? 'completed' : i === 1 ? 'processing' : 'pending',
        method: ['wave', 'orange_money', 'bank_transfer'][i],
        paymentDetails: {
          accountName: `${freelance.firstName} ${freelance.lastName}`,
          mobileNumber: freelance.phone,
          provider: ['Wave', 'Orange Money', 'Bank'][i],
        },
        transactionId: i === 0 ? `WTH-${uuidv4().substring(0, 8)}` : null,
        processedAt: i === 0 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : i === 1 ? new Date() : null,
        completedAt: i === 0 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : null,
        history: [
          {
            status: 'pending',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            notes: 'Demande de retrait soumise',
            by: freelanceId.toString(),
          },
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: i === 0 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : i === 1 ? new Date() : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      });
    }
    
    console.log('Retraits créés');
    
    // Création de transactions
    console.log('Création des transactions...');
    
    for (const order of orders.filter(o => o.status !== OrderStatus.EN_ATTENTE_PAIEMENT)) {
      await Transaction.insertOne({
        transactionId: order.transactionId,
        type: 'order_payment',
        amount: order.totalAmount,
        user: order.client,
        status: 'completed',
        order: order.id,
        paymentMethod: order.paymentMethod,
        paymentProvider: order.paymentMethod === PaymentMethod.WAVE ? 'Wave' 
                        : order.paymentMethod === PaymentMethod.ORANGE_MONEY ? 'Orange Money'
                        : order.paymentMethod === PaymentMethod.FREE_MONEY ? 'Free Money'
                        : 'Card',
        externalTransactionId: `EXT-${uuidv4().substring(0, 8)}`,
        description: `Paiement pour la commande ${order.orderNumber}`,
        processedAt: order.paymentDate,
        source: order.client.toString(),
        destination: 'platform',
        fee: order.serviceFee,
        currency: 'XOF',
        createdAt: order.paymentDate,
        updatedAt: order.paymentDate,
      });
    }
    
    // Ajouter des transactions pour les retraits
    const completedWithdrawal = await Withdrawal.findOne({ status: 'completed' });
    if (completedWithdrawal) {
      await Transaction.insertOne({
        transactionId: completedWithdrawal.transactionId,
        type: 'withdrawal',
        amount: completedWithdrawal.amount,
        user: completedWithdrawal.user,
        status: 'completed',
        withdrawal: completedWithdrawal._id,
        paymentMethod: completedWithdrawal.method,
        paymentProvider: completedWithdrawal.paymentDetails.provider,
        externalTransactionId: `EXT-${uuidv4().substring(0, 8)}`,
        description: `Retrait de fonds vers ${completedWithdrawal.method}`,
        processedAt: completedWithdrawal.completedAt,
        source: 'platform',
        destination: completedWithdrawal.user.toString(),
        fee: 500,
        currency: 'XOF',
        createdAt: completedWithdrawal.createdAt,
        updatedAt: completedWithdrawal.updatedAt,
      });
    }
    
    console.log('Transactions créées');
    
    console.log('Seed terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du seed :', error);
  } finally {
    // Fermer la connexion à MongoDB
    await disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le seed
seed(); 