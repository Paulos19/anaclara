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
  
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: index * 0.05 } 
    },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
    error: {
      opacity: 1, scale: 1, y: 0,
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    },
    matched: {
      opacity: 1, scale: [1, 1.1, 1], rotate: [0, 2, -2, 0], y: 0,
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
      // AQUI ESTÁ A CORREÇÃO RESPONSIVA:
      // Removemos 'w-24 h-32' e usamos 'w-full aspect-[3/4]'
      // min-w-[70px] garante que não fique microscópico em telas muito pequenas
      className="relative w-full aspect-[3/4] min-w-[70px] cursor-pointer perspective-1000"
      onClick={onClick}
    >
      <motion.div
        className={cn(
          "w-full h-full relative preserve-3d transition-all duration-500 rounded-xl shadow-lg border-2",
          isMatched ? "border-green-500 shadow-green-200 bg-green-50" : 
          isError ? "border-red-500 shadow-red-200 bg-red-50" : 
          "border-slate-700 shadow-slate-300"
        )}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- FRENTE (Capa - ?) --- */}
        <div
          className="absolute inset-0 w-full h-full bg-slate-800 rounded-[10px] flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-[60%] h-[70%] border-2 border-slate-600 border-dashed rounded opacity-50 flex items-center justify-center">
            <span className="text-2xl md:text-3xl text-slate-600 font-bold select-none">?</span>
          </div>
        </div>

        {/* --- VERSO (Conteúdo) --- */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-[10px] flex items-center justify-center backface-hidden select-none p-1",
            isMatched ? "bg-green-100 text-green-700" : 
            isError ? "bg-red-100 text-red-700" : 
            "bg-white text-slate-900"
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Ajuste de fonte responsivo para caber equações grandes */}
          <span className="text-sm sm:text-lg md:text-xl font-bold font-mono break-all text-center leading-tight">
            {content}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}