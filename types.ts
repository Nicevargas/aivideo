
export type ViewType = 'gallery' | 'create' | 'my-videos' | 'registration' | 'buy-credits' | 'auth' | 'scheduler';

export type VideoCategory = 'timelapse' | 'animated_character' | 'motivational';

export interface PhotoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  author: string;
  ownerId: string;
  isPublic: boolean;
  creditsCommon: number;
  creditsExclusive: number;
  isExclusiveSold: boolean;
  createdAt: number;
  tags?: string[];
  category?: VideoCategory;
}

export type VideoItem = PhotoItem;

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  credits: number;
  acesso_prof_usuario: number;
  phone?: string;
  taxId?: string;
  profileId?: number;
  avatar_url?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  bestValue?: boolean;
}

export interface PaymentResponse {
  id_pagamento: string;
  qrcode: string;
  img_qrcode: string;
  valor: number;
  status: string;
}

export interface ScheduledPost {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  scheduledAt: string;
  caption: string;
  status: 'pending' | 'posted' | 'failed';
}
