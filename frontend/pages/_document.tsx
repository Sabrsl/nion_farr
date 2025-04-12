import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Script d'initialisation précoce - doit être chargé en premier */}
        <script src="/initial-fix.js" />
        
        {/* Préconnexions pour améliorer les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://nion-farr-backend.vercel.app" crossOrigin="anonymous" />
        
        {/* Polices */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Script pour corriger les APIs URLs en cas de problème */}
        <script src="/fix-api-urls.js" />
        
        {/* Script plus agressif pour forcer la correction */}
        <script src="/fix-railway.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
