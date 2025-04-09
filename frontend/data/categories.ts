import { Category } from '../types';
import { 
  FiBriefcase, 
  FiMonitor, 
  FiEdit, 
  FiVideo, 
  FiGlobe, 
  FiTrendingUp,
  FiBookOpen,
  FiCamera,
  FiMic,
  FiMusic,
  FiDatabase,
  FiPieChart
} from 'react-icons/fi/index.js';

export const categories: Category[] = [
  {
    id: "c1",
    name: "Design Graphique",
    description: "Logos, illustrations, bannières et conception visuelle",
    icon: "🎨",
    slug: "design-graphique",
    count: 0
  },
  {
    id: "c2",
    name: "Développement Web",
    description: "Sites web, applications et services en ligne",
    icon: "💻",
    slug: "developpement-web",
    count: 0
  },
  {
    id: "c3",
    name: "Rédaction",
    description: "Articles, blogs et contenus SEO",
    icon: "✍️",
    slug: "redaction",
    count: 0
  },
  {
    id: "c4",
    name: "Vidéo & Animation",
    description: "Montage vidéo, animation et motion design",
    icon: "🎬",
    slug: "video-animation",
    count: 0
  },
  {
    id: "c5",
    name: "Traduction",
    description: "Traduction de documents et sites web",
    icon: "🌐",
    slug: "traduction",
    count: 0
  },
  {
    id: "c6",
    name: "Marketing Digital",
    description: "Stratégies marketing, SEO et réseaux sociaux",
    icon: "📈",
    slug: "marketing-digital",
    count: 0
  },
  {
    id: "c7",
    name: "Formation",
    description: "Cours en ligne, tutoriels et mentorat",
    icon: "📚",
    slug: "formation",
    count: 0
  },
  {
    id: "c8",
    name: "Photographie",
    description: "Retouche photo et édition d'images",
    icon: "📷",
    slug: "photographie",
    count: 0
  },
  {
    id: "c9",
    name: "Audio & Musique",
    description: "Voix off, mixage audio et production musicale",
    icon: "🎵",
    slug: "audio-musique",
    count: 0
  },
  {
    id: "c10",
    name: "Développement Mobile",
    description: "Applications iOS, Android et cross-platform",
    icon: "📱",
    slug: "developpement-mobile",
    count: 0
  },
  {
    id: "c11",
    name: "Business",
    description: "Consulting, plans d'affaires et stratégie",
    icon: "💼",
    slug: "business",
    count: 0
  },
  {
    id: "c12",
    name: "Data & IA",
    description: "Analyse de données, IA et machine learning",
    icon: "🤖",
    slug: "data-ia",
    count: 0
  }
]; 