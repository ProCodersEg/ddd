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

    public void fetchBannerAds(AdCallback callback) {
        // Modified query to only fetch active ads
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?type=eq.banner&status=eq.active")
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
                    callback.onSuccess(responseBody);
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    Log.e("AdApiClient", "Error fetching ads: " + response.code() + " - " + errorBody);
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

        // First, verify current clicks in database
        Request getRequest = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId + "&select=clicks,status")
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
                            
                            // Only increment clicks if ad is still active
                            if ("active".equals(status)) {
                                int dbClicks = ad.getInt("clicks");
                                Log.d("AdApiClient", "Current clicks in DB: " + dbClicks);
                                incrementClickCount(adId, dbClicks);
                            } else {
                                Log.d("AdApiClient", "Ad is not active, skipping click increment");
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

    private void incrementClickCount(String adId, int currentClicks) {
        // Use RPC call to increment clicks
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        String rpcUrl = "https://oxhcswfkvtxfpiilaiuo.supabase.co/rest/v1/rpc/increment_ad_clicks";
        
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
                .post(body)  // RPC calls use POST
                .build();

        Log.d("AdApiClient", "Sending RPC request to increment clicks for ad: " + adId);

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to increment click count", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                try {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        Log.e("AdApiClient", "Error incrementing clicks: " + response.code() + ", " + errorBody);
                    } else {
                        Log.d("AdApiClient", "Successfully incremented click count for ad: " + adId + 
                              " - Status code: " + response.code());
                        
                        // Verify the update
                        verifyClickUpdate(adId);
                    }
                } catch (IOException e) {
                    Log.e("AdApiClient", "Error reading response", e);
                } finally {
                    response.close();
                }
            }
        });
    }

    private void verifyClickUpdate(String adId) {
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId + "&select=clicks")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .get()
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to verify click update", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String responseBody = response.body().string();
                    Log.d("AdApiClient", "Verification response: " + responseBody);
                }
                response.close();
            }
        });
    }
}