public class AdRotationManager {
    private static final int MIN_DISPLAY_TIME = 5000; // 5 seconds
    private static final int MAX_DISPLAY_TIME = 15000; // 15 seconds
    private List<Ad> adsList = new ArrayList<>();
    private Random random = new Random();
    private Handler handler = new Handler(Looper.getMainLooper());
    private int currentAdIndex = 0;
    private BannerAdView bannerAdView;
    private AdApiClient adApiClient;
    private Runnable rotationRunnable;
    private boolean isPaused = false;

    public AdRotationManager(BannerAdView bannerAdView) {
        if (bannerAdView == null) {
            throw new IllegalArgumentException("BannerAdView cannot be null");
        }
        this.bannerAdView = bannerAdView;
        this.adApiClient = new AdApiClient();
        loadAds();
    }

    private void loadAds() {
        adApiClient.fetchBannerAds(new AdCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    if (response == null) {
                        Log.e("AdRotationManager", "Received null response");
                        return;
                    }

                    JSONArray jsonArray = new JSONArray(response);
                    adsList.clear();
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject adJson = jsonArray.getJSONObject(i);
                        if ("active".equals(adJson.optString("status"))) {
                            Ad ad = new Ad();
                            ad.setId(adJson.getString("id"));
                            ad.setTitle(adJson.optString("title", ""));
                            ad.setDescription(adJson.optString("description", ""));
                            ad.setImageUrl(adJson.getString("image_url"));
                            ad.setRedirectUrl(adJson.getString("redirect_url"));
                            ad.setStatus(adJson.getString("status"));
                            ad.setClicks(adJson.optInt("clicks", 0));
                            ad.setImpressions(adJson.optInt("impressions", 0));
                            ad.setMaxClicks(adJson.has("max_clicks") ? adJson.getInt("max_clicks") : null);
                            ad.setMaxImpressions(adJson.has("max_impressions") ? adJson.getInt("max_impressions") : null);
                            
                            // Check if ad should be active based on limits
                            if (shouldBeActive(ad)) {
                                adsList.add(ad);
                            }
                        }
                    }
                    
                    handler.post(() -> {
                        if (!adsList.isEmpty() && !isPaused) {
                            startRotation();
                        } else {
                            Log.d("AdRotationManager", "No active ads available");
                            bannerAdView.setVisibility(View.GONE);
                        }
                    });
                } catch (JSONException e) {
                    Log.e("AdRotationManager", "Error parsing JSON", e);
                }
            }

            @Override
            public void onError(String error) {
                Log.e("AdRotationManager", "Error loading ads: " + error);
                handler.post(() -> bannerAdView.setVisibility(View.GONE));
            }
        });
    }

    private boolean shouldBeActive(Ad ad) {
        if (ad == null) return false;
        
        boolean withinClickLimit = ad.getMaxClicks() == null || ad.getClicks() < ad.getMaxClicks();
        boolean withinImpressionLimit = ad.getMaxImpressions() == null || ad.getImpressions() < ad.getMaxImpressions();
        
        return withinClickLimit && withinImpressionLimit;
    }

    private void startRotation() {
        if (rotationRunnable != null) {
            handler.removeCallbacks(rotationRunnable);
        }

        rotationRunnable = new Runnable() {
            @Override
            public void run() {
                showNextAd();
                if (adsList.size() <= 1) {
                    loadAds();
                }
                long nextDisplayTime = calculateNextDisplayTime();
                handler.postDelayed(this, nextDisplayTime);
            }
        };

        showNextAd();
        handler.postDelayed(rotationRunnable, calculateNextDisplayTime());
    }

    private long calculateNextDisplayTime() {
        return random.nextInt(MAX_DISPLAY_TIME - MIN_DISPLAY_TIME) + MIN_DISPLAY_TIME;
    }

    private void showNextAd() {
        if (adsList.isEmpty()) {
            loadAds();
            return;
        }

        currentAdIndex = (currentAdIndex + 1) % adsList.size();
        Ad currentAd = adsList.get(currentAdIndex);
        
        // Update local impression count
        currentAd.setImpressions(currentAd.getImpressions() + 1);
        
        // Check if ad should still be active after this impression
        if (!shouldBeActive(currentAd)) {
            adsList.remove(currentAdIndex);
            if (adsList.isEmpty()) {
                handler.post(() -> bannerAdView.setVisibility(View.GONE));
                loadAds();
                return;
            }
            currentAdIndex = currentAdIndex % adsList.size();
            currentAd = adsList.get(currentAdIndex);
        }

        // Record impression
        adApiClient.recordAdImpression(currentAd.getId());

        final Ad finalAd = currentAd;
        handler.post(() -> {
            bannerAdView.setVisibility(View.VISIBLE);
            bannerAdView.setAd(finalAd);
            
            bannerAdView.setOnClickListener(v -> {
                // Update local click count
                finalAd.setClicks(finalAd.getClicks() + 1);
                
                // Record click
                adApiClient.recordAdClick(finalAd.getId());
                
                // Check if ad should be removed after this click
                if (!shouldBeActive(finalAd)) {
                    adsList.remove(finalAd);
                    if (adsList.isEmpty()) {
                        bannerAdView.setVisibility(View.GONE);
                        loadAds();
                    }
                }
                
                // Open redirect URL
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(finalAd.getRedirectUrl()));
                    bannerAdView.getContext().startActivity(intent);
                } catch (ActivityNotFoundException e) {
                    Log.e("AdRotationManager", "Could not open URL: " + finalAd.getRedirectUrl(), e);
                }
            });
        });
    }

    public void pause() {
        isPaused = true;
        if (rotationRunnable != null) {
            handler.removeCallbacks(rotationRunnable);
        }
    }

    public void resume() {
        isPaused = false;
        if (!adsList.isEmpty()) {
            startRotation();
        } else {
            loadAds();
        }
    }

    @Deprecated
    public void onPause() {
        pause();
    }

    @Deprecated
    public void onResume() {
        resume();
    }
}