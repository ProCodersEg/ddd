public class AdApiClient {
    private static final String BASE_URL = "https://oxhcswfkvtxfpiilaiuo.supabase.co/rest/v1/";
    private static final String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aGNzd2ZrdnR4ZnBpaWxhaXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNTA2MzEsImV4cCI6MjA1MjYyNjYzMX0.xFTBbkLDuW1AjLIpXjJr8R1zq1g10NftsJzXOEYzsDE";
    private final OkHttpClient client;
    private final Context context;

    public AdApiClient(Context context) {
        this.context = context;
        this.client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();
    }

    private String getApiKey() {
        return API_KEY;
    }

    public void fetchInterstitialAds(AdCallback callback) {
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?type=eq.interstitial&status=eq.active&select=*,clicks,max_clicks")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                callback.onError(e.getMessage());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    String responseBody = response.body() != null ? response.body().string() : null;
                    if (responseBody != null) {
                        try {
                            JSONArray jsonArray = new JSONArray(responseBody);
                            JSONArray filteredAds = new JSONArray();
                            
                            // Filter out ads that have reached their click limits
                            for (int i = 0; i < jsonArray.length(); i++) {
                                JSONObject ad = jsonArray.getJSONObject(i);
                                int clicks = ad.optInt("clicks", 0);
                                Integer maxClicks = ad.isNull("max_clicks") ? null : ad.getInt("max_clicks");
                                
                                if (maxClicks == null || clicks < maxClicks) {
                                    filteredAds.put(ad);
                                }
                            }
                            
                            callback.onSuccess(filteredAds.toString());
                        } catch (JSONException e) {
                            Log.e("AdApiClient", "Error parsing JSON response", e);
                            callback.onError("Error parsing response");
                        }
                    } else {
                        callback.onError("Empty response body");
                    }
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    Log.e("AdApiClient", "Error fetching interstitial ads: " + response.code() + " - " + errorBody);
                    callback.onError("Error: " + response.code());
                }
            }
        });
    }

    public void recordAdClick(String adId, int currentClicks) {
        if (adId == null || adId.isEmpty()) {
            Log.e("AdApiClient", "Invalid ad ID provided");
            return;
        }

        // First, verify current clicks and status in database
        Request getRequest = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId + "&select=clicks,status,max_clicks")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .get()
                .build();

        client.newCall(getRequest).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to get current clicks", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        JSONArray jsonArray = new JSONArray(responseBody);
                        if (jsonArray.length() > 0) {
                            JSONObject ad = jsonArray.getJSONObject(0);
                            String status = ad.getString("status");
                            int dbClicks = ad.getInt("clicks");
                            Integer maxClicks = ad.isNull("max_clicks") ? null : ad.getInt("max_clicks");
                            
                            // Only increment clicks if ad is still active and hasn't reached max clicks
                            if ("active".equals(status) && (maxClicks == null || dbClicks < maxClicks)) {
                                incrementClickCount(adId, dbClicks, maxClicks);
                            } else {
                                Log.d("AdApiClient", "Ad is not active or has reached max clicks, skipping click increment");
                            }
                        }
                    }
                } catch (JSONException e) {
                    Log.e("AdApiClient", "Error parsing JSON response", e);
                } finally {
                    response.close();
                }
            }
        });
    }

    private void incrementClickCount(String adId, int currentClicks, Integer maxClicks) {
        // Use RPC call to increment clicks
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        String rpcUrl = BASE_URL + "rpc/increment_ad_clicks";
        
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("ad_id", adId);
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        RequestBody body = RequestBody.create(mediaType, jsonBody.toString());
        
        Request request = new Request.Builder()
                .url(rpcUrl)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to increment click count", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                try {
                    if (response.isSuccessful()) {
                        // Check if we need to pause the ad after incrementing
                        if (maxClicks != null && currentClicks + 1 >= maxClicks) {
                            pauseAd(adId);
                        }
                    } else {
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        Log.e("AdApiClient", "Error incrementing clicks: " + response.code() + ", " + errorBody);
                    }
                } catch (IOException e) {
                    Log.e("AdApiClient", "Error reading response", e);
                } finally {
                    if (response.body() != null) {
                        response.body().close();
                    }
                }
            }
        });
    }

    private void pauseAd(String adId) {
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("status", "paused");
            jsonBody.put("pause_reason", "limits");
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating pause JSON body", e);
            return;
        }

        RequestBody body = RequestBody.create(mediaType, jsonBody.toString());
        
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .patch(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to pause ad", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (!response.isSuccessful()) {
                    Log.e("AdApiClient", "Error pausing ad: " + response.code());
                } else {
                    Log.d("AdApiClient", "Successfully paused ad: " + adId);
                }
                response.close();
            }
        });
    }
}