import { useEffect } from 'react';
import { updateSEOMeta, resetSEOMeta, SEOMetaConfig } from '../utils/seoUtils';

/**
 * Hook to dynamically apply SEO, Open Graph, and Twitter tags while a view/modal is active,
 * and automatically restore defaults when unmounted or closed.
 */
export function useDynamicSEO(config?: SEOMetaConfig | null) {
  useEffect(() => {
    if (!config) return;

    updateSEOMeta(config);

    return () => {
      resetSEOMeta();
    };
  }, [
    config?.title,
    config?.description,
    config?.image,
    config?.price,
    config?.currency,
    config?.category,
    config?.type
  ]);
}
