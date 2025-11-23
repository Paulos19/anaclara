import EquationBoard from "@/components/EquationBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-slate-900">
        Math<span className="text-blue-600">Memory</span>
      </h1>
      <p className="text-slate-600 mb-8 text-center max-w-lg">
        Encontre os pares para revelar a equação e resolva o valor de X.
      </p>
      
      <EquationBoard />
    </main>
  );
}