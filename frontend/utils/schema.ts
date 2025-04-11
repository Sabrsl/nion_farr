/**
 * Utilitaires pour générer des schémas JSON-LD pour le SEO
 */

export interface ServiceSchemaData {
  id: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  price: number;
  priceCurrency?: string;
  provider?: {
    id: string;
    name: string;
    image?: string;
  };
  rating?: number;
  reviewCount?: number;
  url?: string;
  category?: string;
}

/**
 * Génère un schéma JSON-LD pour un service
 */
export function generateServiceSchema(data: ServiceSchemaData): Record<string, any> {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://nionfar.sn/services/${data.id}`,
    'name': data.name,
    'description': data.description,
    'url': data.url || `https://nionfar.sn/services/${data.id}`,
    'provider': data.provider ? {
      '@type': 'Organization',
      'name': data.provider.name,
      'image': data.provider.image || undefined
    } : undefined,
    'offers': {
      '@type': 'Offer',
      'price': data.price,
      'priceCurrency': data.priceCurrency || 'XOF',
      'availability': 'https://schema.org/InStock'
    }
  };

  // Ajouter les images si disponibles
  if (data.image) {
    schema['image'] = data.image;
  }
  
  if (data.images && data.images.length > 0) {
    schema['image'] = data.images;
  }
  
  // Ajouter la notation si disponible
  if (data.rating && data.reviewCount) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': data.rating,
      'reviewCount': data.reviewCount
    };
  }
  
  // Ajouter la catégorie si disponible
  if (data.category) {
    schema['category'] = data.category;
  }
  
  return schema;
}

/**
 * Génère un schéma BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

/**
 * Génère un schéma FAQ
 */
export function generateFAQSchema(questions: Array<{ question: string; answer: string }>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
}

/**
 * Formate un schéma JSON-LD pour être inséré dans la balise script
 */
export function formatJSONLD(schema: Record<string, any>): string {
  return JSON.stringify(schema);
}

/**
 * Génère un schéma Organization pour la page d'accueil
 */
export function generateOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'NionFar',
    'url': 'https://nionfar.sn',
    'logo': 'https://nionfar.sn/logo.png',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+221-XX-XXX-XXXX',
      'contactType': 'customer service',
      'availableLanguage': ['French']
    },
    'sameAs': [
      'https://facebook.com/nionfar',
      'https://twitter.com/nionfar',
      'https://instagram.com/nionfar'
    ]
  };
} 