"use client";

import { useState, useEffect } from "react";
import { MemoryCard } from "./MemoryCard";
import { LivesContainer } from "./LivesContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCw,
  Trophy,
  BrainCircuit,
  User,
  GraduationCap,
  School,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// --- TIPOS ---
type GameData = {
  equationDisplay: string;
  solution: number;
  difficulty: string;
  terms: string[];
};

type CardType = {
  id: string;
  term: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type Difficulty = "easy" | "medium" | "hard";

export default function EquationBoard() {
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardType[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);

  // Estado de Controle do Jogo
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [lives, setLives] = useState(5);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // Trava cliques
  const [isGameOver, setIsGameOver] = useState(false);

  // Estado do Modal de Desafio Final
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  // Estado para animação de erro (Shake)
  const [errorIndices, setErrorIndices] = useState<number[]>([]);

  // --- LÓGICA DO JOGO ---

  const fetchNewGame = async (levelOverride?: Difficulty) => {
    setErrorIndices([]);
    const levelToUse = levelOverride || difficulty;

    setLoading(true);
    setLives(5);
    setIsGameOver(false);
    setIsChallengeOpen(false);
    setUserAnswer("");
    setFlippedCards([]);
    setCards([]); // Limpa visualmente antes de carregar

    try {
      // FIX: Adicionamos timestamp e headers anti-cache
      const timestamp = Date.now();
      const res = await fetch(
        `/api/game/generate?level=${levelToUse}&t=${timestamp}`,
        {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );

      if (!res.ok) throw new Error("Falha na requisição");

      const data: GameData = await res.json();
      setGameData(data);
      prepareBoard(data.terms);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar jogo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const prepareBoard = (terms: string[]) => {
    // 1. Duplicar termos para formar pares
    const pairTerms = [...terms, ...terms];

    // 2. Criar objetos de card com ID único
    const initialCards: CardType[] = pairTerms.map((term, index) => ({
      id: `card-${index}-${Math.random().toString(36).substr(2, 9)}`,
      term,
      isFlipped: false,
      isMatched: false,
    }));

    // 3. Embaralhar (Fisher-Yates shuffle)
    for (let i = initialCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }

    setCards(initialCards);
  };

  // Inicializa o jogo na montagem
  useEffect(() => {
    fetchNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = (index: number) => {
    // Bloqueios de segurança
    if (
      isProcessing ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      isGameOver
    )
      return;

    // Vira a carta clicada imediatamente (State Imutável)
    const newCards = cards.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // Se é a segunda carta, iniciamos a validação
    if (newFlipped.length === 2) {
      setIsProcessing(true); // Trava o clique
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (
    flippedIndices: number[],
    currentCards: CardType[]
  ) => {
    const [idx1, idx2] = flippedIndices;
    const card1 = currentCards[idx1];
    const card2 = currentCards[idx2];

    if (card1.term === card2.term) {
      // --- MATCH (Correto) ---
      const matchedCards = currentCards.map((card, i) =>
        i === idx1 || i === idx2
          ? { ...card, isMatched: true, isFlipped: true }
          : card
      );

      setCards(matchedCards);
      setFlippedCards([]);
      setIsProcessing(false); // Destrava imediatamente

      // Verificar Vitória Total
      if (matchedCards.every((c) => c.isMatched)) {
        setTimeout(() => setIsChallengeOpen(true), 1500);
      }
    } else {
      // --- ERRO (Incorreto) ---
      // 1. Marca visualmente o erro para tremer (via prop isError)
      setErrorIndices([idx1, idx2]);

      // 2. Aguarda 2 SEGUNDOS para o usuário ver o erro
      setTimeout(() => {
        const resetCards = currentCards.map((card, i) =>
          i === idx1 || i === idx2
            ? { ...card, isMatched: false, isFlipped: false }
            : card
        );

        setCards(resetCards);
        setErrorIndices([]); // Limpa o erro
        setFlippedCards([]);
        setIsProcessing(false); // Destrava o jogo

        // Reduz vida
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives === 0) {
          setIsGameOver(true);
          toast.error("Fim de jogo!");
        }
      }, 2000);
    }
  };

  const handleFinalSubmit = () => {
    if (!gameData) return;
    if (parseInt(userAnswer) === gameData.solution) {
      toast.success("Venceu!", { icon: "🏆" });
      setTimeout(() => fetchNewGame(), 2000);
      setIsChallengeOpen(false);
    } else {
      toast.error("Errado! Tente calcular novamente.");
      setUserAnswer("");
    }
  };

  const handleDifficultyChange = (level: Difficulty) => {
    if (loading) return;
    setDifficulty(level);
    fetchNewGame(level);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto p-2 sm:p-4">
      {/* --- STUDENT INFO CARD --- */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full"
      >
        <Card className="border-l-4 border-l-blue-500 shadow-xl bg-white/95 backdrop-blur-md border-y-0 border-r-0">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">
                  Ana Clara Lopes
                </h3>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 text-slate-500">
                  Aluno(a)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-slate-700">Turma:</span> 7E
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-slate-700">Prof:</span>{" "}
                Kelly
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-slate-700">Matéria:</span>{" "}
                Matemática
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- GAME CONTROLS (HUD) --- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between w-full items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200 gap-4"
      >
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-full md:w-auto justify-center">
          {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={difficulty === level ? "default" : "ghost"}
              onClick={() => handleDifficultyChange(level)}
              className="capitalize flex-1 md:flex-none"
              disabled={loading}
            >
              {level === "easy"
                ? "Fácil"
                : level === "medium"
                ? "Médio"
                : "Difícil"}
            </Button>
          ))}
        </div>

        <div className="flex items-center">
          <LivesContainer lives={lives} />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchNewGame()}
          disabled={loading}
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Reiniciar
        </Button>
      </motion.div>

      {/* --- GAME GRID (RESPONSIVO) --- */}
      <div className="w-full min-h-[400px] flex items-center justify-center relative bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-4 perspective-1000">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 text-slate-400"
          >
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p>Gerando desafio...</p>
          </motion.div>
        ) : isGameOver ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex bg-red-100 p-4 rounded-full mb-2">
              <Trophy className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">
              Acabaram as vidas!
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-slate-500 mb-1">A solução era:</p>
              <p className="text-2xl font-mono font-bold text-blue-600">
                {gameData?.equationDisplay}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => fetchNewGame()}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </motion.div>
        ) : (
          // GRID FLUIDO:
          // Mobile: 3 colunas | Tablet: 4 colunas | Desktop: 5 colunas
          <div
            className={`grid w-full justify-items-center gap-2 sm:gap-4 ${
              cards.length <= 12
                ? "grid-cols-3 sm:grid-cols-4"
                : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
            }`}
          >
            {cards.map((card, index) => (
              <MemoryCard
                key={card.id}
                id={card.id}
                index={index}
                content={card.term}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                isError={errorIndices.includes(index)}
                onClick={() => handleCardClick(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DO DESAFIO FINAL --- */}
      <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
        <DialogContent className="sm:max-w-md bg-white w-[95%] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex flex-col items-center gap-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                className="bg-yellow-100 p-3 rounded-full"
              >
                <Trophy className="h-8 w-8 text-yellow-600" />
              </motion.div>
              Peças Encontradas!
            </DialogTitle>
            <DialogDescription className="text-center">
              Resolva a equação final para vencer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-6">
            <div className="w-full bg-slate-900 text-white p-6 rounded-xl flex items-center justify-center shadow-inner">
              <BrainCircuit className="h-6 w-6 mr-3 text-blue-400" />
              <span className="text-xl md:text-3xl font-mono font-bold tracking-wider break-all text-center">
                {gameData?.equationDisplay}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full justify-center">
              <span className="text-2xl font-bold text-slate-700">x =</span>
              <Input
                type="number"
                placeholder="?"
                className="w-32 text-center text-2xl h-14 font-bold border-2 focus-visible:ring-blue-500"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFinalSubmit()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleFinalSubmit}
              className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}