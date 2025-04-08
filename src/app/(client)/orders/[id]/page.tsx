import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface Order {
  id: string;
  status: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  client: {
    id: string;
    name: string;
  };
  freelancer?: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    title: string;
  };
  deliveryMessage?: string;
  deliveryFiles?: string[];
  revisionMessage?: string;
  revisionRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'REVISION_REQUESTED':
      return 'bg-orange-100 text-orange-800';
    case 'DELIVERED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'COMPLETED':
      return 'Terminée';
    case 'CANCELLED':
      return 'Annulée';
    case 'REVISION_REQUESTED':
      return 'Révision demandée';
    case 'DELIVERED':
      return 'Livrée';
    default:
      return status;
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError('Erreur lors du chargement de la commande');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error || 'Commande non trouvée'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
              <p className="text-gray-600 mt-2">{order.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Détails de la commande</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.budget} €</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date limite</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.deadline).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.client.name}</dd>
                </div>
                {order.freelancer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Freelancer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.freelancer.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {order.status === 'DELIVERED' && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Livraison</h3>
            <p className="text-gray-600 mb-4">{order.deliveryMessage}</p>
            {order.deliveryFiles && order.deliveryFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Fichiers livrés:</h4>
                <ul className="list-disc list-inside">
                  {order.deliveryFiles.map((file, index) => (
                    <li key={index} className="text-blue-600 hover:underline">
                      <a href={file} target="_blank" rel="noopener noreferrer">
                        Fichier {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {order.status === 'REVISION_REQUESTED' && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Demande de révision</h3>
            <p className="text-gray-600 mb-4">{order.revisionMessage}</p>
            <p className="text-sm text-gray-500">
              Demandée le: {new Date(order.revisionRequestedAt!).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 