import React from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { Container } from './ui/common';
import 'react-toastify/dist/ReactToastify.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Nionfar | Le marché virtuel des freelances africains francophones',
  description = 'Nionfar est une plateforme qui connecte les entreprises avec les freelances africains francophones les plus talentueux.',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Container>
            {children}
          </Container>
        </main>

        <Footer />
      </div>
      
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default Layout; 