import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6">
            Paramètres
          </h1>

          <p className="text-gray-600 mb-8">
            Configuration des paramètres à venir (DEV-012)...
          </p>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <FaArrowLeft />
            <span>Retour</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
