import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiDollarSign } from 'react-icons/fi/index.js';
import FreelanceDashboardLayout from '../../../components/dashboard/FreelanceDashboardLayout';
import Link from 'next/link';

const FreelanceDashboard: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' FCFA';
  };

  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <FreelanceDashboardLayout title="Tableau de bord Freelance">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32"></div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 h-64"></div>
        </div>
      </FreelanceDashboardLayout>
    );
  }

  return (
    <FreelanceDashboardLayout title="Tableau de bord Freelance">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord Freelance</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <FiDollarSign className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenus totaux</p>
                <p className="text-xl font-semibold">{formatCurrency(750000)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FiDollarSign className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="text-xl font-semibold">{formatCurrency(25000)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <FiDollarSign className="text-yellow-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-xl font-semibold">{formatCurrency(125000)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FiShoppingBag className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes actives</p>
                <p className="text-xl font-semibold">7</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Commandes récentes</h2>
          <div className="text-center py-6">
            <Link href="/dashboard/freelance/orders">
              <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                Voir toutes les commandes
              </span>
            </Link>
          </div>
        </div>
      </div>
    </FreelanceDashboardLayout>
  );
};

export default FreelanceDashboard; 