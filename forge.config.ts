import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Belote Scorer',
    executableName: 'belote-scorer',
    icon: './build/icon',
    appBundleId: 'com.belote.scorer',
    appCategoryType: 'public.app-category.games',
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    new MakerSquirrel({
      name: 'belote_scorer',
      authors: 'Stade Lavallois TC',
      description: 'Application de gestion des scores de Belote',
      iconUrl: 'https://raw.githubusercontent.com/gaudincyprien/Belote/main/build/icon.ico',
      setupIcon: './build/icon.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        name: 'belote-scorer',
        productName: 'Belote Scorer',
        genericName: 'Belote Score Manager',
        categories: ['Game'],
        icon: './build/icon.png',
      },
    }),
    new MakerDeb({
      options: {
        name: 'belote-scorer',
        productName: 'Belote Scorer',
        genericName: 'Belote Score Manager',
        categories: ['Game'],
        icon: './build/icon.png',
        section: 'games',
        priority: 'optional',
        maintainer: 'Stade Lavallois TC <stadelavalloistc@gmail.com>',
        homepage: 'https://github.com/gaudincyprien/Belote',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/main/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
