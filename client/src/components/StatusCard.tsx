import { motion } from "framer-motion";
import { CheckCircle2, Server, Clock, Activity } from "lucide-react";

interface StatusCardProps {
  status: string;
  lastUpdated: string;
}

export function StatusCard({ status, lastUpdated }: StatusCardProps) {
  const isOnline = status.toLowerCase() === "online" || status.toLowerCase() === "ready";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
        {/* Glow effect behind */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700`} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-medium text-muted-foreground flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Status
            </h3>
            <div className={`
              px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border
              ${isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
            `}>
              {status.toUpperCase()}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Operational Status</p>
                <p className="text-xl font-bold font-display text-white">
                  {isOnline ? "All Systems Operational" : "Maintenance Mode"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground pl-1">
              <Clock className="w-4 h-4" />
              <span>Last heartbeat: <span className="text-white font-mono">{lastUpdated}</span></span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
