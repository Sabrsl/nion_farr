import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { Order, User, Review } from '../../types';
import ReviewForm from './ReviewForm';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  currentUser: User;
  onReviewSubmitted?: (review: Review) => void;
  isClientReview?: boolean; // Si true, c'est le client qui note le vendeur; si false, c'est le vendeur qui note le client
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  currentUser,
  onReviewSubmitted,
  isClientReview = true
}) => {
  const handleReviewSubmitted = (review: Review) => {
    if (onReviewSubmitted) {
      onReviewSubmitted(review);
    }
    
    // Fermer la modal après un court délai pour que l'utilisateur puisse voir le message de succès
    setTimeout(() => {
      onClose();
    }, 2000);
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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {isClientReview ? 'Évaluer le service' : 'Évaluer le client'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <FiX className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="p-6">
                  <ReviewForm
                    order={order}
                    currentUser={currentUser}
                    onReviewSubmitted={handleReviewSubmitted}
                    isClientReview={isClientReview}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReviewModal; 