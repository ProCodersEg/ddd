public class BannerAdView extends ConstraintLayout {
    private ImageView adImage;
    private TextView titleText;
    private TextView descriptionText;

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
                    .error(R.drawable.placeholder_image) // Make sure you have a placeholder image
                    .into(adImage);
        } else {
            adImage.setImageResource(R.drawable.placeholder_image);
        }

        setOnClickListener(v -> {
            if (ad.getRedirectUrl() != null) {
                try {
                    // Record click
                    new AdApiClient().recordAdClick(ad.getId());

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