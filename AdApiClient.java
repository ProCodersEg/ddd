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
                .url(BASE_URL + "ads?id=eq." + adId + "&select=clicks")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
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
                            int dbClicks = ad.getInt("clicks");
                            updateClickCount(adId, dbClicks);
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

    private void updateClickCount(String adId, int currentClicks) {
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("clicks", currentClicks + 1);
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(mediaType, jsonBody.toString());

        String url = BASE_URL + "ads?id=eq." + adId;
        Log.d("AdApiClient", "Sending PATCH request to: " + url + " with clicks: " + (currentClicks + 1));

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .patch(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to update click count", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                try {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        Log.e("AdApiClient", "Error updating clicks: " + response.code() + ", " + errorBody);
                    } else {
                        Log.d("AdApiClient", "Successfully updated click count for ad: " + adId + 
                              " - Status code: " + response.code() + 
                              " - New click count: " + (currentClicks + 1));
                        
                        // Verify the update
                        verifyClickUpdate(adId, currentClicks + 1);
                    }
                } catch (IOException e) {
                    Log.e("AdApiClient", "Error reading response", e);
                } finally {
                    response.close();
                }
            }
        });
    }

    private void verifyClickUpdate(String adId, int expectedClicks) {
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId + "&select=clicks")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
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