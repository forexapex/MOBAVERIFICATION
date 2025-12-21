import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
      {/* Animated Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border border-primary/20 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0, 0.3],
            rotate: i % 2 === 0 ? 360 : -360
          }}
          transition={{ 
            duration: 10 + i * 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: i * 2 
          }}
          style={{
            margin: `${i * 20}px`
          }}
        />
      ))}

      {/* Center Bot Icon */}
      <motion.div
        className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(88,101,242,0.4)]"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm" />
        <Bot className="w-20 h-20 text-white relative z-10" />
        
        {/* Status Dot */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-background shadow-lg" />
      </motion.div>

      {/* Decorative Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-primary rounded-full"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0 
          }}
          animate={{ 
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
