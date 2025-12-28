import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaHistory,
  FaChartBar,
  FaCog,
  FaTimes
} from 'react-icons/fa';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/new-game');
  };

  const handleQuit = () => {
    if (window.electron) {
      window.electron.quit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-600 mb-2">
            🎴 Belote Scorer
          </h1>
          <p className="text-gray-600 text-lg">
            Gérez vos parties de belote
          </p>
        </div>

        {/* Menu principal */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
          {/* Bouton Nouvelle partie */}
          <button
            onClick={handleNewGame}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <FaPlus className="text-xl" />
            <span className="text-lg">Nouvelle partie</span>
          </button>

          {/* Bouton Historique (désactivé) */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 bg-gray-300 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed opacity-60"
          >
            <FaHistory className="text-xl" />
            <span className="text-lg">Historique des parties</span>
          </button>

          {/* Bouton Statistiques (désactivé) */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 bg-gray-300 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed opacity-60"
          >
            <FaChartBar className="text-xl" />
            <span className="text-lg">Statistiques</span>
          </button>

          {/* Bouton Paramètres */}
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-center gap-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md"
          >
            <FaCog className="text-xl" />
            <span className="text-lg">Paramètres</span>
          </button>

          {/* Bouton Quitter */}
          <button
            onClick={handleQuit}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <FaTimes className="text-xl" />
            <span className="text-lg">Quitter</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default HomePage;
