import React from 'react';
import Head from 'next/head';
import CardExamples from '../../components/examples/CardExample';

const CardsExamplePage = () => {
  return (
    <>
      <Head>
        <title>Exemples de composants Card - Nionfar</title>
        <meta 
          name="description" 
          content="Page d'exemples montrant les différentes variantes et utilisations des composants Card" 
        />
      </Head>
      
      <main className="container mx-auto py-8">
        <CardExamples />
      </main>
    </>
  );
};

export default CardsExamplePage; 