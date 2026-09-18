export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  account_id: string;
  avatar_url?: string;
  balance: number;
  currency: string;
  device_id: string;
  trusted_locations: string[];
}
