import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Hello World!
        </h1>
        <p className="text-gray-700">
          Bienvenue dans Belote Scorer - Votre application de gestion de scores de belote
        </p>
      </div>
    </div>
  );
};

export default App;
