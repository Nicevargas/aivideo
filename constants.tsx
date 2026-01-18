
import { PhotoItem, UserProfile } from './types';

export const INITIAL_USER_STATE: UserProfile | null = null;

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'mock-eunice',
    display_name: 'Eunice',
    credits: 0,
    phone: '(51) 98541-3413',
    taxId: '658.834.380-91',
    acesso_prof_usuario: 1,
    avatar_url: 'https://i.pravatar.cc/150?u=eunice'
  },
  {
    id: 'mock-nice',
    display_name: 'Nice Vargas',
    credits: 0,
    phone: '51985413413',
    taxId: '65883438091',
    acesso_prof_usuario: 2,
    avatar_url: 'https://i.pravatar.cc/150?u=nice'
  },
  {
    id: 'mock-osmar',
    display_name: 'Osmar Teixeira',
    credits: 0,
    phone: '',
    taxId: '',
    acesso_prof_usuario: 1,
    avatar_url: 'https://i.pravatar.cc/150?u=osmar'
  }
];

export const COST_PUBLIC = 10;
export const COST_PRIVATE = 50;

export const INITIAL_DATABASE: PhotoItem[] = [
  {
    id: 'p-001',
    title: 'Cyberpunk Vertical',
    thumbnail: 'https://picsum.photos/seed/cyber/400/711',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-at-night-40244-large.mp4',
    author: 'IA_Artist',
    ownerId: 'system',
    isPublic: true,
    creditsCommon: 10,
    creditsExclusive: 50,
    isExclusiveSold: false,
    createdAt: Date.now()
  }
];
