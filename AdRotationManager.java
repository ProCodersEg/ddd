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
        this.bannerAdView = bannerAdView;
        this.adApiClient = new AdApiClient();
        loadAds();
    }

    private void loadAds() {
        adApiClient.fetchBannerAds(new AdCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JSONArray jsonArray = new JSONArray(response);
                    adsList.clear(); // Clear existing ads before adding new ones
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject adJson = jsonArray.getJSONObject(i);
                        // Only add active ads
                        if ("active".equals(adJson.optString("status"))) {
                            Ad ad = new Ad();
                            ad.setId(adJson.getString("id"));
                            ad.setTitle(adJson.getString("title"));
                            ad.setDescription(adJson.getString("description"));
                            ad.setImageUrl(adJson.getString("image_url"));
                            ad.setRedirectUrl(adJson.getString("redirect_url"));
                            ad.setStatus(adJson.getString("status"));
                            adsList.add(ad);
                        }
                    }
                    if (!adsList.isEmpty() && !isPaused) {
                        startRotation();
                    } else {
                        // Handle case when no active ads are available
                        Log.d("AdRotationManager", "No active ads available");
                        bannerAdView.setVisibility(View.GONE);
                    }
                } catch (JSONException e) {
                    Log.e("AdRotationManager", "Error parsing JSON", e);
                }
            }

            @Override
            public void onError(String error) {
                Log.e("AdRotationManager", "Error loading ads: " + error);
            }
        });
    }

    private void startRotation() {
        if (rotationRunnable != null) {
            handler.removeCallbacks(rotationRunnable);
        }

        rotationRunnable = new Runnable() {
            @Override
            public void run() {
                showNextAd();
                // Reload ads periodically to get updated status
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
            loadAds(); // Reload ads if list is empty
            return;
        }

        // Get next ad using round-robin
        currentAdIndex = (currentAdIndex + 1) % adsList.size();
        Ad currentAd = adsList.get(currentAdIndex);

        // Record impression
        adApiClient.recordAdImpression(currentAd.getId());

        // Update UI on main thread
        handler.post(() -> {
            bannerAdView.setVisibility(View.VISIBLE);
            bannerAdView.setAd(currentAd);
            
            // Set click listener for the ad
            bannerAdView.setOnClickListener(v -> {
                adApiClient.recordAdClick(currentAd.getId());
                // Open redirect URL
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(currentAd.getRedirectUrl()));
                bannerAdView.getContext().startActivity(intent);
            });
        });
    }

    // Make these methods public so they can be called from Activity/Fragment
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

    // Deprecated methods - kept for backward compatibility
    @Deprecated
    public void onPause() {
        pause();
    }

    @Deprecated
    public void onResume() {
        resume();
    }
}