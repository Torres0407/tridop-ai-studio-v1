export type TriExpression = 'idle' | 'excited' | 'thinking' | 'talking' | 'wink' | 'pointing';

export interface User {
  name: string;
  email: string;
}

export interface PromptExample {
  id: string;
  text: string;
  category: string;
}

export interface PlanningItem {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed';
  details: string[];
}

export interface Block {
  id: string;
  type: 'navigation' | 'hero' | 'content' | 'media' | 'socialProof' | 'cta' | 'footer';
  name: string;
  data: {
    logo?: string;
    links?: string[];
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText1?: string;
    buttonText2?: string;
    items?: Array<{ title: string; desc: string; val?: string; metric?: string }>;
    accentColor?: string;
    placeholderImage?: string;
    formLabel?: string;
    formPlaceholder?: string;
    copyright?: string;
  };
  styles: {
    bg: string;
    text: string;
    accent: string;
    paddingY: string;
    roundedButtons: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived';
  lastUpdated: string;
  stack: string[];
  blocks: Block[];
  tagline?: string;
  logoUrl?: string | null;
  phone?: string;
  whatsApp?: string;
  contactEmail?: string;
  address?: string;
  vibe?: string;
  buildMode?: string;
  userEmail?: string;
}

