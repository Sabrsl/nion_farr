import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/layouts/AdminLayout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiSearch, 
  FiEdit2, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiChevronLeft, 
  FiChevronRight, 
  FiFilter, 
  FiMessageSquare,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi/index.js';
import { classNames } from '../../utils/helpers';

/**
 * Page d'administration de validation des services soumis par les freelancers
 */
const AdminServicesValidationPage: NextPage = () => {
  const router = useRouter();

  // Redirection vers la nouvelle page de validation
  useEffect(() => {
    router.replace('/admin/service-validation');
  }, [router]);
  
  // Afficher un message de chargement pendant la redirection
  return (
    <AdminLayout>
      <Head>
        <title>Redirection | Admin NionFar</title>
      </Head>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold">Redirection vers la nouvelle page de validation...</h1>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServicesValidationPage; 