import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import okhttp3.*;

public class AdApiClient {
    private static final String TAG = "AdApiClient";
    private static final String BASE_URL = "https://your-supabase-url.supabase.co/rest/v1/";
    private final OkHttpClient client;
    private final Context context;
    private String apiKey;

    public AdApiClient(Context context) {
        this.context = context;
        this.client = new OkHttpClient();
        loadApiKey();
    }

    private void loadApiKey() {
        try {
            ApplicationInfo ai = context.getPackageManager()
                .getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            Bundle bundle = ai.metaData;
            apiKey = bundle.getString("com.me.testelements.API_KEY");
            if (apiKey == null) {
                Log.e(TAG, "API key not found in metadata");
            }
        } catch (PackageManager.NameNotFoundException e) {
            Log.e(TAG, "Failed to load API key from metadata", e);
        }
    }

    public void fetchBannerAds(AdCallback callback) {
        if (apiKey == null) {
            callback.onError("API key not initialized");
            return;
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "ads")
                .addHeader("apikey", apiKey)
                .addHeader("Authorization", "Bearer " + apiKey)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    callback.onError("Server error: " + response.code());
                    return;
                }
                
                String responseData = response.body().string();
                callback.onSuccess(responseData);
            }
        });
    }

    public void recordAdClick(String adId, int clicks) {
        if (apiKey == null) {
            Log.e(TAG, "API key not initialized");
            return;
        }

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("id", adId);
            jsonBody.put("clicks", clicks);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating JSON body", e);
            return;
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", apiKey)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(RequestBody.create(
                        MediaType.parse("application/json"),
                        jsonBody.toString()
                ))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Error recording click", e);
            }

            @Override
            public void onResponse(Call call, Response response) {
                if (!response.isSuccessful()) {
                    Log.e(TAG, "Error recording click: " + response.code());
                }
            }
        });
    }

    public void recordAdImpression(String adId, int impressions) {
        if (apiKey == null) {
            Log.e(TAG, "API key not initialized");
            return;
        }

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("id", adId);
            jsonBody.put("impressions", impressions);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating JSON body", e);
            return;
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "ads?id=eq." + adId)
                .addHeader("apikey", apiKey)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .patch(RequestBody.create(
                        MediaType.parse("application/json"),
                        jsonBody.toString()
                ))
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Error recording impression", e);
            }

            @Override
            public void onResponse(Call call, Response response) {
                if (!response.isSuccessful()) {
                    Log.e(TAG, "Error recording impression: " + response.code());
                }
            }
        });
    }
}