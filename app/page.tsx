import EquationBoard from "@/components/EquationBoard";
import { MathBackground } from "@/components/MathBackground"; // Importe o novo componente

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* 1. O Background fica fixo atrás de tudo */}
      <MathBackground />

      {/* 2. Conteúdo da página com z-index superior */}
      <div className="relative z-10 flex flex-col items-center py-12 px-4">
        
        {/* Header Visual */}
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 drop-shadow-sm">
            Math Memory
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light">
            Desafie sua mente, encontre os pares e resolva a equação.
          </p>
        </div>

        {/* Tabuleiro do Jogo */}
        <EquationBoard />
        
        {/* Footer simples */}
        <footer className="mt-12 text-slate-600 text-sm">
          Desenvolvido para educação gamificada
        </footer>
      </div>
    </main>
  );
}