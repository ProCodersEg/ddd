export type AdType = 'banner' | 'interstitial';
export type AdStatus = 'active' | 'paused';
export type PauseReason = 'manual' | 'limits' | null;

export interface Ad {
  id: string;
  type: AdType;
  title?: string;
  description?: string;
  image_url: string;
  redirect_url: string;
  start_date: string;
  status: AdStatus;
  pause_reason?: PauseReason;
  created_at: string;
  clicks: number;
  impressions: number;
  max_clicks?: number;
  max_impressions?: number;
  target_audience?: string;
  frequency_cap?: number;
}