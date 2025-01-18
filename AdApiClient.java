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

    public void recordAdClick(String adId, int clicks) {
        if (adId == null || adId.isEmpty()) {
            Log.e("AdApiClient", "Invalid ad ID provided");
            return;
        }

        JSONObject jsonBody = new JSONObject();
        try {
            // Use increment operator
            jsonBody.put("clicks", "clicks + 1");
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(mediaType, jsonBody.toString());

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to record click", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                try {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        Log.e("AdApiClient", "Error recording click: " + response.code() + ", " + errorBody);
                    } else {
                        Log.d("AdApiClient", "Successfully recorded click for ad: " + adId + " - Status code: " + response.code());
                    }
                } catch (IOException e) {
                    Log.e("AdApiClient", "Error reading response", e);
                } finally {
                    response.close();
                }
            }
        });
    }

    public void recordAdImpression(String adId, int impressions) {
        if (adId == null || adId.isEmpty()) {
            Log.e("AdApiClient", "Invalid ad ID provided");
            return;
        }

        JSONObject jsonBody = new JSONObject();
        try {
            // Use increment operator
            jsonBody.put("impressions", "impressions + 1");
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(mediaType, jsonBody.toString());

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to record impression", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                try {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        Log.e("AdApiClient", "Error recording impression: " + response.code() + ", " + errorBody);
                    } else {
                        Log.d("AdApiClient", "Successfully recorded impression for ad: " + adId + " - Status code: " + response.code());
                    }
                } catch (IOException e) {
                    Log.e("AdApiClient", "Error reading response", e);
                } finally {
                    response.close();
                }
            }
        });
    }
}