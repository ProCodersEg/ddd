export type AdType = 'banner' | 'interstitial';

export interface Ad {
  id: string;
  type: AdType;
  title?: string;
  description?: string;
  image_url: string;
  redirect_url: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused';
  created_at: string;
  clicks: number;
  impressions: number;
  max_clicks?: number;
  max_impressions?: number;
  target_audience?: string;
  budget?: number;
  frequency_cap?: number;
}