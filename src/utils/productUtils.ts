import { Product } from '../types';

export const getCategoryCounts = (products: Product[]) => {
  const counts: Record<string, number> = {};
  products.forEach(p => {
    const category = p.category.toLowerCase().trim();
    counts[category] = (counts[category] || 0) + 1;
  });
  return counts;
};
