/**
 * Fuzzy Search & Typo-Tolerance Utility for BGK WEAR
 * Handles misspellings, phonetic variations, and typos in ethnic wear, designers, colors, and cities.
 */

// Common ethnic fashion terms typo dictionary mapping misspellings to standard terms
const TYPO_MAP: Record<string, string> = {
  // Categories & Outfits
  lehanga: 'lehenga',
  lahenga: 'lehenga',
  lehnga: 'lehenga',
  lehega: 'lehenga',
  lehengaa: 'lehenga',
  lihenga: 'lehenga',
  lhnga: 'lehenga',
  lehengai: 'lehenga',

  sherwanii: 'sherwani',
  shervani: 'sherwani',
  servani: 'sherwani',
  sarwani: 'sherwani',
  sherwanis: 'sherwani',
  shrewani: 'sherwani',

  saree: 'saree',
  sari: 'saree',
  sary: 'saree',
  sare: 'saree',
  saris: 'saree',
  sarees: 'saree',
  saaree: 'saree',

  anarkli: 'anarkali',
  anarkaly: 'anarkali',
  anarklee: 'anarkali',

  gown: 'gown',
  gownn: 'gown',
  gawn: 'gown',
  gowan: 'gown',

  kurta: 'kurta',
  kurti: 'kurti',
  kuta: 'kurta',
  kurtas: 'kurta',

  indowestern: 'indo-western',
  'indo western': 'indo-western',
  indowesterns: 'indo-western',

  jodhpuri: 'jodhpuri',
  jodpuri: 'jodhpuri',
  jodhpur: 'jodhpuri',

  choli: 'choli',
  choly: 'choli',
  choley: 'choli',

  dupata: 'dupatta',

  // Designers & Brands
  manish: 'manish',
  manis: 'manish',
  malhotra: 'malhotra',
  malotra: 'malhotra',
  
  sabya: 'sabyasachi',
  sabyasaci: 'sabyasachi',

  tarun: 'tarun',
  tahiliani: 'tahiliani',
  tahilani: 'tahiliani',

  anita: 'anita',
  dongre: 'dongre',

  shantanu: 'shantanu',
  nikhil: 'nikhil',

  // Colors
  rad: 'red',
  reed: 'red',
  maron: 'maroon',
  marune: 'maroon',
  golden: 'gold',
  gould: 'gold',
  pynk: 'pink',
  bleu: 'blue',
  gren: 'green',
  yelow: 'yellow',
  wite: 'white',
  blck: 'black',
  pech: 'peach',

  // Cities
  mambai: 'mumbai',
  mumbay: 'mumbai',
  deli: 'delhi',
  delhy: 'delhi',
  soorat: 'surat',
  jaypur: 'jaipur',

  // Occasions
  weding: 'wedding',
  weddin: 'wedding',
  reseption: 'reception',
  sangit: 'sangeet',
  sangheet: 'sangeet',
  haldee: 'haldi',
  mehndi: 'mehendi',
  bridel: 'bridal',
  bride: 'bridal'
};

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes query word using typo dictionary mapping
 */
export function normalizeWord(word: string): string {
  const clean = word.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!clean) return word.toLowerCase().trim();
  return TYPO_MAP[clean] || clean;
}

/**
 * Checks if a search token matches a target string (exact, substring, or fuzzy edit distance)
 */
export function isFuzzyTokenMatch(queryToken: string, targetText: string): boolean {
  if (!targetText) return false;
  const rawToken = queryToken.toLowerCase().trim();
  const normalizedQuery = normalizeWord(rawToken);
  const normalizedTarget = targetText.toLowerCase();

  // 1. Direct substring match (exact or normalized)
  if (normalizedTarget.includes(normalizedQuery) || normalizedTarget.includes(rawToken)) {
    return true;
  }

  // 2. Tokenize target text into individual words
  const targetWords = normalizedTarget.split(/[\s,/\-_]+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter(Boolean);

  for (const targetWord of targetWords) {
    if (!targetWord) continue;

    // Substring match
    if (targetWord.includes(normalizedQuery) || normalizedQuery.includes(targetWord) || targetWord.includes(rawToken)) {
      return true;
    }

    // Levenshtein distance check based on word length
    const queryToUse = normalizedQuery.length >= 3 ? normalizedQuery : rawToken;
    const distance = levenshteinDistance(queryToUse, targetWord);
    
    // Max edit distance allowed based on length
    const maxAllowedDistance = queryToUse.length <= 4 ? 1 : queryToUse.length <= 8 ? 2 : 3;

    if (distance <= maxAllowedDistance) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates whether a product matches a search query with full typo tolerance
 */
export function matchProductWithFuzzySearch(product: any, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;

  const query = searchQuery.trim().toLowerCase();

  // Extract target text fields from product
  const targetFields: string[] = [
    product.title || '',
    product.description || '',
    product.category || '',
    product.brand || '',
    product.color || '',
    product.city || '',
    product.state || '',
    product.fabric || '',
    product.seller?.name || '',
    ...(Array.isArray(product.occasion) ? product.occasion : [])
  ].filter(Boolean);

  const combinedTargetText = targetFields.join(' ').toLowerCase();

  // 1. Direct full query inclusion
  if (combinedTargetText.includes(query)) return true;

  // 2. Tokenize query into words
  const queryTokens = query.split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);

  if (queryTokens.length === 0) return true;

  // Check if every query token matches somewhere in product fields
  const tokenMatches = queryTokens.map((token) => {
    return targetFields.some((field) => isFuzzyTokenMatch(token, field));
  });

  return tokenMatches.every(Boolean);
}
