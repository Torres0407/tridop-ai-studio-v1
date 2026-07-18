// ─── libs/types/src/site.types.ts ───────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'navbar'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'footer'
  | 'gallery'
  | 'pricing'
  | 'contact'
  | 'faq'
  | 'custom';

export const FEATURE_TO_BLOCK: Record<string, BlockType[]> = {
  catalog: ['features', 'pricing'],
  online_booking: ['cta', 'contact'],
  gallery: ['gallery'],
  reviews: ['testimonials'],
  whatsapp: ['contact'],
  menu: ['features', 'gallery'],
  reservations: ['cta', 'contact'],
  location: ['contact'],
  booking: ['cta', 'contact'],
  services: ['features'],
  contact: ['contact'],
  faq: ['faq'],
  pricing: ['pricing'],
  testimonials: ['testimonials'],
  classes: ['features'],
  trainers: ['features'],
  portfolio: ['gallery', 'features'],
  about: ['hero', 'features'],
  listings: ['features', 'gallery'],
  agents: ['features'],
};

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  props: Record<string, unknown>;
  visible: boolean;
}

export interface Page {
  id: string;
  slug: string;
  name: string;
  blocks: Block[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteSchema {
  id: string;
  userId: string;
  slug: string;
  name: string;
  blocks?: Block[]; // Deprecated: legacy single-page support
  pages?: Page[]; // New: multi-page support
  theme: Record<string, unknown>;
  seoTitle?: string;
  seoDescription?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionSnapshot {
  id: string;
  siteId: string;
  blocks: Block[];
  version: number;
  label?: string;
  createdAt: Date;
}

export interface ABTest {
  id: string;
  siteId: string;
  blockId: string;
  variantA: Partial<Block>;
  variantB: Partial<Block>;
  splitPercent: number;
  active: boolean;
  createdAt: Date;
}

export interface SiteCollaborator {
  id: string;
  siteId: string;
  userId: string;
  role: 'editor' | 'viewer';
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  industry?: string;
  blocks: Block[];
  previewUrl?: string;
  createdAt: Date;
}
