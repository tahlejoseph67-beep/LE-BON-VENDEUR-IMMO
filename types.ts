export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type Currency = 'XOF' | 'USD' | 'EUR';

export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  promoVideoUrl?: string;
  views: number;
  likes: number;
  isSold: boolean;
  status: PropertyStatus;
  bedrooms?: number;
  lat?: number;
  lng?: number;
}