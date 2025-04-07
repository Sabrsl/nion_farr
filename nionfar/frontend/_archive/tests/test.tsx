import { NextPage } from 'next';
import Head from 'next/head';

const TestPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Page de test</title>
      </Head>
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Page de test</h1>
        <p>Cette page est un test pour vérifier si Next.js fonctionne correctement.</p>
      </main>
    </div>
  );
};

export default TestPage; 