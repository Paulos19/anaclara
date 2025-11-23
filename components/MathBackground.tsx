"use client";

import { motion } from "framer-motion";
import { Pi, Sigma, Diff, X, Divide, Percent, FunctionSquare, Calculator, Ruler, Activity, Binary, Triangle } from "lucide-react";

const icons = [Pi, Sigma, Diff, X, Divide, Percent, FunctionSquare, Calculator, Ruler, Activity, Binary, Triangle];

export function MathBackground() {
  const generateIcons = () => {
    return Array.from({ length: 30 }).map((_, i) => { // Reduzi levemente para 30 para melhor performance em mobile
      const Icon = icons[i % icons.length];
      const randomX = Math.floor(Math.random() * 100);
      const randomY = Math.floor(Math.random() * 100);
      return (
        <motion.div
          key={i}
          className="absolute text-slate-800/20 dark:text-slate-700/10"
          style={{ left: `${randomX}%`, top: `${randomY}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.05, 0.15, 0.05], y: [0, -50, 0], rotate: [0, 45, -45, 0] }}
          transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
        >
          <Icon size={20 + Math.random() * 20} strokeWidth={1.5} />
        </motion.div>
      );
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      {generateIcons()}
    </div>
  );
}