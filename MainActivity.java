public class MainActivity extends AppCompatActivity {
    private BannerAdView bannerAdView;
    private AdRotationManager adRotationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        bannerAdView = findViewById(R.id.banner_ad_view);
        adRotationManager = new AdRotationManager(bannerAdView, this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        adRotationManager.pause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        adRotationManager.resume();
    }
}