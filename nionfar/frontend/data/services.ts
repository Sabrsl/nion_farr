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
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554185256-1f1c90e6aa09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u1",
      username: "AminaDesigns",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u2",
      username: "OusmaneDev",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u3",
      username: "FatouWriter",
      avatar: "https://images.unsplash.com/photo-1628890923662-2cb23c2e0cfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u4",
      username: "SidyMedia",
      avatar: "https://images.unsplash.com/photo-1597346908500-28872a56a1f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80", 
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
      "https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u5",
      username: "AissaTrad",
      avatar: "https://images.unsplash.com/photo-1640952131659-49a06dd90ad2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u6",
      username: "MariamDigital",
      avatar: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581349437898-cebbe9831942?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u7",
      username: "DiamArt",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u8",
      username: "KhadimTech",
      avatar: "https://images.unsplash.com/photo-1542178243-bc20204b769f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u9",
      username: "SocialSokhna",
      avatar: "https://images.unsplash.com/photo-1544724015-eabd0b1c21a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1516981842399-23f4763b4c6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u10",
      username: "MbackeServices",
      avatar: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u11",
      username: "PhotoMagicSN",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    provider: {
      id: "u12",
      username: "EduTechSenegal",
      avatar: "https://images.unsplash.com/photo-1578489758854-f134a358f08b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
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