import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Documentation</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header */}
        <section className="space-y-6 text-center">
          <img src="/ipeorg-logo.png" alt="IPEORG Logo" className="w-24 h-24 rounded-lg mx-auto shadow-lg" />
          <div>
            <h2 className="text-4xl font-bold mb-2">IPEORG MLBB Discord Automation</h2>
            <p className="text-muted-foreground text-lg">
              Advanced Discord Bot for IPEORG (India Premier Esports Organization) MLBB Community
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Core Features</h3>
          <div className="grid gap-4">
            {[
              { title: "Automated Verification System", desc: "/verify slash command with Game ID modal input, 6-digit OTP generation & validation, 5-minute expiring codes" },
              { title: "Admin Dashboard", desc: "Centralized approval/denial interface, One-click role assignment, Request tracking with timestamps" },
              { title: "Smart Role Management", desc: "Automatic Pending → Verified role transitions, Role cleanup on denial, Hierarchical permission enforcement" },
              { title: "Welcome Automation", desc: "Personalized DM welcome on join, Channel introductions & role assignment guide, Community onboarding" },
              { title: "Audit & Logging", desc: "Complete verification logs, Admin action tracking, Security audit trail" }
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Quick Start (2 Minutes)</h3>
          <div className="space-y-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="font-semibold mb-2">1. Create 3 Discord Channels:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <code className="bg-muted px-2 py-1 rounded">/verify</code> - Verification channel</li>
                <li>• <code className="bg-muted px-2 py-1 rounded">/admindashboard</code> - Admin dashboard (staff only)</li>
                <li>• <code className="bg-muted px-2 py-1 rounded">/stafflogs</code> - Audit logs (staff only)</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="font-semibold mb-2">2. Run the Bot:</div>
              <div className="flex items-center gap-2 mt-3">
                <code className="bg-muted px-4 py-2 rounded flex-1 text-sm">node index.js</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("node index.js", "code-1")}
                  data-testid="button-copy-code-1"
                >
                  {copiedCode === "code-1" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="font-semibold mb-2">3. Test in Discord:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Go to <code className="bg-muted px-2 py-1 rounded">/verify</code> channel</li>
                <li>• Type <code className="bg-muted px-2 py-1 rounded">/verify</code> command</li>
                <li>• Follow the modal to enter Game ID</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Verification Flow */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Verification Flow</h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-3">User Verification (5 Steps)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <div>
                    <p className="font-semibold">User types /verify in /verify channel</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <div>
                    <p className="font-semibold">Bot shows modal: "Enter your MLBB Game ID (9 digits)"</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <div>
                    <p className="font-semibold">User submits Game ID → Bot sends 6-digit OTP via DM</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                  <div>
                    <p className="font-semibold">User replies OTP in DM (within 5 minutes)</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</div>
                  <div>
                    <p className="font-semibold">"Request sent to admins for approval"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Admin Review (3 Steps)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <div>
                    <p className="font-semibold">Admin sees request in /admindashboard</p>
                    <p className="text-muted-foreground">Shows: User mention | Game ID | Timestamp</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <div>
                    <p className="font-semibold">Admin clicks: ✅ Approve OR ❌ Deny</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <div>
                    <p className="font-semibold">Action logged in /stafflogs for audit</p>
                    <p className="text-muted-foreground">User receives success/denial DM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Configuration</h3>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-4">All configurations are pre-configured in index.js:</p>
            <div className="space-y-2 text-sm font-mono">
              <div><span className="text-muted-foreground">BOT_TOKEN:</span> <span className="text-green-600">Pre-configured ✓</span></div>
              <div><span className="text-muted-foreground">CLIENT_ID:</span> <span className="text-primary">1451482666271772754</span></div>
              <div><span className="text-muted-foreground">GUILD_ID:</span> <span className="text-primary">1439165596725022753</span></div>
              <div><span className="text-muted-foreground">VERIFIED_ROLE_ID:</span> <span className="text-primary">1439165896806498425</span></div>
              <div><span className="text-muted-foreground">PENDING_ROLE_ID:</span> <span className="text-primary">1451490702348259409</span></div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="space-y-4 pb-12">
          <h3 className="text-2xl font-bold">Support & Resources</h3>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <p className="text-sm">
              <span className="font-semibold">Discord Developer Portal:</span>{" "}
              <a href="https://discord.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                developer.discord.com
              </a>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Node.js Download:</span>{" "}
              <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                nodejs.org
              </a>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
