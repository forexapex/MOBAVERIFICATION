import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
}

interface RankInfo {
  verified: boolean;
  userId?: string;
  mlbbId?: string;
  serverId?: string;
  currentRank?: string;
  previousRank?: string;
  stars?: number;
  points?: number;
  roleId?: string;
  lastChecked?: string;
  rankChangedAt?: string;
  createdAt?: string;
  message?: string;
}

const RANK_COLORS: Record<string, string> = {
  "Warrior": "bg-slate-500",
  "Elite": "bg-orange-500",
  "Master": "bg-purple-500",
  "Grandmaster": "bg-red-500",
  "Epic": "bg-pink-500",
  "Legend": "bg-amber-500",
  "Mythic": "bg-blue-600",
  "Mythical Glory": "bg-yellow-500",
};

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, rankRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/rank"),
        ]);

        if (profileRes.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (rankRes.ok) {
          const rankData = await rankRes.json();
          setRankInfo(rankData);
        }
      } catch (err) {
        setError("Failed to load profile data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Trigger a refresh of rank data
      const res = await fetch("/api/user/rank");
      if (res.ok) {
        const data = await res.json();
        setRankInfo(data);
      }
    } catch (err) {
      setError("Failed to sync rank data");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/ipeorg-logo.png" alt="IPEORG Logo" className="w-8 h-8 rounded" />
            <h1 className="text-2xl font-bold">Your Profile</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Discord Profile Card */}
        {profile && (
          <Card className="p-8">
            <div className="flex items-start gap-6">
              {profile.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`}
                  alt={profile.username}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {profile.username}#{profile.discriminator}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-2">Discord ID: {profile.id}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Verification Status */}
        {rankInfo && (
          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">MLBB Verification Status</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync"}
              </Button>
            </div>

            {rankInfo.verified ? (
              <div className="space-y-4">
                {/* Game Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">GAME ID</p>
                    <p className="text-lg font-mono">{rankInfo.mlbbId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">SERVER ID</p>
                    <p className="text-lg font-mono">{rankInfo.serverId}</p>
                  </div>
                </div>

                {/* Rank Display */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">CURRENT RANK</p>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`text-white text-base py-2 px-4 ${RANK_COLORS[rankInfo.currentRank || "Warrior"]}`}
                    >
                      {rankInfo.currentRank || "Unknown"}
                    </Badge>
                    {rankInfo.stars !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {rankInfo.stars} ⭐
                      </span>
                    )}
                  </div>
                </div>

                {/* Previous Rank */}
                {rankInfo.previousRank && rankInfo.previousRank !== rankInfo.currentRank && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground">PREVIOUS RANK</p>
                    <Badge variant="outline">{rankInfo.previousRank}</Badge>
                  </div>
                )}

                {/* Sync Times */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">VERIFIED</p>
                    <p className="text-sm">
                      {rankInfo.createdAt
                        ? new Date(rankInfo.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">LAST SYNC</p>
                    <p className="text-sm">
                      {rankInfo.lastChecked
                        ? new Date(rankInfo.lastChecked).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't verified your MLBB account yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the /verify command in Discord to get started!
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h4 className="font-semibold mb-2">About Rank Sync</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Your rank is checked every hour automatically</li>
            <li>✓ Discord roles are updated when your rank changes</li>
            <li>✓ You'll receive a DM notification when you rank up or down</li>
            <li>✓ Click "Sync" above to manually refresh your rank</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
