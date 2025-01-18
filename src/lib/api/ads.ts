import { supabase } from '../supabase';
import { Ad } from '@/types/ads';

// Fetch active banner ads
export async function fetchActiveBannerAds() {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('type', 'banner')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching banner ads:', error);
    throw error;
  }
  return data as Ad[];
}

// Fetch active interstitial ads
export async function fetchActiveInterstitialAds() {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('type', 'interstitial')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interstitial ads:', error);
    throw error;
  }
  return data as Ad[];
}

// Record ad click using RPC
export async function recordAdClick(adId: string) {
  const { error } = await supabase
    .rpc('increment_ad_clicks', { ad_id: adId });
  
  if (error) {
    console.error('Error recording click:', error);
    throw error;
  }
}

// Record ad impression using RPC
export async function recordAdImpression(adId: string) {
  const { error } = await supabase
    .rpc('increment_ad_impressions', { ad_id: adId });
  
  if (error) {
    console.error('Error recording impression:', error);
    throw error;
  }
}