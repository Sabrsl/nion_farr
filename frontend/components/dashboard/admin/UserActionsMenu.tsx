import React, { useState } from 'react';
import { FiMoreVertical, FiKey, FiShield } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';

interface UserActionsMenuProps {
  userId: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  onResetPassword: (userId: string, userName: string, userEmail: string) => void;
  onManageRestrictions: (userId: string, userName: string, userStatus: string) => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  userId,
  userName,
  userEmail,
  userStatus,
  onResetPassword,
  onManageRestrictions
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button 
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiMoreVertical className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={handleClickOutside}
          ></div>
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                role="menuitem"
                onClick={() => {
                  onResetPassword(userId, userName, userEmail);
                  setIsOpen(false);
                }}
              >
                <FiKey className="mr-3 h-4 w-4 text-gray-500" />
                Réinitialiser le mot de passe
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                role="menuitem"
                onClick={() => {
                  onManageRestrictions(userId, userName, userStatus);
                  setIsOpen(false);
                }}
              >
                <FiShield className="mr-3 h-4 w-4 text-indigo-500" />
                Gérer les restrictions
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserActionsMenu; 