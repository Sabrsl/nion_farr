import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

const SecuriteConfidentialite: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Sécurité et Confidentialité | Centre d'aide NionFar</title>
        <meta 
          name="description" 
          content="Découvrez comment NionFar protège vos données personnelles et sécurise vos transactions. Conseils et bonnes pratiques pour protéger votre compte." 
        />
      </Head>

      <main className="bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Sécurité et Confidentialité</h1>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              Note: Cette page a été temporairement simplifiée pour résoudre un problème technique. La version complète avec toutes les informations détaillées sur notre politique de sécurité sera bientôt disponible.
            </p>
          </div>
          <p className="text-lg mb-4">
            Chez NionFar, la sécurité de vos données et la confidentialité de vos informations personnelles sont nos priorités absolues.
          </p>
          <p className="text-lg mb-8">
            Nous mettons en œuvre des mesures de sécurité de pointe, incluant:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li className="text-lg">Cryptage SSL 256 bits pour toutes les transactions</li>
            <li className="text-lg">Authentification à deux facteurs pour une protection supplémentaire</li>
            <li className="text-lg">Système d'escrow pour sécuriser vos paiements</li>
            <li className="text-lg">Conformité avec les réglementations de protection des données</li>
            <li className="text-lg">Surveillance continue pour détecter et prévenir les activités frauduleuses</li>
          </ul>
        </div>
      </main>
    </Layout>
  );
};

export default SecuriteConfidentialite;