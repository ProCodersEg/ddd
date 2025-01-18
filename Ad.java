public class Ad {
    private String id;
    private String title;
    private String description;
    private String imageUrl;
    private String redirectUrl;
    private String status;
    private int clicks;
    private Integer maxClicks;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public int getClicks() { return clicks; }
    public void setClicks(int clicks) { this.clicks = clicks; }
    
    public Integer getMaxClicks() { return maxClicks; }
    public void setMaxClicks(Integer maxClicks) { this.maxClicks = maxClicks; }
}