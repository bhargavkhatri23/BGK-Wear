import { AdMob, InterstitialAdPluginEvents, AdMobBannerSize, BannerAdPosition, BannerAdPluginEvents, AdOptions, AdLoadInfo } from '@capacitor-community/admob';

const INTERSTITIAL_ID = 'ca-app-pub-8719290794462372/6359984625';

export const initializeAdMob = async () => {
  try {
    console.log('AdMob: Initializing SDK...');
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false,
    });
    console.log('AdMob: SDK Initialized successfully');
    
    // Preload an ad immediately after initialization
    preloadInterstitial();
  } catch (error) {
    console.error('AdMob: Initialization failed', error);
  }
};

export const preloadInterstitial = async () => {
  try {
    console.log('AdMob: Preloading interstitial ad...');
    const options = {
      adId: INTERSTITIAL_ID,
      isTesting: false,
    };
    await AdMob.prepareInterstitial(options);
    console.log('AdMob: Interstitial ad preloaded and ready');
  } catch (error) {
    console.error('AdMob: Failed to preload interstitial ad', error);
  }
};

export const loadAndShowInterstitial = async () => {
  try {
    console.log('AdMob: Attempting to show interstitial ad...');
    // First, check if ad is ready (prepare it again just in case, or show if it's already preloaded)
    // The prepareInterstitial method is idempotent if already loaded usually, but let's just try to show first
    try {
      await AdMob.showInterstitial();
      console.log('AdMob: Interstitial ad shown successfully');
    } catch (showError) {
      console.warn('AdMob: Ad not ready to show, trying to prepare and show now...', showError);
      const options = {
        adId: INTERSTITIAL_ID,
        isTesting: false,
      };
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      console.log('AdMob: Interstitial ad prepared and shown successfully');
    }
    
    // Preload the next ad for future use
    preloadInterstitial();
  } catch (error) {
    console.error('AdMob: Total failure in loadAndShowInterstitial', error);
    // Silent fail to not disrupt user experience
  }
};
