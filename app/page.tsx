import EquationBoard from "@/components/EquationBoard";
import { MathBackground } from "@/components/MathBackground";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden font-sans">
      <MathBackground />
      <div className="relative z-10 flex flex-col items-center py-8 md:py-12 px-4 w-full">
        
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 drop-shadow-sm">
            Math Memory
          </h1>
          <p className="text-slate-400 text-sm md:text-lg font-light max-w-md mx-auto">
            Treine seu cérebro: encontre os pares e resolva a equação.
          </p>
        </div>

        <EquationBoard />
        
        <footer className="mt-12 text-slate-600 text-xs md:text-sm text-center">
          Plataforma Educacional Gamificada • Turma 7E
        </footer>
      </div>
    </main>
  );
}