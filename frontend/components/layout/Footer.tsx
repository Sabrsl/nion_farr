import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <span className="text-2xl font-bold text-white">
                NionFar<span className="text-indigo-400">.sn</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              La plateforme qui connecte les freelances sénégalais avec des clients cherchant des services de qualité.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/nionfar" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/nionfar" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/nionfar" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Liens rapides</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/explorer" className="text-gray-400 hover:text-white transition-colors">
                  Explorer les services
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="text-gray-400 hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/devenir-freelance" className="text-gray-400 hover:text-white transition-colors">
                  Devenir freelance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Catégories populaires</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/categories/design-graphique" className="text-gray-400 hover:text-white transition-colors">
                  Design graphique
                </Link>
              </li>
              <li>
                <Link href="/categories/developpement-web" className="text-gray-400 hover:text-white transition-colors">
                  Développement web
                </Link>
              </li>
              <li>
                <Link href="/categories/redaction" className="text-gray-400 hover:text-white transition-colors">
                  Rédaction & traduction
                </Link>
              </li>
              <li>
                <Link href="/categories/marketing-digital" className="text-gray-400 hover:text-white transition-colors">
                  Marketing digital
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Informations légales</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/conditions-utilisation" className="text-gray-400 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-gray-400 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} NionFar.sn. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">
                Fait avec ❤️ à Dakar, Sénégal
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 