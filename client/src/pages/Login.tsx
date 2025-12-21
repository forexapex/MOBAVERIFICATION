import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Zap } from "lucide-react";

export default function Login() {
  const clientId = "1451482666271772754"; // Your Discord bot client ID
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/api/callback` : "http://localhost:5000/api/callback";
  const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds`;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background relative overflow-hidden flex items-center justify-center">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <img src="/ipeorg-logo.png" alt="IPEORG Logo" className="w-16 h-16 rounded-lg mx-auto shadow-lg" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your IPEORG MLBB Discord bot servers</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sign in with Discord</h2>
            <p className="text-sm text-muted-foreground">
              You must be a server administrator to manage bot configuration and verification settings.
            </p>
          </div>

          <a href={discordOAuthUrl} className="block">
            <Button 
              size="lg" 
              className="w-full h-12 bg-primary hover:bg-primary/90 rounded-lg text-white font-semibold"
              data-testid="button-discord-login"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.396-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.037.001-.08-.037-.095a13.107 13.107 0 0 1-1.872-.892.083.083 0 0 1-.008-.138c.125-.093.25-.19.371-.287a.077.077 0 0 1 .079-.01c3.928 1.793 8.18 1.793 12.062 0a.077.077 0 0 1 .08.009c.12.098.246.195.371.288a.083.083 0 0 1-.006.137 12.266 12.266 0 0 1-1.873.892.084.084 0 0 0-.037.096c.352.699.764 1.365 1.225 1.994a.078.078 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-4.65-.838-8.686-3.554-12.264a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.975-2.157 2.157-2.157 1.183 0 2.158.964 2.157 2.157 0 1.19-.974 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.975-2.157 2.157-2.157 1.184 0 2.158.964 2.157 2.157 0 1.19-.973 2.156-2.157 2.156z"/>
              </svg>
              Login with Discord
            </Button>
          </a>
        </Card>

        {/* Features */}
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Secure OAuth</p>
              <p className="text-xs text-muted-foreground">Verified Discord authentication</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Multi-Server Support</p>
              <p className="text-xs text-muted-foreground">Manage all your servers in one place</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Game-Specific Setup</p>
              <p className="text-xs text-muted-foreground">Configure MLBB or BGMI verification</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          By logging in, you agree to use this tool responsibly. Only administrators can access server configuration.
        </p>
      </div>
    </div>
  );
}
