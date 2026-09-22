import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { initNativeApp } from './services/nativeService';
import { useNativeBackNavigation } from './hooks/useNativeBackNavigation';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { ExploreView } from './components/ExploreView';
import { SellerStudioView } from './components/SellerStudioView';
import { WishlistView } from './components/WishlistView';
import { UserProfileView } from './components/UserProfileView';
import { AdminPanel } from './components/AdminPanel';
import { OrdersView } from './components/OrdersView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { RentalCheckoutModal } from './components/RentalCheckoutModal';
import { BuyCheckoutModal } from './components/BuyCheckoutModal';
import { UploadListingModal } from './components/UploadListingModal';
import { FiltersModal } from './components/FiltersModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CallSellerModal } from './components/CallSellerModal';
import { AuthModal } from './components/AuthModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { DeleteOutfitConfirmModal } from './components/DeleteOutfitConfirmModal';
import { MandatoryProfileModal } from './components/MandatoryProfileModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AppStorePlatform } from './components/AppStorePlatform';
import LoginDashboard from './components/LoginDashboard';
import { SplashScreen } from './components/SplashScreen';
import { ToastContainer } from './components/ToastContainer';
import { OfflineNotificationBanner } from './components/OfflineNotificationBanner';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    activeModal,
    setActiveModal,
    editingProduct,
    setEditingProduct,
    activeStory,
    setActiveStory,
    showUpdateModal,
    setShowUpdateModal,
    activeChatId,
    setActiveChatId,
    productToDelete,
    setProductToDelete,
    showToast,
    isOnboarded,
    signInGoogle,
    signInEmail,
    signInAnonymouslyFallback
  } = useApp();

  // Mobile Native-Style Back Navigation System
  useNativeBackNavigation({
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    productToDelete,
    setProductToDelete,
    activeModal,
    setActiveModal,
    editingProduct,
    setEditingProduct,
    activeStory,
    setActiveStory,
    showUpdateModal,
    setShowUpdateModal,
    activeChatId,
    setActiveChatId,
    showToast
  });

  useEffect(() => {
    initNativeApp();

    // Check if user clicked a share link or arrived via download platform URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isStoreParam = 
        urlParams.get('platform') === 'store' || 
        urlParams.get('download') === 'true' || 
        urlParams.get('install') === 'true' || 
        urlParams.get('install') === 'store' ||
        urlParams.get('view') === 'store' ||
        urlParams.get('view') === 'appstore' ||
        urlParams.get('source') === 'share' ||
        window.location.pathname.startsWith('/download') ||
        window.location.pathname === '/app' ||
        window.location.hash === '#download' ||
        window.location.hash === '#appstore';

      if (isStoreParam) {
        setActiveModal('appstore');
      }
    }
  }, [setActiveModal]);

  // Show First-Time User Onboarding & Login Screen if not onboarded
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#9f2089] selection:text-slate-900">
        <SplashScreen />
        <LoginDashboard 
          onContinueAsGuest={signInAnonymouslyFallback}
        />
        <AppStorePlatform />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 overflow-hidden selection:bg-[#9f2089] selection:text-slate-900">
      <OfflineNotificationBanner />
      {/* Welcome Splash Screen on app launch */}
      <SplashScreen />

      {/* Mobile Bottom Navigation / Desktop Sidebar */}
      <BottomNav />

      {/* Main App Content - Adjusted for Sidebar on md/lg screens */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto md:pl-24 lg:pl-64 relative">
        
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
          {activeTab === 'home' && <HomeFeed />}
          {activeTab === 'explore' && <ExploreView />}
          {activeTab === 'sell' && <SellerStudioView />}
          {activeTab === 'wishlist' && <WishlistView />}
          {activeTab === 'profile' && <UserProfileView />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'orders' && <OrdersView />}
        </main>
      </div>

      {/* All Application Modals */}
      <MandatoryProfileModal />
      <ProductDetailModal />
      <StoryViewerModal />
      <RentalCheckoutModal />
      <BuyCheckoutModal />
      <UploadListingModal />
      <FiltersModal />
      <NotificationsModal />
      <CallSellerModal />
      <AuthModal />
      <AppUpdateModal />
      <DeleteOutfitConfirmModal />
      <InstallAppModal />
      <AppStorePlatform />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
