"use client";

import { motion } from "framer-motion";
import { 
  Pi, 
  Sigma, 
  Diff, 
  X, 
  Divide, 
  Percent, 
  FunctionSquare, 
  Calculator, 
  Ruler, 
  Activity,
  Binary,
  Triangle
} from "lucide-react";

const icons = [
  Pi, Sigma, Diff, X, Divide, Percent, FunctionSquare, 
  Calculator, Ruler, Activity, Binary, Triangle
];

export function MathBackground() {
  // Gera posições aleatórias para os ícones preencherem a tela
  // Para uma textura estilo WhatsApp, usamos muitos ícones pequenos
  const generateIcons = () => {
    return Array.from({ length: 40 }).map((_, i) => {
      const Icon = icons[i % icons.length];
      const randomX = Math.floor(Math.random() * 100);
      const randomY = Math.floor(Math.random() * 100);
      const randomDelay = Math.random() * 5;
      const randomDuration = 10 + Math.random() * 10;
      const randomSize = 20 + Math.random() * 30;

      return (
        <motion.div
          key={i}
          className="absolute text-slate-800/20 dark:text-slate-700/10"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.05, 0.15, 0.05], // Pisca levemente
            y: [0, -50, 0], // Flutua verticalmente
            rotate: [0, 45, -45, 0], // Gira levemente
          }}
          transition={{
            duration: randomDuration,
            repeat: Infinity,
            delay: randomDelay,
            ease: "easeInOut",
          }}
        >
          <Icon size={randomSize} strokeWidth={1.5} />
        </motion.div>
      );
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-slate-950">
      {/* Gradiente Radial para dar profundidade (foco no centro) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80" />
      
      {/* Camada de Textura (Grid de pontos sutil) */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      {/* Ícones Flutuantes */}
      {generateIcons()}
    </div>
  );
}