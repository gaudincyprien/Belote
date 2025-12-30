import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import type { Player } from '../../shared/types';

interface PlayerAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

interface PlayerWithGames extends Player {
  gamesCount: number;
}

const PlayerAutocompleteInput: React.FC<PlayerAutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Nom du joueur',
  className = '',
  error,
}) => {
  const [players, setPlayers] = useState<PlayerWithGames[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load players on mount
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      if (window.electron?.listPlayers) {
        const data = await window.electron.listPlayers();

        // Load games count for each player
        const playersWithGames: PlayerWithGames[] = [];
        for (const player of data) {
          if (window.electron?.countPlayerGames) {
            const gamesCount = await window.electron.countPlayerGames(player.id);
            playersWithGames.push({ ...player, gamesCount });
          }
        }

        setPlayers(playersWithGames);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort and filter players
  const filteredPlayers = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      // Sort by games count (desc) then alphabetically
      return [...players].sort((a, b) => {
        if (b.gamesCount !== a.gamesCount) {
          return b.gamesCount - a.gamesCount;
        }
        return a.nom.localeCompare(b.nom);
      });
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = players.filter(p =>
      p.nom.toLowerCase().includes(query)
    );

    // Sort filtered results
    return filtered.sort((a, b) => {
      if (b.gamesCount !== a.gamesCount) {
        return b.gamesCount - a.gamesCount;
      }
      return a.nom.localeCompare(b.nom);
    });
  }, [players, searchQuery]);

  // Check if current value is an existing player
  const isExistingPlayer = useMemo(() => {
    return players.some(p => p.nom.toLowerCase() === value.toLowerCase().trim());
  }, [players, value]);

  // Check if we should show "new player" option
  const showNewPlayerOption = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return false;
    const trimmed = searchQuery.trim();
    return trimmed.length >= 2 &&
           trimmed.length <= 30 &&
           !players.some(p => p.nom.toLowerCase() === trimmed.toLowerCase());
  }, [players, searchQuery]);

  // Handle input change with debounce
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (200ms)
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(newValue);
    }, 200);
  };

  // Handle focus
  const handleFocus = () => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  // Handle blur (with delay to allow click on suggestion)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle player selection
  const handleSelectPlayer = (playerName: string) => {
    onChange(playerName);
    setSearchQuery(playerName);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Badge indicator for existing vs new player */}
      {value.trim().length >= 2 && (
        <div className="absolute right-3 top-2.5 pointer-events-none">
          {isExistingPlayer ? (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              <span>👤</span>
              <span>Existant</span>
            </span>
          ) : value.trim().length <= 30 ? (
            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <FaPlus className="text-xs" />
              <span>Nouveau</span>
            </span>
          ) : null}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Chargement...</div>
          ) : (
            <>
              {/* Existing players */}
              {filteredPlayers.length > 0 ? (
                <div>
                  {filteredPlayers.slice(0, 10).map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => handleSelectPlayer(player.nom)}
                      className="w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">👤</span>
                        <span className="text-gray-900">{player.nom}</span>
                      </div>
                      {player.gamesCount > 0 && (
                        <span className="text-xs text-gray-500 group-hover:text-gray-700">
                          {player.gamesCount} partie{player.gamesCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Aucun joueur trouvé
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Tapez au moins 2 caractères pour rechercher
                </div>
              )}

              {/* New player option */}
              {showNewPlayerOption && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlayer(searchQuery.trim())}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2"
                  >
                    <FaPlus className="text-green-600 text-sm" />
                    <span className="text-gray-900">
                      Créer "{searchQuery.trim()}"
                    </span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Nouveau
                    </span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerAutocompleteInput;
