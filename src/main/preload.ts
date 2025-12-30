// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { CreateGameParams, CreateRoundParams, FinalizeGameParams, GameFilters } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  quit: () => ipcRenderer.invoke('app:quit'),
  createGame: (params: CreateGameParams) => ipcRenderer.invoke('game:create', params),
  getGame: (gameId: number) => ipcRenderer.invoke('game:get', gameId),
  createRound: (params: CreateRoundParams) => ipcRenderer.invoke('game:createRound', params),
  deleteLastRound: (gameId: number) => ipcRenderer.invoke('game:deleteLastRound', gameId),
  finalizeGame: (params: FinalizeGameParams) => ipcRenderer.invoke('game:finalize', params),

  // Player management
  listPlayers: () => ipcRenderer.invoke('player:list'),
  createPlayer: (nom: string) => ipcRenderer.invoke('player:create', nom),
  updatePlayer: (id: number, nom: string) => ipcRenderer.invoke('player:update', id, nom),
  deletePlayer: (id: number) => ipcRenderer.invoke('player:delete', id),
  countPlayerGames: (playerId: number) => ipcRenderer.invoke('player:countGames', playerId),

  // History management
  listGames: (filters?: GameFilters) => ipcRenderer.invoke('history:listGames', filters),
  countGameRounds: (gameId: number) => ipcRenderer.invoke('history:countRounds', gameId),
  deleteGame: (gameId: number) => ipcRenderer.invoke('history:deleteGame', gameId),

  // Statistics
  getGlobalStatistics: () => ipcRenderer.invoke('statistics:getGlobal'),
  getPlayerRankings: () => ipcRenderer.invoke('statistics:getPlayerRankings'),
  getTrumpStatistics: () => ipcRenderer.invoke('statistics:getTrumpStats'),
  getGlobalRecords: () => ipcRenderer.invoke('statistics:getRecords'),
  getPlayerStatistics: (playerId: number) => ipcRenderer.invoke('statistics:getPlayerStats', playerId),

  // Settings
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  updateSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:update', settings),
  resetSetting: (key: string) => ipcRenderer.invoke('settings:reset', key),
  resetAllSettings: () => ipcRenderer.invoke('settings:resetAll'),
  getSettingsPath: () => ipcRenderer.invoke('settings:getPath'),
  getSettingsSize: () => ipcRenderer.invoke('settings:getSize'),
});
