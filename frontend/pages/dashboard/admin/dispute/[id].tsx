import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../../../components/layout/Layout';

interface DisputeDetailProps {
  id: string;
}

const DisputeDetail: NextPage<DisputeDetailProps> = ({ id }) => {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>Détail du litige | Tableau de bord Admin</title>
        <meta name="description" content="Gestion des litiges sur NionFar" />
      </Head>
      <main className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Détail du litige #{id}</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-700">
              Cette page est temporairement simplifiée. La gestion complète des litiges sera disponible prochainement.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  
  return {
    props: {
      id: id || 'unknown'
    }
  };
};

export default DisputeDetail; 