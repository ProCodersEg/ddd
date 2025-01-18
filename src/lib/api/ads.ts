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

  if (error) throw error;
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

  if (error) throw error;
  return data as Ad[];
}

// Record ad click
export async function recordAdClick(adId: string) {
  // First, update the clicks count in the ads table
  const { error: updateError } = await supabase
    .from('ads')
    .update({ clicks: supabase.raw('clicks + 1') })
    .eq('id', adId);
  
  if (updateError) {
    console.error('Error updating clicks:', updateError);
    throw updateError;
  }

  // Then call the RPC function for any additional processing
  const { error: rpcError } = await supabase
    .rpc('increment_ad_clicks', { ad_id: adId });
  
  if (rpcError) {
    console.error('Error in RPC call:', rpcError);
    throw rpcError;
  }
}

// Record ad impression
export async function recordAdImpression(adId: string) {
  // First, update the impressions count in the ads table
  const { error: updateError } = await supabase
    .from('ads')
    .update({ impressions: supabase.raw('impressions + 1') })
    .eq('id', adId);
  
  if (updateError) {
    console.error('Error updating impressions:', updateError);
    throw updateError;
  }

  // Then call the RPC function for any additional processing
  const { error: rpcError } = await supabase
    .rpc('increment_ad_impressions', { ad_id: adId });
  
  if (rpcError) {
    console.error('Error in RPC call:', rpcError);
    throw rpcError;
  }
}