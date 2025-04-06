import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/layout/Layout';
import { CommanderButton } from '../components/services/buttons';

const CommanderButtonTest: NextPage = () => {
  return (
    <Layout title="Test du bouton Commander">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Test du composant CommanderButton</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cas 1: Service disponible, utilisateur non connecté */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Cas 1: Utilisateur non connecté</h2>
            <p className="mb-4 text-gray-600">
              Dans ce cas, le bouton devrait afficher "Se connecter pour commander" et 
              rediriger vers la page de connexion.
            </p>
            
            <CommanderButton 
              serviceId="service123" 
              sellerId="seller456"
            />
          </div>
          
          {/* Cas 2: Service disponible, utilisateur connecté mais c'est le vendeur */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Cas 2: Utilisateur est le vendeur</h2>
            <p className="mb-4 text-gray-600">
              Dans ce cas, l'utilisateur est connecté mais c'est son propre service.
              Le bouton devrait être désactivé et afficher le message "Vous ne pouvez pas commander votre propre service".
            </p>
            
            {/* 
              Note: Normalement ceci serait détecté automatiquement par le composant
              en comparant user.id à sellerId. Pour les besoins du test, on simule le comportement
              en supposant que l'utilisateur connecté a l'ID 'seller456'
            */}
            <CommanderButton 
              serviceId="service123" 
              sellerId="seller456"
            />
          </div>
          
          {/* Cas 3: Service disponible, utilisateur connecté et peut commander */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Cas 3: Utilisateur peut commander</h2>
            <p className="mb-4 text-gray-600">
              Dans ce cas, l'utilisateur est connecté et peut commander.
              Le bouton devrait être actif et afficher "Commander ce service".
            </p>
            
            <CommanderButton 
              serviceId="service123" 
              sellerId="seller789"
            />
          </div>
          
          {/* Cas 4: Bouton avec style différent */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Cas 4: Variante de style</h2>
            <p className="mb-4 text-gray-600">
              Le bouton peut être personnalisé avec différentes classes et variantes.
            </p>
            
            <CommanderButton 
              serviceId="service123" 
              sellerId="seller789"
              variant="secondary"
              className="text-sm font-bold rounded-full"
              size="sm"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommanderButtonTest; 