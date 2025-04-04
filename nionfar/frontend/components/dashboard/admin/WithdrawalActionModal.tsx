import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Withdrawal } from '../../../types';
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

interface WithdrawalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: Withdrawal;
  actionType: 'validate' | 'reject';
  onValidate: (
    withdrawalId: string,
    transactionDetails: {
      reference: string;
      processedAt: string;
      notes?: string;
    }
  ) => Promise<void>;
  onReject: (withdrawalId: string, reason: string) => Promise<void>;
}

const WithdrawalActionModal: React.FC<WithdrawalActionModalProps> = ({
  isOpen,
  onClose,
  withdrawal,
  actionType,
  onValidate,
  onReject
}) => {
  const [reference, setReference] = useState('');
  const [processedAt, setProcessedAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    reference?: string;
    processedAt?: string;
    rejectionReason?: string;
  }>({});

  // Formater un montant en FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  const validateForm = () => {
    const newErrors: {
      reference?: string;
      processedAt?: string;
      rejectionReason?: string;
    } = {};
    let isValid = true;

    if (actionType === 'validate') {
      if (!reference) {
        newErrors.reference = 'La référence de transaction est requise';
        isValid = false;
      }
      if (!processedAt) {
        newErrors.processedAt = 'La date de traitement est requise';
        isValid = false;
      }
    } else if (actionType === 'reject') {
      if (!rejectionReason) {
        newErrors.rejectionReason = 'Le motif de rejet est requis';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (actionType === 'validate') {
        await onValidate(withdrawal.id, {
          reference,
          processedAt: new Date(processedAt).toISOString(),
          notes: notes || undefined
        });
      } else {
        await onReject(withdrawal.id, rejectionReason);
      }
      onClose();
    } catch (error) {
      console.error(`Erreur lors de l'${actionType === 'validate' ? 'validation' : 'rejet'} du retrait:`, error);
    } finally {
      setIsSubmitting(false);
    }
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
                    {actionType === 'validate'
                      ? 'Valider le retrait'
                      : 'Rejeter le retrait'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-500">
                    Demande de retrait de{' '}
                    <span className="font-medium text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </span>{' '}
                    par{' '}
                    <span className="font-medium text-gray-900">
                      {withdrawal.user?.name || 'l\'utilisateur'}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {actionType === 'validate' ? (
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="reference"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Référence de transaction <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="reference"
                          className={`block w-full rounded-md border ${
                            errors.reference
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                          } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-1`}
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                        />
                        {errors.reference && (
                          <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="processedAt"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Date de traitement <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="processedAt"
                          className={`block w-full rounded-md border ${
                            errors.processedAt
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                          } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-1`}
                          value={processedAt}
                          onChange={(e) => setProcessedAt(e.target.value)}
                        />
                        {errors.processedAt && (
                          <p className="mt-1 text-sm text-red-600">{errors.processedAt}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="notes"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Notes (optionnel)
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 text-sm focus:outline-none focus:ring-1"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="rounded-md bg-yellow-50 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiAlertTriangle
                              className="h-5 w-5 text-yellow-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Confirmation du rejet
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Le rejet de cette demande de retrait annulera la transaction et
                                les fonds seront recrédités sur le compte de l'utilisateur.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="rejectionReason"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Motif du rejet <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="rejectionReason"
                          rows={3}
                          className={`block w-full rounded-md border ${
                            errors.rejectionReason
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                          } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-1`}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        {errors.rejectionReason && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        actionType === 'validate'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : actionType === 'validate' ? (
                        <FiCheck className="mr-2 h-4 w-4" />
                      ) : (
                        <FiX className="mr-2 h-4 w-4" />
                      )}
                      {actionType === 'validate'
                        ? 'Valider le retrait'
                        : 'Rejeter le retrait'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WithdrawalActionModal; 