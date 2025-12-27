import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-900 mb-4">
          Hello World
        </h1>
        <p className="text-2xl text-indigo-700">
          Belote Scorer - Application Electron
        </p>
        <div className="mt-8 text-gray-600">
          <p>React + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default App;
