export interface BusinessCategory {
  id: string;
  name: string;
  defaultFeatures: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { 
    id: 'bakery', 
    name: 'Bakery / Cake Shop', 
    defaultFeatures: ['catalog', 'online_booking', 'gallery', 'reviews', 'whatsapp'] 
  },
  { 
    id: 'restaurant', 
    name: 'Restaurant / Cafe', 
    defaultFeatures: ['menu', 'reservations', 'reviews', 'gallery', 'location'] 
  },
  { 
    id: 'salon', 
    name: 'Salon / Spa', 
    defaultFeatures: ['booking', 'services', 'gallery', 'reviews', 'contact'] 
  },
  { 
    id: 'retail', 
    name: 'Retail Store', 
    defaultFeatures: ['catalog', 'faq', 'reviews', 'location', 'contact'] 
  },
  { 
    id: 'consulting', 
    name: 'Consulting / Agency', 
    defaultFeatures: ['services', 'booking', 'pricing', 'testimonials', 'faq', 'contact'] 
  },
  { 
    id: 'fitness', 
    name: 'Fitness / Gym', 
    defaultFeatures: ['classes', 'booking', 'pricing', 'trainers', 'location'] 
  },
  { 
    id: 'photography', 
    name: 'Photography / Creative', 
    defaultFeatures: ['portfolio', 'pricing', 'booking', 'about', 'contact'] 
  },
  { 
    id: 'real_estate', 
    name: 'Real Estate', 
    defaultFeatures: ['listings', 'agents', 'contact', 'location', 'reviews'] 
  },
  { 
    id: 'freelancer', 
    name: 'Freelancer / Portfolio', 
    defaultFeatures: ['portfolio', 'about', 'services', 'testimonials', 'contact'] 
  },
  { 
    id: 'event_planning', 
    name: 'Event Planning', 
    defaultFeatures: ['gallery', 'services', 'testimonials', 'contact', 'faq'] 
  },
  { 
    id: 'other', 
    name: 'Other', 
    defaultFeatures: ['about', 'services', 'contact', 'faq'] 
  }
];
