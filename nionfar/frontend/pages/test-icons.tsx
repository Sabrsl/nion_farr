import { NextPage } from 'next';
import { FiUser, FiMail, FiLock } from 'react-icons/fi/index.js';

const TestIcons: NextPage = () => {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Testing React Icons</h1>
      <div className="flex space-x-4">
        <div className="flex items-center">
          <FiUser className="w-6 h-6 mr-2" />
          <span>User Icon</span>
        </div>
        <div className="flex items-center">
          <FiMail className="w-6 h-6 mr-2" />
          <span>Mail Icon</span>
        </div>
        <div className="flex items-center">
          <FiLock className="w-6 h-6 mr-2" />
          <span>Lock Icon</span>
        </div>
      </div>
    </div>
  );
};

export default TestIcons; 