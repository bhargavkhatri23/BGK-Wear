import { useEffect, useRef } from 'react';
import { triggerHaptic, exitNativeApp } from '../services/nativeService';
import { Product, WeddingStory } from '../types';

export interface UseNativeBackNavigationProps {
  activeTab: 'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders';
  setActiveTab: (tab: 'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  productToDelete?: Product | null;
  setProductToDelete?: (prod: Product | null) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  editingProduct: Product | null;
  setEditingProduct: (prod: Product | null) => void;
  activeStory: WeddingStory | null;
  setActiveStory: (story: WeddingStory | null) => void;
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

/**
 * Mobile Native-Style Back Navigation Hook
 * - Manages Single-Step Back navigation across all modals, drawers, chat threads, and inner pages.
 * - Enforces Double-Back-to-Exit when on the main Home screen with a 2-second timeout window.
 * - Synchronizes with browser history (popstate) and Android Capacitor native back button events.
 */
export const useNativeBackNavigation = ({
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
}: UseNativeBackNavigationProps) => {
  // Synchronous state refs to prevent stale closure issues in popstate listener
  const activeTabRef = useRef(activeTab);
  const selectedProductRef = useRef(selectedProduct);
  const productToDeleteRef = useRef(productToDelete);
  const activeModalRef = useRef(activeModal);
  const editingProductRef = useRef(editingProduct);
  const activeStoryRef = useRef(activeStory);
  const showUpdateModalRef = useRef(showUpdateModal);
  const activeChatIdRef = useRef(activeChatId);

  // Tab navigation history stack
  const tabHistoryRef = useRef<Array<'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders'>>([]);
  const prevTabRef = useRef(activeTab);

  // Timestamp for double back to exit on Home screen
  const lastBackPressTimeRef = useRef<number>(0);

  // Flag to differentiate popstate triggers from user-initiated forward pushes
  const isBackNavigationInProgressRef = useRef<boolean>(false);

  // Keep refs up-to-date synchronously on every render
  useEffect(() => {
    activeTabRef.current = activeTab;
    selectedProductRef.current = selectedProduct;
    productToDeleteRef.current = productToDelete;
    activeModalRef.current = activeModal;
    editingProductRef.current = editingProduct;
    activeStoryRef.current = activeStory;
    showUpdateModalRef.current = showUpdateModal;
    activeChatIdRef.current = activeChatId;
  });

  // Track tab history stack
  useEffect(() => {
    if (activeTab !== prevTabRef.current) {
      if (!isBackNavigationInProgressRef.current) {
        tabHistoryRef.current.push(prevTabRef.current);
      }
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  // Initial root state setup
  useEffect(() => {
    try {
      if (!window.history.state || !window.history.state.bgkWearRoot) {
        window.history.replaceState({ bgkWearRoot: true, view: 'home' }, '');
      }
    } catch {
      // Safe fallback for restricted iframe environments
    }
  }, []);

  // Push history state whenever user navigates forward to an inner screen or modal
  useEffect(() => {
    if (isBackNavigationInProgressRef.current) {
      isBackNavigationInProgressRef.current = false;
      return;
    }

    const hasAnyOverlay = Boolean(
      showUpdateModal ||
      activeStory ||
      activeModal ||
      productToDelete ||
      editingProduct ||
      selectedProduct ||
      activeChatId ||
      activeTab !== 'home'
    );

    if (hasAnyOverlay) {
      try {
        window.history.pushState({ bgkWear: true, timestamp: Date.now() }, '');
      } catch {
        // Safe fallback
      }
    }
  }, [
    activeTab,
    selectedProduct,
    productToDelete,
    activeModal,
    editingProduct,
    activeStory,
    showUpdateModal,
    activeChatId
  ]);

  // Unified popstate event handler
  useEffect(() => {
    const handlePopState = () => {
      isBackNavigationInProgressRef.current = true;

      // 1. Check Top-Level Overlays / System Modals
      if (showUpdateModalRef.current) {
        setShowUpdateModal(false);
        triggerHaptic('light');
        return;
      }

      if (activeStoryRef.current) {
        setActiveStory(null);
        triggerHaptic('light');
        return;
      }

      if (productToDeleteRef.current && setProductToDelete) {
        setProductToDelete(null);
        triggerHaptic('light');
        return;
      }

      // 2. Check Action Modals (Filters, Call, Notifications, Checkout, Upload, Auth)
      if (activeModalRef.current) {
        setActiveModal(null);
        triggerHaptic('light');
        return;
      }

      if (editingProductRef.current) {
        setEditingProduct(null);
        triggerHaptic('light');
        return;
      }

      // 3. Check Product Detail Modal
      if (selectedProductRef.current) {
        setSelectedProduct(null);
        triggerHaptic('light');
        return;
      }

      // 4. Check In-App Active Chat Room
      if (activeTabRef.current === 'chat' && activeChatIdRef.current) {
        setActiveChatId(null);
        triggerHaptic('light');
        return;
      }

      // 5. Check Inner Pages / Tabs Navigation
      if (activeTabRef.current !== 'home') {
        const previousTab = tabHistoryRef.current.pop() || 'home';
        setActiveTab(previousTab);
        triggerHaptic('light');
        return;
      }

      // 6. Main Home Screen: Double Back to Exit Implementation
      const now = Date.now();
      const timeSinceLastPress = now - lastBackPressTimeRef.current;

      if (timeSinceLastPress < 2000) {
        // Double Back confirmed within 2 seconds -> Exit App
        triggerHaptic('heavy');
        exitNativeApp();
      } else {
        // First Back press on Home screen -> Show warning toast and start 2s timer
        lastBackPressTimeRef.current = now;
        triggerHaptic('light');
        showToast('Press back again to exit', 'info');

        // Push state back so browser history does not navigate away on first press
        try {
          window.history.pushState({ bgkWearRoot: true, view: 'home' }, '');
        } catch {
          // Safe fallback
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    setActiveTab,
    setSelectedProduct,
    setActiveModal,
    setEditingProduct,
    setActiveStory,
    setShowUpdateModal,
    setActiveChatId,
    showToast
  ]);
};
