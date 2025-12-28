// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { CreateGameParams } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  quit: () => ipcRenderer.invoke('app:quit'),
  createGame: (params: CreateGameParams) => ipcRenderer.invoke('game:create', params),
});
