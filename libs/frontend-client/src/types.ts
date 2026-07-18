export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignupPayload {
  email: string;
  password?: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export type UserRole = 'user' | 'owner';
export type OAuthProvider = 'google' | 'github' | 'local';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  oauthProvider: OAuthProvider;
  oauthId?: string | null;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  userId: string;
  businessName: string;
  category?: string;
  industry?: string;
  selectedFeatures?: string[];
  description?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  websiteUrl?: string;
  paystackSubaccountCode?: string;
  bankCode?: string;
  accountNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Block {
  siteId: string;
  blockId: string;
  type: string;
  data: Record<string, any>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSchema {
  siteId: string;
  ownerId: string;
  slug: string;
  status: string;
  blocks: Block[];
  pages: any[];
  globalSettings: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface VersionSnapshot {
  siteId: string;
  versionNumber: number;
  createdBy: string;
  snapshotData: Record<string, any>;
  commitMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  slug: string;
  name: string;
  category: string;
  defaultBlocks: Record<string, any>;
  globalSettings: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ABTest {
  siteId: string;
  name: string;
  status: string;
  variantId: string;
  weight: number;
  blocksOverride: Record<string, any>;
  results: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicRecord {
  siteId: string;
  schemaType: string;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  siteId: string;
  name: string;
  price: number;
  currency: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  siteId: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  siteId: string;
  customerId?: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt?: string;
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  siteId: string;
  name: string;
  email?: string;
  phone?: string;
  lifetimeValue: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  siteId: string;
  contactId?: string;
  formName: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageThread {
  siteId: string;
  contactId?: string;
  channel: string;
  messages: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  siteId: string;
  contactId?: string;
  rating: number;
  content: string;
  source: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  traceId?: string;
  timestamp: string;
}
