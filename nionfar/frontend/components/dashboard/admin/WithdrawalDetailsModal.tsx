import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Withdrawal } from '../../../types';
import { FiX, FiUser, FiDollarSign, FiCalendar, FiCreditCard } from 'react-icons/fi';

interface WithdrawalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: Withdrawal;
}

const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({
  isOpen,
  onClose,
  withdrawal
}) => {
  // Formater un montant en FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Détails du retrait
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiDollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-500">Montant</h4>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-500">Demandeur</h4>
                    </div>
                    <div className="pl-7">
                      <p className="text-sm text-gray-900 mb-1">
                        {withdrawal.user?.name || 'Nom non disponible'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {withdrawal.userId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-500">
                        Méthode de paiement
                      </h4>
                    </div>
                    <div className="pl-7">
                      <p className="text-sm text-gray-900 mb-1">
                        {withdrawal.method === 'mobile_money'
                          ? 'Mobile Money'
                          : 'Virement bancaire'}
                      </p>
                      {withdrawal.accountDetails && (
                        <>
                          <p className="text-sm text-gray-500 mb-1">
                            Type: {withdrawal.accountDetails.type}
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            Numéro: {withdrawal.accountDetails.number}
                          </p>
                          <p className="text-sm text-gray-500">
                            Nom: {withdrawal.accountDetails.name}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-500">Dates</h4>
                    </div>
                    <div className="pl-7">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Demande:</span>
                        <span className="text-gray-900">{formatDate(withdrawal.createdAt)}</span>
                      </div>
                      {withdrawal.processedAt && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Traitement:</span>
                          <span className="text-gray-900">{formatDate(withdrawal.processedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {withdrawal.status === 'rejeté' && withdrawal.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h4 className="text-sm font-medium text-red-800 mb-1">
                        Motif du rejet
                      </h4>
                      <p className="text-sm text-red-700">{withdrawal.rejectionReason}</p>
                    </div>
                  )}

                  {withdrawal.status === 'validé' && withdrawal.transactionDetails && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="text-sm font-medium text-green-800 mb-1">
                        Détails de la transaction
                      </h4>
                      <p className="text-sm text-green-700 mb-1">
                        Référence: {withdrawal.transactionDetails.reference}
                      </p>
                      <p className="text-sm text-green-700">
                        Date: {formatDate(withdrawal.transactionDetails.processedAt)}
                      </p>
                      {withdrawal.transactionDetails.notes && (
                        <p className="text-sm text-green-700 mt-2">
                          Notes: {withdrawal.transactionDetails.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WithdrawalDetailsModal; 