import { supabase } from '../supabase';
import { Ad } from '@/types/ads';

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

export async function recordAdClick(adId: string) {
  const { data: ad, error: fetchError } = await supabase
    .from('ads')
    .select('clicks, max_clicks, status, title, image_url')
    .eq('id', adId)
    .single();

  if (fetchError) {
    console.error('Error fetching ad:', fetchError);
    throw fetchError;
  }

  if (ad.status !== 'active') {
    return;
  }

  // Use the RPC function to increment clicks
  const { error } = await supabase
    .rpc('increment_ad_clicks', { ad_id: adId });
  
  if (error) {
    console.error('Error recording click:', error);
    throw error;
  }

  // Check if limits are reached and pause if necessary
  if (ad.max_clicks && ad.clicks + 1 >= ad.max_clicks) {
    const { error: updateError } = await supabase
      .from('ads')
      .update({ 
        status: 'paused',
        pause_reason: 'limits'
      })
      .eq('id', adId);

    if (updateError) {
      console.error('Error updating ad status:', updateError);
      throw updateError;
    }
  }
}

export async function checkAndUpdateAdStatus(ad: Ad) {
  if (!ad.max_clicks) return;

  const shouldPause = ad.max_clicks && ad.clicks >= ad.max_clicks;

  if (shouldPause && ad.status === 'active') {
    const { error } = await supabase
      .from('ads')
      .update({ 
        status: 'paused',
        pause_reason: 'limits'
      })
      .eq('id', ad.id);

    if (error) {
      console.error('Error updating ad status:', error);
      throw error;
    }
  }
}