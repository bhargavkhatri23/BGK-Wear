/**
 * SEO & Social Sharing Meta Tags Utility
 * Dynamically updates document title, Open Graph, Twitter Cards, and JSON-LD structured data.
 */

export interface SEOMetaConfig {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'product' | 'article' | 'profile';
  price?: number;
  currency?: string;
  category?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  keywords?: string[];
}

export const DEFAULT_SEO: SEOMetaConfig = {
  title: 'BGK WEAR | Wear Your Confidence - Luxury Designer Rental & Marketplace',
  description: "India's #1 peer-to-peer luxury designer wear marketplace. Rent, buy, and list authentic bridal lehengas, sherwanis, and wedding outfits with 0% commission.",
  image: '/icon-512.png',
  imageAlt: 'BGK WEAR - Luxury Wedding & Designer Wear Marketplace',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://bgkwear.com',
  type: 'website',
  keywords: [
    'bridal lehenga rental',
    'designer sherwani rent',
    'wedding lehenga rent buy',
    'designer saree rental',
    'peer to peer fashion rental',
    'sabyasachi lehenga rental',
    'wedding fashion India',
    'BGK WEAR',
    'luxury fashion marketplace'
  ]
};

function setMetaTag(selector: string, attribute: string, value: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name=')) {
      const name = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
      if (name) element.setAttribute('name', name);
    } else if (selector.startsWith('meta[property=')) {
      const prop = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
      if (prop) element.setAttribute('property', prop);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Updates document title, Open Graph, and Twitter tags for SEO & rich social sharing previews
 */
export function updateSEOMeta(config: SEOMetaConfig = {}) {
  if (typeof document === 'undefined') return;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : (config.url || DEFAULT_SEO.url || '');
  const title = config.title 
    ? (config.title.includes('BGK WEAR') ? config.title : `${config.title} | BGK WEAR`)
    : (DEFAULT_SEO.title || 'BGK WEAR');
  const description = config.description || DEFAULT_SEO.description || '';
  const image = config.image || DEFAULT_SEO.image || '/icon-512.png';
  const imageAlt = config.imageAlt || config.title || DEFAULT_SEO.imageAlt || 'BGK WEAR';
  const type = config.type || DEFAULT_SEO.type || 'website';

  // Standard Meta Tags
  document.title = title;
  setMetaTag('meta[name="description"]', 'content', description);
  
  if (config.keywords && config.keywords.length > 0) {
    setMetaTag('meta[name="keywords"]', 'content', config.keywords.join(', '));
  }

  // Canonical link
  setLinkTag('canonical', currentUrl);

  // Open Graph (Facebook, WhatsApp, LinkedIn, Discord)
  setMetaTag('meta[property="og:title"]', 'content', title);
  setMetaTag('meta[property="og:description"]', 'content', description);
  setMetaTag('meta[property="og:image"]', 'content', image);
  setMetaTag('meta[property="og:image:alt"]', 'content', imageAlt);
  setMetaTag('meta[property="og:url"]', 'content', currentUrl);
  setMetaTag('meta[property="og:type"]', 'content', type);
  setMetaTag('meta[property="og:site_name"]', 'content', 'BGK WEAR');
  setMetaTag('meta[property="og:locale"]', 'content', 'en_IN');

  // Twitter Card (X / Twitter)
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:site"]', 'content', '@bgkwear');
  setMetaTag('meta[name="twitter:creator"]', 'content', '@bgkwear');
  setMetaTag('meta[name="twitter:title"]', 'content', title);
  setMetaTag('meta[name="twitter:description"]', 'content', description);
  setMetaTag('meta[name="twitter:image"]', 'content', image);
  setMetaTag('meta[name="twitter:image:alt"]', 'content', imageAlt);

  // Product specific meta tags if applicable
  if (type === 'product' && config.price) {
    setMetaTag('meta[property="product:price:amount"]', 'content', String(config.price));
    setMetaTag('meta[property="product:price:currency"]', 'content', config.currency || 'INR');
    if (config.category) {
      setMetaTag('meta[property="product:category"]', 'content', config.category);
    }
    if (config.brand) {
      setMetaTag('meta[property="product:brand"]', 'content', config.brand);
    }
    if (config.availability) {
      setMetaTag('meta[property="product:availability"]', 'content', config.availability);
    }
  }

  // Dynamic JSON-LD structured data
  updateDynamicStructuredData(config, title, description, image, currentUrl);
}

/**
 * Updates dynamic JSON-LD structured data script
 */
function updateDynamicStructuredData(
  config: SEOMetaConfig, 
  title: string, 
  description: string, 
  image: string, 
  url: string
) {
  if (typeof document === 'undefined') return;

  const scriptId = 'bgk-dynamic-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  let schemaData: Record<string, any>;

  if (config.type === 'product' && config.price) {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': title,
      'image': [image],
      'description': description,
      'brand': {
        '@type': 'Brand',
        'name': config.brand || 'Luxury Designer Wear'
      },
      'category': config.category || 'Apparel & Accessories > Clothing > Traditional Clothing',
      'offers': {
        '@type': 'Offer',
        'url': url,
        'priceCurrency': config.currency || 'INR',
        'price': config.price,
        'availability': `https://schema.org/${config.availability || 'InStock'}`,
        'itemCondition': 'https://schema.org/UsedCondition',
        'seller': {
          '@type': 'Organization',
          'name': 'BGK WEAR'
        }
      }
    };
  } else {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      'name': 'BGK WEAR',
      'alternateName': 'BGK Wear Luxury Marketplace',
      'description': description,
      'url': url,
      'logo': '/icon-512.png',
      'image': image,
      'priceRange': '₹₹',
      'currenciesAccepted': 'INR',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${url}?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  script.textContent = JSON.stringify(schemaData);
}

/**
 * Resets document title, Open Graph, and Twitter tags back to default BGK WEAR site values
 */
export function resetSEOMeta() {
  updateSEOMeta(DEFAULT_SEO);
}
