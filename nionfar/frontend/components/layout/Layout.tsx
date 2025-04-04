import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'NionFar | Services freelance au Sénégal',
  description = 'NionFar.sn - La plateforme sénégalaise qui connecte les freelances avec des clients cherchant des services de qualité à petit prix.' 
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 