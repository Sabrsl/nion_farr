import React, { ReactNode, ErrorInfo, Component } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Composant boundary pour récupérer les erreurs de rendu
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔥 Erreur dans le rendu de la page:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-5">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Oups! Quelque chose s'est mal passé</h1>
          <p className="text-gray-700 mb-6">Nous avons rencontré un problème lors du chargement de cette page.</p>
          <div className="mb-6">
            <a href="/" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Retour à l'accueil
            </a>
          </div>
          <p className="text-sm text-gray-500 mb-2">Détails techniques (si disponibles):</p>
          <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 max-w-full overflow-auto">
            {this.state.error?.message || 'Aucun détail disponible'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'NionFar - Services freelance au Sénégal', 
  description = 'NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix.' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <ErrorBoundary>
          <main className="flex-grow pt-16">{children}</main>
        </ErrorBoundary>
        <Footer />
      </div>
    </>
  );
};

export default Layout; 