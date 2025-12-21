import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, ShieldCheck, Zap, Users, Globe, Lock, Zap as Zap2, BarChart3, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Direct Mobile Legends account verification with zero OTP delays"
    },
    {
      icon: ShieldCheck,
      title: "Secure & Safe",
      description: "Discord OAuth2 authentication and encrypted data transmission"
    },
    {
      icon: Users,
      title: "Community Ready",
      description: "Automatic role assignment and verified user management"
    },
    {
      icon: LayoutDashboard,
      title: "Admin Dashboard",
      description: "Complete control over verifications and user management"
    },
    {
      icon: BarChart3,
      title: "Audit Logs",
      description: "Comprehensive verification history and audit trails"
    },
    {
      icon: Globe,
      title: "Multi-Region",
      description: "Support for SEA, GLOBAL, AMERICAS, and EUROPE servers"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Run /verify",
      description: "Use the /verify command in your Discord server"
    },
    {
      number: "02",
      title: "Enter Details",
      description: "Provide your Game ID and Mobile Legends server region"
    },
    {
      number: "03",
      title: "Instant Verification",
      description: "Account is verified instantly through moogold.com API"
    },
    {
      number: "04",
      title: "Role Assigned",
      description: "Verified role is automatically assigned to your account"
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tighter">
          <img src="/ipeorg-logo.png" alt="IPEORG Logo" className="w-8 h-8 rounded-lg" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            IPEORG MLBB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/contact">
            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
              Contact
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
              Login <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-24">
        {/* Main Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-16 items-center mb-32"
        >
          {/* Left Column: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              System Operational
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight">
              IPEORG <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary">
                MLBB Verification
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Advanced Discord automation for IPEORG MLBB community. Verify users instantly, manage roles automatically, and keep your community secure with our state-of-the-art verification system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" data-testid="button-admin-login">
                  Admin Dashboard <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://discord.com/oauth2/authorize?client_id=1451482666271772754&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5 hover:text-white" data-testid="button-add-bot">
                  Add Bot to Server
                </Button>
              </a>
            </div>

            <div className="pt-8 flex items-center gap-8 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Secure Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>Community Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Logo */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
              <img src="/ipeorg-logo.png" alt="IPEORG MLBB Logo" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage your MLBB community with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 hover-elevate h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple 4-step process to verify your Mobile Legends account
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connection Lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 -z-10" />
            
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <div className="relative">
                  <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32 p-12 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Users Verified</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Discord Servers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">&lt;1s</div>
              <p className="text-muted-foreground">Verification Speed</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Join hundreds of Discord communities using IPEORG MLBB for secure verification
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.com/oauth2/authorize?client_id=1451482666271772754&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90" data-testid="button-add-bot-cta">
                Add Bot Now <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5 hover:text-white">
                Get Help <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* Footer Links */}
        <footer className="mt-32 pt-12 border-t border-white/10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/docs"><span className="hover:text-white transition cursor-pointer">Documentation</span></Link></li>
                <li><a href="https://discord.gg/ipeorg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Discord</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="https://ipeorg.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">About Us</a></li>
                <li><Link href="/contact"><span className="hover:text-white transition cursor-pointer">Contact</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/privacy"><span className="hover:text-white transition cursor-pointer">Privacy Policy</span></Link></li>
                <li><Link href="/terms"><span className="hover:text-white transition cursor-pointer">Terms & Conditions</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="https://github.com/IPEORG/mlbb-bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href="https://mobilelegends.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Mobile Legends</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 IPEORG MLBB. All rights reserved. | <a href="/privacy" className="hover:text-white transition">Privacy</a> | <a href="/terms" className="hover:text-white transition">Terms</a></p>
          </div>
        </footer>
      </main>
    </div>
  );
}
