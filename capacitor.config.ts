import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.billigst.app',
  appName: 'Billigst',
  webDir: 'public',
  server: {
    // Point to your deployed Vercel URL in production
    url: process.env.CAPACITOR_SERVER_URL || 'https://billigst.no',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#111318',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111318',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Billigst',
    backgroundColor: '#111318',
  },
  android: {
    backgroundColor: '#111318',
    allowMixedContent: false,
  },
};

export default config;
