import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle global keyboard shortcuts from main process
 */
export function useGlobalShortcuts(onHelp?: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for shortcut events from main process
    const handleNewGame = () => navigate('/new-game');
    const handleHistory = () => navigate('/history');
    const handleStats = () => navigate('/stats');
    const handleSettings = () => navigate('/settings');
    const handleQuit = () => {
      if (window.electron?.quit) {
        window.electron.quit();
      }
    };
    const handleHelp = () => {
      if (onHelp) {
        onHelp();
      }
    };

    // Add event listeners
    if (window.electron) {
      window.addEventListener('shortcut:new-game', handleNewGame as EventListener);
      window.addEventListener('shortcut:history', handleHistory as EventListener);
      window.addEventListener('shortcut:stats', handleStats as EventListener);
      window.addEventListener('shortcut:settings', handleSettings as EventListener);
      window.addEventListener('shortcut:quit', handleQuit as EventListener);
      window.addEventListener('shortcut:help', handleHelp as EventListener);
    }

    // Cleanup
    return () => {
      if (window.electron) {
        window.removeEventListener('shortcut:new-game', handleNewGame as EventListener);
        window.removeEventListener('shortcut:history', handleHistory as EventListener);
        window.removeEventListener('shortcut:stats', handleStats as EventListener);
        window.removeEventListener('shortcut:settings', handleSettings as EventListener);
        window.removeEventListener('shortcut:quit', handleQuit as EventListener);
        window.removeEventListener('shortcut:help', handleHelp as EventListener);
      }
    };
  }, [navigate, onHelp]);
}
