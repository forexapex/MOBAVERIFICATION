import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { LogOut, Settings, Plus, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: number;
}

export default function Dashboard() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch guilds on mount
  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await fetch("/api/user/guilds");
        if (!response.ok) {
          if (response.status === 401) {
            setError("Not authenticated. Please login first.");
            window.location.href = "/login";
          } else {
            setError("Failed to fetch servers");
          }
          return;
        }
        const data = await response.json();
        setGuilds(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch guilds:", error);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/ipeorg-logo.png" alt="IPEORG Logo" className="w-8 h-8 rounded" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
            {error}
          </div>
        )}
        
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="space-y-2 mb-6">
            <h2 className="text-3xl font-bold">Your Servers</h2>
            <p className="text-muted-foreground">Manage your IPEORG MLBB bot configuration across multiple servers</p>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          ) : guilds.length === 0 ? (
            <Card className="p-12 text-center space-y-4">
              <p className="text-muted-foreground">No servers found. Add the bot to your Discord server first.</p>
              <a href="https://discord.com/oauth2/authorize?client_id=1451482666271772754&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noopener noreferrer">
                <Button data-testid="button-add-bot">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bot to Server
                </Button>
              </a>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guilds.map((guild) => (
                <Card key={guild.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="space-y-4">
                    {/* Guild Header */}
                    <div className="flex items-start gap-3">
                      {guild.icon ? (
                        <img 
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt={guild.name}
                          className="w-12 h-12 rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {guild.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{guild.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {guild.owner ? "Owner" : "Admin"}
                        </p>
                      </div>
                    </div>

                    {/* Guild ID */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">GUILD ID</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border">
                        <code className="text-xs font-mono flex-1 truncate">{guild.id}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(guild.id, `guild-${guild.id}`)}
                          data-testid={`button-copy-guild-${guild.id}`}
                        >
                          {copiedId === `guild-${guild.id}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/server/${guild.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full" data-testid={`button-configure-${guild.id}`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Setup Guide */}
        <section className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Setup Guide</h3>
            <p className="text-muted-foreground">Follow these steps to configure the bot in your server</p>
          </div>

          <div className="grid gap-4">
            {[
              { step: 1, title: "Add Bot to Server", desc: "Use the 'Add Bot to Server' link above to invite the bot" },
              { step: 2, title: "Configure Channels", desc: "Create channels: /verify, /admindashboard, /stafflogs" },
              { step: 3, title: "Set Game Type", desc: "Choose MLBB (Game ID verification) or BGMI (Screenshot verification)" },
              { step: 4, title: "Assign Roles", desc: "Create Verified and Pending roles for your server" },
              { step: 5, title: "Enable Welcome DM", desc: "Bot will automatically welcome new members with setup instructions" }
            ].map((item) => (
              <Card key={item.step} className="p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-12 space-y-4">
          <h3 className="text-lg font-bold">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs">
              <Button variant="outline">View Documentation</Button>
            </Link>
            <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Discord Developer Portal</Button>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
