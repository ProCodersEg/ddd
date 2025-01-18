import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Ad } from "@/types/ads";
import { Activity, TrendingUp, Users } from "lucide-react";

export default function Index() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    activeBannerAds: 0,
    pausedBannerAds: 0,
    activeInterstitialAds: 0,
    pausedInterstitialAds: 0,
    totalClicks: 0,
  });

  const { data: ads, isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*');
      
      if (error) {
        toast({
          title: "Error fetching ads",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data as Ad[];
    },
  });

  useEffect(() => {
    if (ads) {
      const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      
      const newStats = {
        activeBannerAds: ads.filter(ad => ad.type === 'banner' && ad.status === 'active').length,
        pausedBannerAds: ads.filter(ad => ad.type === 'banner' && ad.status === 'paused').length,
        activeInterstitialAds: ads.filter(ad => ad.type === 'interstitial' && ad.status === 'active').length,
        pausedInterstitialAds: ads.filter(ad => ad.type === 'interstitial' && ad.status === 'paused').length,
        totalClicks,
      };
      setStats(newStats);
    }
  }, [ads]);

  const chartConfig = {
    active: {
      label: "Active",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6"
      }
    },
    paused: {
      label: "Paused",
      theme: {
        light: "#4b5563",
        dark: "#6b7280"
      }
    },
    clicks: {
      label: "Clicks",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6"
      }
    }
  };

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
  ];

  const performanceData = ads?.map(ad => ({
    name: ad.title,
    clicks: ad.clicks,
  })) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeBannerAds + stats.activeInterstitialAds}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalClicks / (stats.activeBannerAds + stats.activeInterstitialAds || 1)).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" name="Active" fill="var(--color-active)" />
                  <Bar dataKey="paused" name="Paused" fill="var(--color-paused)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" name="Clicks" stroke="var(--color-clicks)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}