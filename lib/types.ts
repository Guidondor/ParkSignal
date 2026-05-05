export type SpotType = 'calle' | 'playa' | 'cochera' | 'zona_azul' | 'otro';
export type SpotStatus = 'available' | 'claimed' | 'expired' | 'disputed';
export type ReputationEventType =
  | 'spot_reported'
  | 'spot_confirmed'
  | 'spot_disputed'
  | 'spot_claimed';

export interface UserProfile {
  id: string;
  username: string;
  reputation_score: number;
  total_spots_reported: number;
  total_spots_confirmed: number;
  push_token: string | null;
  notifications_enabled: boolean;
  gps_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Spot {
  id: string;
  reporter_id: string;
  claimer_id: string | null;
  lat: number;
  lng: number;
  address: string | null;
  spot_type: SpotType;
  status: SpotStatus;
  reported_at: string;
  claimed_at: string | null;
  expires_at: string;
  confirmations: number;
  disputes: number;
  leaving_soon_at?: string | null;
}

export interface ReputationEvent {
  id: string;
  user_id: string;
  spot_id: string;
  event_type: ReputationEventType;
  delta: number;
  created_at: string;
}

export interface NewSpotPayload {
  lat: number;
  lng: number;
  spot_type: SpotType;
  reporter_id: string;
}

export interface ClaimSpotResult {
  success: boolean;
  message?: string;
}
