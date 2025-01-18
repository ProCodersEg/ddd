public class AdRotationManager {
    private static final int MIN_DISPLAY_TIME = 5000; // 5 seconds
    private static final int MAX_DISPLAY_TIME = 15000; // 15 seconds
    private final List<Ad> adsList = new ArrayList<>();
    private final Random random = new Random();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private int currentAdIndex = -1;
    private final BannerAdView bannerAdView;
    private final AdApiClient adApiClient;
    private Runnable rotationRunnable;
    private boolean isPaused = false;
    private Map<String, Integer> adImpressions = new HashMap<>();
    private static final int MAX_DAILY_IMPRESSIONS = 10;
    private static final int RELOAD_INTERVAL = 30000; // Reload ads every 30 seconds

    public AdRotationManager(BannerAdView bannerAdView, Context context) {
        if (bannerAdView == null) {
            throw new IllegalArgumentException("BannerAdView cannot be null");
        }
        this.bannerAdView = bannerAdView;
        this.adApiClient = new AdApiClient(context);
        loadAds();
        startPeriodicReload();
    }

    private void startPeriodicReload() {
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (!isPaused) {
                    loadAds();
                }
                handler.postDelayed(this, RELOAD_INTERVAL);
            }
        }, RELOAD_INTERVAL);
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
                    List<Ad> newAdsList = new ArrayList<>();
                    
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
                            
                            if (!adJson.isNull("max_clicks")) {
                                ad.setMaxClicks(adJson.getInt("max_clicks"));
                            } else {
                                ad.setMaxClicks(null);
                            }
                            
                            if (shouldBeActive(ad)) {
                                newAdsList.add(ad);
                            }
                        }
                    }

                    handler.post(() -> {
                        // Update ads list and handle visibility
                        adsList.clear();
                        adsList.addAll(newAdsList);
                        
                        if (!adsList.isEmpty() && !isPaused) {
                            bannerAdView.setVisibility(View.VISIBLE);
                            if (rotationRunnable == null) {
                                startRotation();
                            }
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
                handler.post(() -> {
                    if (adsList.isEmpty()) {
                        bannerAdView.setVisibility(View.GONE);
                    }
                    // Retry loading after a delay if there was an error
                    handler.postDelayed(() -> loadAds(), 5000);
                });
            }
        });
    }

    private boolean shouldBeActive(Ad ad) {
        if (ad == null) return false;
        
        // Check click limits
        if (ad.getMaxClicks() != null && ad.getClicks() >= ad.getMaxClicks()) {
            return false;
        }
        
        // Check daily impression limits
        Integer impressions = adImpressions.get(ad.getId());
        if (impressions != null && impressions >= MAX_DAILY_IMPRESSIONS) {
            return false;
        }
        
        return true;
    }

    private long calculateNextDisplayTime() {
        // Smart timing based on current hour
        Calendar calendar = Calendar.getInstance();
        int currentHour = calendar.get(Calendar.HOUR_OF_DAY);
        
        // Peak hours (8AM-8PM) - faster rotation
        if (currentHour >= 8 && currentHour <= 20) {
            return MIN_DISPLAY_TIME + random.nextInt(5000);
        }
        
        // Non-peak hours - slower rotation
        return MIN_DISPLAY_TIME + random.nextInt(MAX_DISPLAY_TIME - MIN_DISPLAY_TIME);
    }

    private Ad selectNextAd() {
        if (adsList.isEmpty()) return null;
        
        // Weight-based selection
        List<AdWeight> weightedAds = new ArrayList<>();
        double totalWeight = 0;
        
        for (Ad ad : adsList) {
            double weight = calculateAdWeight(ad);
            weightedAds.add(new AdWeight(ad, weight));
            totalWeight += weight;
        }
        
        double randomValue = random.nextDouble() * totalWeight;
        double currentSum = 0;
        
        for (AdWeight weighted : weightedAds) {
            currentSum += weighted.weight;
            if (randomValue <= currentSum) {
                return weighted.ad;
            }
        }
        
        return adsList.get(0);
    }

    private double calculateAdWeight(Ad ad) {
        double weight = 1.0;
        
        // Factor in click performance
        if (ad.getMaxClicks() != null) {
            double clickRatio = (double) ad.getClicks() / ad.getMaxClicks();
            weight *= (1.0 - clickRatio); // Lower weight for ads closer to max clicks
        }
        
        // Factor in impression count
        Integer impressions = adImpressions.get(ad.getId());
        if (impressions != null) {
            weight *= (1.0 - ((double) impressions / MAX_DAILY_IMPRESSIONS));
        }
        
        return Math.max(0.1, weight); // Ensure minimum weight of 0.1
    }

    private void startRotation() {
        if (rotationRunnable != null) {
            handler.removeCallbacks(rotationRunnable);
        }

        if (adsList.isEmpty()) {
            Log.d("AdRotationManager", "No ads available to start rotation");
            handler.post(() -> bannerAdView.setVisibility(View.GONE));
            loadAds(); // Try to load ads again
            return;
        }

        rotationRunnable = new Runnable() {
            @Override
            public void run() {
                showNextAd();
                long nextDisplayTime = calculateNextDisplayTime();
                handler.postDelayed(this, nextDisplayTime);
            }
        };

        showNextAd();
        handler.postDelayed(rotationRunnable, calculateNextDisplayTime());
    }

    private void showNextAd() {
        if (adsList.isEmpty()) {
            Log.d("AdRotationManager", "No ads available to show");
            handler.post(() -> bannerAdView.setVisibility(View.GONE));
            loadAds();
            return;
        }

        Ad selectedAd = selectNextAd();
        if (selectedAd == null) {
            Log.e("AdRotationManager", "Failed to select next ad");
            return;
        }

        // Update impressions
        String adId = selectedAd.getId();
        adImpressions.put(adId, adImpressions.getOrDefault(adId, 0) + 1);

        handler.post(() -> {
            if (!isPaused) {
                bannerAdView.setVisibility(View.VISIBLE);
                bannerAdView.setAd(selectedAd);
            }
        });
    }

    public void pause() {
        isPaused = true;
        if (rotationRunnable != null) {
            handler.removeCallbacks(rotationRunnable);
            rotationRunnable = null;
        }
        handler.post(() -> bannerAdView.setVisibility(View.GONE));
    }

    public void resume() {
        isPaused = false;
        loadAds(); // Reload ads when resuming
    }

    // Clean up resources
    public void destroy() {
        pause();
        handler.removeCallbacksAndMessages(null);
    }

    private static class AdWeight {
        Ad ad;
        double weight;
        
        AdWeight(Ad ad, double weight) {
            this.ad = ad;
            this.weight = weight;
        }
    }
}
