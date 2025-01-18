public class InterstitialAdManager {
    private final Context context;
    private final AdApiClient adApiClient;
    private List<Ad> adsList = new ArrayList<>();
    private boolean isLoading = false;

    public InterstitialAdManager(Context context) {
        this.context = context;
        this.adApiClient = new AdApiClient(context);
    }

    public void loadAds(final OnAdsLoadedListener listener) {
        if (isLoading) return;
        isLoading = true;

        adApiClient.fetchInterstitialAds(new AdCallback() {
            @Override
            public void onSuccess(String response) {
                try {
                    JSONArray jsonArray = new JSONArray(response);
                    List<Ad> newAdsList = new ArrayList<>();

                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject adJson = jsonArray.getJSONObject(i);
                        String status = adJson.optString("status", "");

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

                            if (shouldShowAd(ad)) {
                                newAdsList.add(ad);
                            }
                        }
                    }

                    new Handler(Looper.getMainLooper()).post(() -> {
                        adsList = newAdsList;
                        isLoading = false;
                        if (listener != null) {
                            listener.onAdsLoaded(!adsList.isEmpty());
                        }
                    });
                } catch (JSONException e) {
                    Log.e("InterstitialAdManager", "Error parsing JSON", e);
                    handleError(listener);
                }
            }

            @Override
            public void onError(String error) {
                Log.e("InterstitialAdManager", "Error loading ads: " + error);
                handleError(listener);
            }
        });
    }

    private void handleError(OnAdsLoadedListener listener) {
        new Handler(Looper.getMainLooper()).post(() -> {
            isLoading = false;
            if (listener != null) {
                listener.onAdsLoaded(false);
            }
        });
    }

    private boolean shouldShowAd(Ad ad) {
        return ad != null && 
               "active".equals(ad.getStatus()) && 
               (ad.getMaxClicks() == null || ad.getClicks() < ad.getMaxClicks());
    }

    public void showAd(Activity activity, OnAdDismissedListener dismissListener) {
        if (adsList.isEmpty()) {
            if (dismissListener != null) {
                dismissListener.onAdDismissed();
            }
            return;
        }

        // Select a random ad
        Ad selectedAd = adsList.get(new Random().nextInt(adsList.size()));

        // Create and show the interstitial ad view
        InterstitialAdView adView = new InterstitialAdView(activity);
        adView.setAd(selectedAd);
        adView.setOnDismissListener(() -> {
            // Remove the ad view from the window
            if (adView.getParent() != null) {
                ((ViewGroup) adView.getParent()).removeView(adView);
            }
            if (dismissListener != null) {
                dismissListener.onAdDismissed();
            }
        });

        // Add the ad view to the activity's root view
        ViewGroup rootView = activity.findViewById(android.R.id.content);
        rootView.addView(adView, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
    }

    public interface OnAdsLoadedListener {
        void onAdsLoaded(boolean available);
    }

    public interface OnAdDismissedListener {
        void onAdDismissed();
    }
}