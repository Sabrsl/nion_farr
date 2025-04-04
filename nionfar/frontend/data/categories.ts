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
} from 'react-icons/fi';

export const categories: Category[] = [
  {
    id: "c1",
    name: "Design Graphique",
    description: "Logos, illustrations, bannières et tout type de conception visuelle",
    icon: "🎨",
    slug: "design-graphique",
    count: 324
  },
  {
    id: "c2",
    name: "Développement Web",
    description: "Sites web, applications, API et services en ligne",
    icon: "💻",
    slug: "developpement-web",
    count: 286
  },
  {
    id: "c3",
    name: "Rédaction",
    description: "Articles, blogs, copywriting et contenus SEO",
    icon: "✍️",
    slug: "redaction",
    count: 198
  },
  {
    id: "c4",
    name: "Vidéo & Animation",
    description: "Montage vidéo, animation, motion design et effets spéciaux",
    icon: "🎬",
    slug: "video-animation",
    count: 176
  },
  {
    id: "c5",
    name: "Traduction",
    description: "Traduction de documents, sites web et applications en plusieurs langues",
    icon: "🌐",
    slug: "traduction",
    count: 143
  },
  {
    id: "c6",
    name: "Marketing Digital",
    description: "Stratégies marketing, SEO, réseaux sociaux et publicité en ligne",
    icon: "📈",
    slug: "marketing-digital",
    count: 167
  },
  {
    id: "c7",
    name: "Formation",
    description: "Cours en ligne, tutoriels, coaching et mentorat",
    icon: "📚",
    slug: "formation",
    count: 92
  },
  {
    id: "c8",
    name: "Photographie",
    description: "Retouche photo, shooting, photomontage et édition d'images",
    icon: "📷",
    slug: "photographie",
    count: 115
  },
  {
    id: "c9",
    name: "Audio & Musique",
    description: "Voix off, mixage audio, production musicale et sound design",
    icon: "🎵",
    slug: "audio-musique",
    count: 87
  },
  {
    id: "c10",
    name: "Développement Mobile",
    description: "Applications iOS, Android et cross-platform",
    icon: "📱",
    slug: "developpement-mobile",
    count: 128
  },
  {
    id: "c11",
    name: "Business",
    description: "Consulting, plans d'affaires, études de marché et stratégie",
    icon: "💼",
    slug: "business",
    count: 76
  },
  {
    id: "c12",
    name: "Data & IA",
    description: "Analyse de données, visualisation, intelligence artificielle et machine learning",
    icon: "🤖",
    slug: "data-ia",
    count: 64
  }
]; 