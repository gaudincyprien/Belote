import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewGamePage from './pages/NewGamePage';
import GamePage from './pages/GamePage';
import GameResultsPage from './pages/GameResultsPage';
import SettingsPage from './pages/SettingsPage';
import PlayersPage from './pages/PlayersPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import PlayerStatsPage from './pages/PlayerStatsPage';
import HelpModal from './components/HelpModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { useTheme } from './hooks/useTheme';

const AppContent: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  // Handle global keyboard shortcuts (must be inside Router context)
  useGlobalShortcuts(() => setShowHelp(true));

  // Handle theme
  useTheme();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-game" element={<NewGamePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/:gameId/results" element={<GameResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/player/:playerId/stats" element={<PlayerStatsPage />} />
      </Routes>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
