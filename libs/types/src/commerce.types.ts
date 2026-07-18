// ─── libs/types/src/commerce.types.ts ───────────────────────────────────────

export interface Product {
  id: string;
  siteId: string;
  userId: string;
  name: string;
  description?: string;
  priceUsd: number;
  imageUrl?: string;
  stock?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  siteId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceDate: Date;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}
