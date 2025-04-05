import { Review } from '../types';

export const mockReviews: Review[] = [
  {
    id: '1',
    reviewer: {
      id: '101',
      name: 'Fatou Ndiaye',
      email: 'fatou@example.com',
      avatar: '/images/avatars/avatar-2.jpg',
      createdAt: '2022-01-15T10:00:00Z',
    },
    service: {
      id: '1',
      title: 'Création de site web responsive',
      slug: 'creation-site-web-responsive',
      price: 150000,
      deliveryTime: 7,
      isActive: true,
      createdAt: '2021-06-10T10:00:00Z',
      provider: {
        id: '1',
        name: 'Samba Diallo',
        email: 'samba@example.com',
        createdAt: '2021-05-15T10:00:00Z',
      }
    },
    rating: 5,
    content: 'Excellent travail ! Samba a livré exactement ce que je voulais, et même plus. Le site est beau, rapide et parfaitement responsive. Je recommande vivement ses services.',
    title: 'Travail de qualité, à temps et professionnel',
    createdAt: '2023-02-10T15:30:00Z',
    helpfulCount: 12,
    reply: {
      content: 'Merci beaucoup Fatou pour votre confiance et votre retour positif ! Ça a été un plaisir de travailler sur votre projet.',
      createdAt: '2023-02-11T09:15:00Z'
    }
  },
  {
    id: '2',
    reviewer: {
      id: '102',
      name: 'Amadou Sow',
      email: 'amadou@example.com',
      avatar: '/images/avatars/avatar-3.jpg',
      createdAt: '2022-03-20T14:30:00Z',
    },
    service: {
      id: '2',
      title: 'Développement d\'application mobile',
      slug: 'developpement-application-mobile',
      price: 250000,
      deliveryTime: 14,
      isActive: true,
      createdAt: '2021-07-15T10:00:00Z',
      provider: {
        id: '1',
        name: 'Samba Diallo',
        email: 'samba@example.com',
        createdAt: '2021-05-15T10:00:00Z',
      }
    },
    rating: 4,
    content: 'Très bon service. L\'application fonctionne bien et répond à la plupart de mes besoins. Il y a eu quelques petits bugs au début, mais Samba les a corrigés rapidement. Je suis globalement satisfait.',
    createdAt: '2023-04-05T11:45:00Z',
    helpfulCount: 5,
    reply: {
      content: 'Merci Amadou pour votre retour ! Je suis content que l\'application vous convienne. N\'hésitez pas à me contacter si vous avez besoin de modifications ou d\'améliorations supplémentaires.',
      createdAt: '2023-04-06T08:30:00Z'
    }
  },
  {
    id: '3',
    reviewer: {
      id: '103',
      name: 'Mariama Diop',
      email: 'mariama@example.com',
      avatar: '/images/avatars/avatar-4.jpg',
      createdAt: '2021-12-10T09:20:00Z',
    },
    service: {
      id: '3',
      title: 'Optimisation SEO de votre site',
      slug: 'optimisation-seo',
      price: 100000,
      deliveryTime: 5,
      isActive: true,
      createdAt: '2021-08-20T10:00:00Z',
      provider: {
        id: '1',
        name: 'Samba Diallo',
        email: 'samba@example.com',
        createdAt: '2021-05-15T10:00:00Z',
      }
    },
    rating: 5,
    content: 'Je suis impressionnée par les résultats ! Après les optimisations SEO de Samba, mon site apparaît maintenant en première page de Google pour plusieurs mots-clés importants. Mon trafic a augmenté de 60% en seulement deux mois.',
    title: 'Résultats impressionnants',
    createdAt: '2023-05-20T16:15:00Z',
    helpfulCount: 18
  },
  {
    id: '4',
    reviewer: {
      id: '104',
      name: 'Omar Ba',
      email: 'omar@example.com',
      avatar: '/images/avatars/avatar-5.jpg',
      createdAt: '2022-02-28T13:10:00Z',
    },
    service: {
      id: '4',
      title: 'Intégration de paiement en ligne',
      slug: 'integration-paiement',
      price: 120000,
      deliveryTime: 3,
      isActive: true,
      createdAt: '2021-09-05T10:00:00Z',
      provider: {
        id: '1',
        name: 'Samba Diallo',
        email: 'samba@example.com',
        createdAt: '2021-05-15T10:00:00Z',
      }
    },
    rating: 4,
    content: 'Bon travail sur l\'intégration des paiements. Le système fonctionne bien, mais j\'aurais aimé un peu plus de documentation sur la façon de gérer certaines situations particulières. Dans l\'ensemble, je suis satisfait du service.',
    createdAt: '2023-06-12T10:40:00Z',
    helpfulCount: 3,
    reply: {
      content: 'Merci Omar pour votre retour. Je comprends votre point sur la documentation et je vais travailler dessus pour l\'améliorer. Je vous enverrai une documentation complémentaire d\'ici peu.',
      createdAt: '2023-06-13T14:20:00Z'
    }
  },
  {
    id: '5',
    reviewer: {
      id: '105',
      name: 'Aïssatou Camara',
      email: 'aissatou@example.com',
      avatar: '/images/avatars/avatar-6.jpg',
      createdAt: '2022-04-15T11:25:00Z',
    },
    service: {
      id: '1',
      title: 'Création de site web responsive',
      slug: 'creation-site-web-responsive',
      price: 150000,
      deliveryTime: 7,
      isActive: true,
      createdAt: '2021-06-10T10:00:00Z',
      provider: {
        id: '1',
        name: 'Samba Diallo',
        email: 'samba@example.com',
        createdAt: '2021-05-15T10:00:00Z',
      }
    },
    rating: 5,
    content: 'J\'ai travaillé avec plusieurs développeurs dans le passé, mais Samba est de loin le meilleur. Il a compris mes besoins dès le début et a livré un site qui dépasse mes attentes. Le processus a été fluide et professionnel.',
    title: 'Le meilleur développeur avec qui j\'ai travaillé',
    createdAt: '2023-07-05T09:55:00Z',
    helpfulCount: 9
  }
]; 