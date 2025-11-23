"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  id: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  isError: boolean;
  onClick: () => void;
  index: number;
}

export function MemoryCard({ 
  content, 
  isFlipped, 
  isMatched, 
  isError, 
  onClick,
  index 
}: MemoryCardProps) {
  
  // Variantes tipadas para corrigir o erro de TS e definir as animações
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay: index * 0.05 // Efeito cascata na entrada
      } 
    },
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.95 
    },
    error: {
      x: [0, -10, 10, -10, 10, 0], // Animação de "Não/Erro" (Shake)
      transition: { duration: 0.4 }
    },
    matched: {
      scale: [1, 1.1, 1],
      rotate: [0, 2, -2, 0], // Leve balanço de comemoração
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isError ? "error" : isMatched ? "matched" : "visible"}
      whileHover={!isFlipped && !isMatched ? "hover" : ""}
      whileTap={!isFlipped && !isMatched ? "tap" : ""}
      className="relative w-24 h-32 cursor-pointer perspective-1000"
      onClick={onClick}
    >
      <motion.div
        className={cn(
          "w-full h-full relative preserve-3d transition-colors duration-500 rounded-xl shadow-lg border-2",
          // Feedback visual imediato nas bordas e sombras
          isMatched ? "border-green-500 shadow-green-200" : 
          isError ? "border-red-500 shadow-red-200" : 
          "border-slate-700 shadow-slate-300"
        )}
        initial={false}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- FRENTE (Capa/Verso quando fechado) --- */}
        <div
          className="absolute inset-0 w-full h-full bg-slate-800 rounded-[10px] flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Design da parte de trás da carta */}
          <div className="w-16 h-24 border-2 border-slate-600 border-dashed rounded opacity-50 flex items-center justify-center">
            <span className="text-3xl text-slate-600 font-bold select-none">?</span>
          </div>
        </div>

        {/* --- TRÁS (Conteúdo Revelado) --- */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-[10px] flex items-center justify-center backface-hidden select-none px-1",
            isMatched ? "bg-green-100 text-green-700" : 
            isError ? "bg-red-100 text-red-700" : 
            "bg-white text-slate-900"
          )}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          <span className="text-xl font-bold font-mono break-all text-center">
            {content}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}