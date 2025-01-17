import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Ad } from "@/types/ads"

export default function Index() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    activeBannerAds: 0,
    pausedBannerAds: 0,
    activeInterstitialAds: 0,
    pausedInterstitialAds: 0,
  })

  const { data: ads, isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
      
      if (error) {
        toast({
          title: "Error fetching ads",
          description: error.message,
          variant: "destructive",
        })
        return []
      }
      return data as Ad[]
    },
  })

  useEffect(() => {
    if (ads) {
      const newStats = {
        activeBannerAds: ads.filter(ad => ad.type === 'banner' && ad.status === 'active').length,
        pausedBannerAds: ads.filter(ad => ad.type === 'banner' && ad.status === 'paused').length,
        activeInterstitialAds: ads.filter(ad => ad.type === 'interstitial' && ad.status === 'active').length,
        pausedInterstitialAds: ads.filter(ad => ad.type === 'interstitial' && ad.status === 'paused').length,
      }
      setStats(newStats)
    }
  }, [ads])

  const chartData = [
    {
      name: 'Banner Ads',
      active: stats.activeBannerAds,
      paused: stats.pausedBannerAds,
    },
    {
      name: 'Interstitial Ads',
      active: stats.activeInterstitialAds,
      paused: stats.pausedInterstitialAds,
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Banner Ads</h2>
          <div className="space-y-2">
            <p>Active: {stats.activeBannerAds}</p>
            <p>Paused: {stats.pausedBannerAds}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Interstitial Ads</h2>
          <div className="space-y-2">
            <p>Active: {stats.activeInterstitialAds}</p>
            <p>Paused: {stats.pausedInterstitialAds}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Ad Status Overview</h2>
        <div className="h-[400px]">
          <ChartContainer
            config={{
              active: {
                theme: {
                  light: "#2563eb",
                  dark: "#60a5fa",
                },
              },
              paused: {
                theme: {
                  light: "#4b5563",
                  dark: "#9ca3af",
                },
              },
            }}
          >
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="active" name="Active" stackId="a" fill="var(--color-active)" />
                <Bar dataKey="paused" name="Paused" stackId="a" fill="var(--color-paused)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}