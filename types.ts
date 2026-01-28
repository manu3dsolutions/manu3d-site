import React from 'react';

export interface Creator {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  socialInstagram?: string;
}

export interface Product {
  id: number;
  title: string;
  category: 'Figurine' | 'Decor' | 'Cosplay' | string;
  price: string; // Format stocké en string "XX.XX€" pour l'affichage, conversion nécessaire pour calculs
  numericPrice?: number; // Nouveau: prix numérique pour calculs
  image: string;
  description: string;
  isNew?: boolean;
  creatorId?: number;
  weightG?: number;
  stock?: number;
  rarity?: string;
}

export interface Partner {
  id?: number;
  name: string;
  logoUrl: string;
  description: string;
  url?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface Review {
  id: number;
  name: string;
  role: string;
  date: string;
  rating: number;
  text: string;
  item: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  pricePerKg: number;
  isPickup: boolean;
  estimatedDays: string;
}

export interface CartItem extends Product {
  quantity: number;
  type?: 'product' | 'custom'; // Distinguer produit stock vs impression demandée
  customConfig?: {
    fileName: string;
    materialName: string;
    finishName: string;
    volumeCm3: number;
    printHours: number;
    paintHours: number;
  };
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  active: boolean;
}

export interface GlobalSiteConfig {
  shippingFreeThreshold: number;
  invoice: {
    companyName: string;
    addressLine1: string;
    addressLine2: string;
    siret: string;
    email: string;
    footerText: string;
  }
}