"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartCrack } from "lucide-react";

export function LivesContainer({ lives, maxLives = 5 }: { lives: number, maxLives?: number }) {
  return (
    <div className="flex gap-2 p-2 bg-slate-200/50 rounded-full">
      {Array.from({ length: maxLives }).map((_, i) => {
        const isAlive = i < lives;
        
        return (
          <div key={i} className="relative w-8 h-8 flex items-center justify-center">
            {/* Coração Quebrado (Fundo) */}
            <HeartCrack className="absolute w-6 h-6 text-slate-300" />
            
            {/* Coração Cheio (Frente - com animação de saída/explosão) */}
            <AnimatePresence>
              {isAlive && (
                <motion.div
                  key="active-heart"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ 
                    scale: 2.5, 
                    opacity: 0, 
                    filter: "blur(4px)",
                    transition: { duration: 0.3 } 
                  }}
                  className="absolute"
                >
                  <Heart className="w-6 h-6 fill-red-500 text-red-500 drop-shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}