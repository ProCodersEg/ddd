public class BannerAdView extends ConstraintLayout {
    private ImageView adImage;
    private TextView titleText;
    private TextView descriptionText;
    private AdApiClient adApiClient;

    public BannerAdView(Context context) {
        super(context);
        init(context);
    }

    public BannerAdView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.banner_ad_layout, this);
        adImage = findViewById(R.id.ad_image);
        titleText = findViewById(R.id.ad_title);
        descriptionText = findViewById(R.id.ad_description);
        adApiClient = new AdApiClient(context);
    }

    public void setAd(Ad ad) {
        if (ad == null) {
            Log.e("BannerAdView", "Attempted to set null ad");
            setVisibility(GONE);
            return;
        }

        titleText.setText(ad.getTitle() != null ? ad.getTitle() : "");
        descriptionText.setText(ad.getDescription() != null ? ad.getDescription() : "");

        if (ad.getImageUrl() != null) {
            Glide.with(getContext())
                    .load(ad.getImageUrl())
                    .error(R.drawable.ic_launcher_background)
                    .into(adImage);
        } else {
            adImage.setImageResource(R.drawable.ic_launcher_background);
        }

        setOnClickListener(v -> {
            if (ad.getRedirectUrl() != null) {
                try {
                    // Update local click count
                    ad.setClicks(ad.getClicks() + 1);
                    
                    // Record click with updated count
                    adApiClient.recordAdClick(ad.getId(), ad.getClicks());

                    // Open URL
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setData(Uri.parse(ad.getRedirectUrl()));
                    getContext().startActivity(intent);
                } catch (ActivityNotFoundException e) {
                    Log.e("BannerAdView", "Could not open URL: " + ad.getRedirectUrl(), e);
                }
            }
        });
    }
}