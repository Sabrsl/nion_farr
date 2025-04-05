import { Service } from '../types';

export const mockServices: Service[] = [
  {
    id: "1",
    title: "Création de logo professionnel et identité visuelle complète",
    description: "Je créerai un logo unique et mémorable pour votre entreprise avec une identité visuelle complète. Livraison rapide et révisions illimitées.",
    price: 25000,
    rating: 4.9,
    totalReviews: 127,
    deliveryTime: 3,
    images: [
      "/img/services/logo-design.jpg",
      "/img/services/logo-design.jpg"
    ],
    provider: {
      id: "u1",
      name: "AminaDesigns",
      avatar: "/img/avatars/amadou.jpg",
      level: "Top Rated"
    },
    category: {
      id: "c1",
      name: "Design Graphique"
    },
    slug: "creation-logo-professionnel",
    createdAt: "2023-06-15T00:00:00.000Z",
    tags: ["logo", "branding", "identité visuelle"],
    orderCount: 278,
    isActive: true
  },
  {
    id: "2",
    title: "Développement de site web responsive avec WordPress",
    description: "Je créerai un site web professionnel et responsive avec WordPress, optimisé pour le référencement et les mobiles.",
    price: 150000,
    rating: 4.8,
    totalReviews: 98,
    deliveryTime: 7,
    images: [
      "/img/services/content-writing.jpg",
      "/img/services/content-writing.jpg"
    ],
    provider: {
      id: "u2",
      name: "OusmaneDev",
      avatar: "/img/avatars/ibrahim.jpg",
      level: "Niveau 2"
    },
    category: {
      id: "c2",
      name: "Développement Web"
    },
    slug: "developpement-site-wordpress",
    createdAt: "2023-07-22T00:00:00.000Z",
    tags: ["wordpress", "site web", "responsive"],
    orderCount: 187,
    isActive: true
  },
  {
    id: "3",
    title: "Rédaction d'articles SEO optimisés pour votre blog",
    description: "Je rédigerai des articles de qualité, optimisés pour le SEO, qui augmenteront votre trafic organique et votre visibilité en ligne.",
    price: 15000,
    rating: 4.7,
    totalReviews: 56,
    deliveryTime: 2,
    images: [
      "/img/services/content-writing.jpg"
    ],
    provider: {
      id: "u3",
      name: "FatouWriter",
      avatar: "/img/avatars/fatou.jpg",
      level: "Niveau 1"
    },
    category: {
      id: "c3",
      name: "Rédaction"
    },
    slug: "redaction-articles-seo",
    createdAt: "2023-09-10T00:00:00.000Z",
    tags: ["rédaction", "SEO", "blog"],
    orderCount: 112,
    isActive: true
  },
  {
    id: "4",
    title: "Montage vidéo professionnel pour YouTube et réseaux sociaux",
    description: "Je réaliserai un montage vidéo professionnel pour vos contenus YouTube ou réseaux sociaux, avec effets, transitions, et sous-titres.",
    price: 35000,
    rating: 4.9,
    totalReviews: 73,
    deliveryTime: 4,
    images: [
      "/img/services/video-editing.jpg"
    ],
    provider: {
      id: "u4",
      username: "SidyMedia",
      name: "SidyMedia",
      avatar: "/img/avatars/amadou.jpg", 
      level: "Top Rated"
    },
    category: {
      id: "c4",
      name: "Vidéo & Animation"
    },
    slug: "montage-video-professionnel",
    createdAt: "2023-05-15T00:00:00.000Z",
    tags: ["montage vidéo", "youtube", "réseaux sociaux"],
    orderCount: 221,
    isActive: true
  },
  {
    id: "5",
    title: "Traduction français-wolof ou wolof-français",
    description: "Je traduirai vos textes, documents ou sous-titres entre le français et le wolof avec précision et respect du contexte culturel.",
    price: 10000,
    rating: 4.6,
    totalReviews: 42,
    deliveryTime: 2,
    images: [
      "/img/services/translation.jpg"
    ],
    provider: {
      id: "u5",
      username: "AissaTrad",
      name: "AissaTrad",
      avatar: "/img/avatars/fatou.jpg",
      level: "Niveau 2"
    },
    category: {
      id: "c5",
      name: "Traduction"
    },
    slug: "traduction-francais-wolof",
    createdAt: "2023-08-20T00:00:00.000Z",
    tags: ["traduction", "wolof", "français"],
    orderCount: 95,
    isActive: true
  },
  {
    id: "6",
    title: "Consultation en stratégie de marketing digital",
    description: "Je vous aiderai à développer une stratégie de marketing digital efficace pour atteindre vos objectifs commerciaux et augmenter votre visibilité en ligne.",
    price: 75000,
    rating: 4.8,
    totalReviews: 31,
    deliveryTime: 5,
    images: [
      "/img/services/marketing.jpg"
    ],
    provider: {
      id: "u6",
      username: "MariamDigital",
      name: "MariamDigital",
      avatar: "/img/avatars/mariam.jpg",
      level: "Top Rated"
    },
    category: {
      id: "c6",
      name: "Marketing Digital"
    },
    slug: "consultation-marketing-digital",
    createdAt: "2023-03-10T00:00:00.000Z",
    tags: ["marketing", "stratégie", "digital"],
    orderCount: 142,
    isActive: true
  },
  {
    id: "7",
    title: "Création d'illustrations personnalisées pour votre marque",
    description: "Je créerai des illustrations uniques et personnalisées pour votre marque, packaging, site web ou réseaux sociaux.",
    price: 45000,
    rating: 4.9,
    totalReviews: 64,
    deliveryTime: 6,
    images: [
      "/img/services/illustration.jpg",
      "/img/services/illustration.jpg"
    ],
    provider: {
      id: "u7",
      username: "DiamArt",
      name: "DiamArt",
      avatar: "/img/avatars/diamart.jpg",
      level: "Niveau 2"
    },
    category: {
      id: "c1",
      name: "Design Graphique"
    },
    slug: "illustrations-personnalisees",
    createdAt: "2023-07-05T00:00:00.000Z",
    tags: ["illustration", "design", "personnalisé"],
    orderCount: 167,
    isActive: true
  },
  {
    id: "8",
    title: "Développement d'applications mobiles iOS et Android",
    description: "Je développerai une application mobile native pour iOS et Android selon vos besoins, avec un design moderne et une expérience utilisateur optimale.",
    price: 550000,
    rating: 4.7,
    totalReviews: 27,
    deliveryTime: 30,
    images: [
      "/img/services/mobile-development.jpg"
    ],
    provider: {
      id: "u8",
      username: "KhadimTech",
      name: "KhadimTech",
      avatar: "/img/avatars/khadim.jpg",
      level: "Top Rated"
    },
    category: {
      id: "c2",
      name: "Développement Web"
    },
    slug: "developpement-applications-mobiles",
    createdAt: "2023-02-18T00:00:00.000Z",
    tags: ["mobile", "iOS", "Android", "développement"],
    orderCount: 78,
    isActive: true
  },
  {
    id: "9",
    title: "Gestion de vos réseaux sociaux pendant un mois",
    description: "Je gérerai vos comptes de réseaux sociaux pendant un mois, avec création de contenu, planification, engagement et analyse des performances.",
    price: 120000,
    rating: 4.8,
    totalReviews: 53,
    deliveryTime: 30,
    images: [
      "/img/services/social-media-management.jpg"
    ],
    provider: {
      id: "u9",
      username: "SocialSokhna",
      name: "SocialSokhna",
      avatar: "/img/avatars/socialsokhna.jpg",
      level: "Niveau 2"
    },
    category: {
      id: "c6",
      name: "Marketing Digital"
    },
    slug: "gestion-reseaux-sociaux",
    createdAt: "2023-08-01T00:00:00.000Z",
    tags: ["réseaux sociaux", "community management", "marketing"],
    orderCount: 131,
    isActive: true
  },
  {
    id: "10",
    title: "Transcription audio et vidéo en texte",
    description: "Je transcrirai vos fichiers audio ou vidéo en texte avec précision, en français, wolof ou anglais.",
    price: 8000,
    rating: 4.6,
    totalReviews: 37,
    deliveryTime: 2,
    images: [
      "/img/services/transcription.jpg"
    ],
    provider: {
      id: "u10",
      username: "MbackeServices",
      name: "MbackeServices",
      avatar: "/img/avatars/mbacke.jpg",
      level: "Niveau 1"
    },
    category: {
      id: "c3",
      name: "Rédaction"
    },
    slug: "transcription-audio-video",
    createdAt: "2023-09-25T00:00:00.000Z",
    tags: ["transcription", "audio", "vidéo"],
    orderCount: 84,
    isActive: true
  },
  {
    id: "11",
    title: "Retouche photo professionnelle",
    description: "Je retoucherai vos photos avec précision pour un résultat professionnel : correction des couleurs, retouche beauté, suppression d'éléments indésirables.",
    price: 12000,
    rating: 4.9,
    totalReviews: 89,
    deliveryTime: 1,
    images: [
      "/img/services/photo-retouching.jpg"
    ],
    provider: {
      id: "u11",
      username: "PhotoMagicSN",
      name: "PhotoMagicSN",
      avatar: "/img/avatars/photomagic.jpg",
      level: "Top Rated"
    },
    category: {
      id: "c1",
      name: "Design Graphique"
    },
    slug: "retouche-photo-professionnelle",
    createdAt: "2023-06-30T00:00:00.000Z",
    tags: ["photo", "retouche", "photoshop"],
    orderCount: 213,
    isActive: true
  },
  {
    id: "12",
    title: "Création de contenu e-learning interactif",
    description: "Je créerai du contenu e-learning interactif et engageant pour vos formations en ligne, avec quiz, vidéos et exercices pratiques.",
    price: 200000,
    rating: 4.7,
    totalReviews: 19,
    deliveryTime: 14,
    images: [
      "/img/services/e-learning.jpg"
    ],
    provider: {
      id: "u12",
      username: "EduTechSenegal",
      name: "EduTechSenegal",
      avatar: "/img/avatars/edutech.jpg",
      level: "Niveau 2"
    },
    category: {
      id: "c7",
      name: "Formation"
    },
    slug: "contenu-elearning-interactif",
    createdAt: "2023-05-12T00:00:00.000Z",
    tags: ["e-learning", "formation", "interactif", "éducation"],
    orderCount: 61,
    isActive: true
  }
]; 