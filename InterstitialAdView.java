public class InterstitialAdView extends ConstraintLayout {
    private ImageView adImage;
    private TextView titleText;
    private TextView descriptionText;
    private ImageButton closeButton;
    private AdApiClient adApiClient;
    private Ad currentAd;
    private OnDismissListener onDismissListener;

    public interface OnDismissListener {
        void onDismiss();
    }

    public InterstitialAdView(Context context) {
        super(context);
        init(context);
    }

    public InterstitialAdView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.interstitial_ad_layout, this);
        adImage = findViewById(R.id.ad_image);
        titleText = findViewById(R.id.ad_title);
        descriptionText = findViewById(R.id.ad_description);
        closeButton = findViewById(R.id.close_button);
        adApiClient = new AdApiClient(context);

        closeButton.setOnClickListener(v -> dismiss());
        setOnClickListener(v -> handleAdClick());
    }

    public void setAd(Ad ad) {
        if (ad == null) {
            Log.e("InterstitialAdView", "Attempted to set null ad");
            dismiss();
            return;
        }

        this.currentAd = ad;
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
    }

    private void handleAdClick() {
        if (currentAd != null && currentAd.getRedirectUrl() != null) {
            try {
                // Record click
                adApiClient.recordAdClick(currentAd.getId(), currentAd.getClicks());

                // Open URL
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(currentAd.getRedirectUrl()));
                getContext().startActivity(intent);
                
                // Dismiss after click
                dismiss();
            } catch (ActivityNotFoundException e) {
                Log.e("InterstitialAdView", "Could not open URL: " + currentAd.getRedirectUrl(), e);
            }
        }
    }

    public void setOnDismissListener(OnDismissListener listener) {
        this.onDismissListener = listener;
    }

    private void dismiss() {
        if (onDismissListener != null) {
            onDismissListener.onDismiss();
        }
    }

    public Ad getCurrentAd() {
        return currentAd;
    }
}