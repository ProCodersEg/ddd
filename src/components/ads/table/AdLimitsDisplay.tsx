import { Ad } from "@/types/ads";

interface AdLimitsDisplayProps {
  ad: Ad;
}

export function AdLimitsDisplay({ ad }: AdLimitsDisplayProps) {
  const clicksLimit = ad.max_clicks ? `${ad.clicks}/${ad.max_clicks}` : `${ad.clicks}/∞`;
  const impressionsLimit = ad.max_impressions ? `${ad.impressions}/${ad.max_impressions}` : `${ad.impressions}/∞`;
  
  const isClicksLimitReached = ad.max_clicks && ad.clicks >= ad.max_clicks;
  const isImpressionsLimitReached = ad.max_impressions && ad.impressions >= ad.max_impressions;
  
  return (
    <div className="text-sm">
      <p className={isClicksLimitReached ? "text-red-500 font-medium" : ""}>
        Clicks: {clicksLimit}
      </p>
      <p className={isImpressionsLimitReached ? "text-red-500 font-medium" : ""}>
        Impressions: {impressionsLimit}
      </p>
    </div>
  );
}