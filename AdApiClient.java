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
        try {
            ApplicationInfo ai = context.getPackageManager()
                .getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            Bundle bundle = ai.metaData;
            String apiKey = bundle.getString("supabase_api_key", API_KEY);
            return apiKey != null ? apiKey : API_KEY;
        } catch (PackageManager.NameNotFoundException | NullPointerException e) {
            Log.w("AdApiClient", "Failed to load API key from metadata, using default", e);
            return API_KEY;
        }
    }

    public void fetchBannerAds(AdCallback callback) {
        Request request = new Request.Builder()
                .url(BASE_URL + "ads?type=eq.banner&status=eq.active")
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
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
                    callback.onError("Error: " + response.code());
                }
            }
        });
    }

    public void recordAdClick(String adId, int clicks) {
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("id", adId);
            jsonBody.put("clicks", clicks);
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(RequestBody.create(
                        MediaType.parse("application/json"),
                        jsonBody.toString()
                ))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to record click", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (!response.isSuccessful()) {
                    Log.e("AdApiClient", "Error recording click: " + response.code());
                }
                response.close();
            }
        });
    }

    public void recordAdImpression(String adId, int impressions) {
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("id", adId);
            jsonBody.put("impressions", impressions);
        } catch (JSONException e) {
            Log.e("AdApiClient", "Error creating JSON body", e);
            return;
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", getApiKey())
                .addHeader("Authorization", "Bearer " + getApiKey())
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(RequestBody.create(
                        MediaType.parse("application/json"),
                        jsonBody.toString()
                ))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, IOException e) {
                Log.e("AdApiClient", "Failed to record impression", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (!response.isSuccessful()) {
                    Log.e("AdApiClient", "Error recording impression: " + response.code());
                }
                response.close();
            }
        });
    }
}