import { Ad } from "@/types/ads";

interface AdLimitsDisplayProps {
  ad: Ad;
}

export function AdLimitsDisplay({ ad }: AdLimitsDisplayProps) {
  const clicksLimit = ad.max_clicks ? `${ad.clicks}/${ad.max_clicks}` : `${ad.clicks}/∞`;
  const isClicksLimitReached = ad.max_clicks && ad.clicks >= ad.max_clicks;
  
  return (
    <div className="text-sm">
      <p className={isClicksLimitReached ? "text-red-500 font-medium" : ""}>
        Clicks: {clicksLimit}
      </p>
    </div>
  );
}