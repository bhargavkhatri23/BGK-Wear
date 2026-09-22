const RECENT_SEARCHES_KEY = 'bgk_recent_searches';
const MAX_RECENT_SEARCHES = 4; // Strictly max 4 latest history items

export const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch (e) {
    return [];
  }
};

export const addRecentSearch = (query: string): string[] => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return getRecentSearches();

  const recent = getRecentSearches();
  const filtered = recent.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving recent searches:', e);
  }
  return updated;
};

export const removeRecentSearch = (query: string): string[] => {
  const recent = getRecentSearches();
  const updated = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error removing recent search:', e);
  }
  return updated;
};

export const clearRecentSearches = (): void => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.warn('Error clearing recent searches:', e);
  }
};
