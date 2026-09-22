import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bgkwear.app',
  appName: 'BGK WEAR',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'https://ais-dev-dhycsawcs6idisqhopoyem-10755086688.asia-southeast1.run.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#050505',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050505'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '742797303539-qfpf2kqaltg0lblpgh2c9lqis2gmm4nj.apps.googleusercontent.com',
      clientId: '742797303539-qfpf2kqaltg0lblpgh2c9lqis2gmm4nj.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    AdMob: {
      initializeOnId: 'ca-app-pub-8719290794462372~4328822857'
    }
  }
};

export default config;

