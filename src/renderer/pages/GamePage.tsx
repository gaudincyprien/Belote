import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6">
            Partie #{gameId}
          </h1>

          <p className="text-gray-600 mb-8">
            Écran de jeu à venir (DEV-004)...
          </p>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <FaArrowLeft />
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
