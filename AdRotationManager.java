public class AdRotationManager {
    private static final int MIN_DISPLAY_TIME = 5000; // 5 seconds
    private static final int MAX_DISPLAY_TIME = 15000; // 15 seconds
    private static final int RELOAD_INTERVAL = 30000; // Reload ads every 30 seconds
    private static final int MAX_DAILY_IMPRESSIONS = 10;

    private final List<Ad> adsList = new ArrayList<>();
    private final Random random = new Random();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final BannerAdView bannerAdView;
    private final AdApiClient adApiClient;
    private Runnable rotationRunnable;
    private boolean isPaused = false;
    private Map<String, Integer> adImpressions = new HashMap<>();

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
                        handleNoAds();
                        return;
                    }

                    JSONArray jsonArray = new JSONArray(response);
                    List<Ad> newAdsList = new ArrayList<>();
                    
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject adJson = jsonArray.getJSONObject(i);
                        String status = adJson.optString("status", "");
                        
                        // Only process active ads
                        if ("active".equals(status)) {
                            Ad ad = new Ad();
                            ad.setId(adJson.getString("id"));
                            ad.setTitle(adJson.optString("title", ""));
                            ad.setDescription(adJson.optString("description", ""));
                            ad.setImageUrl(adJson.getString("image_url"));
                            ad.setRedirectUrl(adJson.getString("redirect_url"));
                            ad.setStatus(status);
                            ad.setClicks(adJson.optInt("clicks", 0));
                            
                            if (!adJson.isNull("max_clicks")) {
                                ad.setMaxClicks(adJson.getInt("max_clicks"));
                            }
                            
                            if (shouldBeActive(ad)) {
                                newAdsList.add(ad);
                            }
                        }
                    }

                    handler.post(() -> {
                        updateAdsList(newAdsList);
                    });
                } catch (JSONException e) {
                    Log.e("AdRotationManager", "Error parsing JSON", e);
                    handleNoAds();
                }
            }

            @Override
            public void onError(String error) {
                Log.e("AdRotationManager", "Error loading ads: " + error);
                handleNoAds();
            }
        });
    }

    private void updateAdsList(List<Ad> newAdsList) {
        boolean wasEmpty = adsList.isEmpty();
        adsList.clear();
        adsList.addAll(newAdsList);
        
        if (adsList.isEmpty()) {
            handleNoAds();
        } else if (wasEmpty || rotationRunnable == null) {
            // Start rotation only if we have ads and weren't rotating before
            if (!isPaused) {
                bannerAdView.setVisibility(View.VISIBLE);
                startRotation();
            }
        }
        
        // Log the current state for debugging
        Log.d("AdRotationManager", "Updated ads list. Count: " + adsList.size());
    }

    private void handleNoAds() {
        handler.post(() -> {
            bannerAdView.setVisibility(View.GONE);
            if (rotationRunnable != null) {
                handler.removeCallbacks(rotationRunnable);
                rotationRunnable = null;
            }
        });
    }

    private boolean shouldBeActive(Ad ad) {
        if (ad == null || !"active".equals(ad.getStatus())) {
            return false;
        }
        
        // Check click limits
        if (ad.getMaxClicks() != null && ad.getClicks() >= ad.getMaxClicks()) {
            return false;
        }
        
        // Check daily impression limits
        Integer impressions = adImpressions.get(ad.getId());
        return impressions == null || impressions < MAX_DAILY_IMPRESSIONS;
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
            handleNoAds();
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
            handleNoAds();
            return;
        }

        Ad selectedAd = selectNextAd();
        if (selectedAd == null) {
            handleNoAds();
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
        loadAds();
    }

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
