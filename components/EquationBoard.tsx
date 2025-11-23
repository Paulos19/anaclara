"use client";

import { useState, useEffect } from "react";
import { MemoryCard } from "./MemoryCard";
import { LivesContainer } from "./LivesContainer"; // Importe o novo componente
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Trophy, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// ... (Mantenha os types GameData, Difficulty aqui) ...
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
  // ... (Estados anteriores de loading, gameData, lives, etc) ...
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardType[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [lives, setLives] = useState(5);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  // NOVO ESTADO: IDs das cartas que erraram (para animação de erro)
  const [errorIndices, setErrorIndices] = useState<number[]>([]);

  // ... (Mantenha fetchNewGame e prepareBoard iguais) ...
  
  // A única mudança no fetchNewGame é resetar o errorIndices
  const fetchNewGame = async (levelOverride?: Difficulty) => {
    // ... lógica anterior ...
    setErrorIndices([]); // Resetar erros
    // ... resto da função ...
    const levelToUse = levelOverride || difficulty;
    
    setLoading(true);
    setLives(5);
    setIsGameOver(false);
    setIsChallengeOpen(false);
    setUserAnswer("");
    setFlippedCards([]);
    setCards([]); 

    try {
      const res = await fetch(`/api/game/generate?level=${levelToUse}`);
      if (!res.ok) throw new Error("Falha na requisição");
      const data: GameData = await res.json();
      setGameData(data);
      prepareBoard(data.terms);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar jogo");
    } finally {
      setLoading(false);
    }
  };
  
  const prepareBoard = (terms: string[]) => {
    const pairTerms = [...terms, ...terms];
    const initialCards: CardType[] = pairTerms.map((term, index) => ({
      id: `card-${index}-${Math.random().toString(36).substr(2, 9)}`,
      term,
      isFlipped: false,
      isMatched: false,
    }));
    // Shuffle
    for (let i = initialCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }
    setCards(initialCards);
  };

  useEffect(() => { fetchNewGame(); }, []); // eslint-disable-line

  const handleCardClick = (index: number) => {
    if (isProcessing || cards[index].isFlipped || cards[index].isMatched || isGameOver) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (flippedIndices: number[], currentCards: CardType[]) => {
    const [idx1, idx2] = flippedIndices;
    const card1 = currentCards[idx1];
    const card2 = currentCards[idx2];

    if (card1.term === card2.term) {
      // --- MATCH (Correto) ---
      // Pequeno som ou vibração poderia ser acionado aqui
      const matchedCards = currentCards.map((card, i) => 
        i === idx1 || i === idx2 ? { ...card, isMatched: true, isFlipped: true } : card
      );
      
      setCards(matchedCards);
      setFlippedCards([]);
      setIsProcessing(false);

      if (matchedCards.every(c => c.isMatched)) {
        setTimeout(() => setIsChallengeOpen(true), 800);
      }

    } else {
      // --- ERROR (Incorreto) ---
      // 1. Marca visualmente como erro para tremer (vermelho)
      setErrorIndices([idx1, idx2]);

      setTimeout(() => {
        // 2. Reseta o estado (vira cartas para baixo e tira o erro)
        const resetCards = currentCards.map((card, i) => 
          i === idx1 || i === idx2 ? { ...card, isMatched: false, isFlipped: false } : card
        );
        
        setCards(resetCards);
        setErrorIndices([]); // Remove o status de erro
        setFlippedCards([]);
        setIsProcessing(false);
        
        // Perde vida (O componente LivesContainer vai animar sozinho ao mudar esse número)
        const newLives = lives - 1;
        setLives(newLives);
        
        if (newLives === 0) {
            setIsGameOver(true);
            toast.error("Fim de jogo!");
        }
      }, 1000); // Tempo para ver a animação de erro
    }
  };

  // ... (handleFinalSubmit e handleDifficultyChange iguais) ...
  const handleFinalSubmit = () => {
      if (!gameData) return;
      if (parseInt(userAnswer) === gameData.solution) {
        toast.success("Venceu!", { icon: "🏆" });
        setTimeout(() => fetchNewGame(), 2000);
        setIsChallengeOpen(false);
      } else {
        toast.error("Errado!");
        setUserAnswer("");
      }
  };

  const handleDifficultyChange = (level: Difficulty) => {
    if (loading) return;
    setDifficulty(level);
    fetchNewGame(level);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto p-4">
      
      {/* HEADER DE CONTROLE */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between w-full items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4"
      >
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <Button 
              key={level}
              size="sm"
              variant={difficulty === level ? "default" : "ghost"}
              onClick={() => handleDifficultyChange(level)}
              className="capitalize transition-all"
              disabled={loading}
            >
              {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Médio' : 'Difícil'}
            </Button>
          ))}
        </div>

        {/* COMPONENTE DE VIDAS ANIMADO */}
        <div className="flex items-center">
            <LivesContainer lives={lives} />
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchNewGame()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> 
            Reiniciar
        </Button>
      </motion.div>

      {/* ÁREA DE JOGO */}
      <div className="w-full min-h-[400px] flex items-center justify-center relative bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-6 perspective-1000">
        
        {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 text-slate-400"
            >
                <Loader2 className="h-10 w-10 animate-spin text-blue-500"/>
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
                <h2 className="text-3xl font-bold text-slate-800">Acabaram as vidas!</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-slate-500 mb-1">A solução era:</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{gameData?.equationDisplay}</p>
                </div>
                <Button size="lg" onClick={() => fetchNewGame()} className="w-full">
                    Tentar Novamente
                </Button>
            </motion.div>
        ) : (
            <div className={`grid gap-4 w-full justify-items-center ${
                cards.length <= 12 
                    ? 'grid-cols-3 sm:grid-cols-4' 
                    : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
            }`}>
                {cards.map((card, index) => (
                  <MemoryCard
                    key={card.id}
                    id={card.id}
                    index={index} // Passamos o index para animação escalonada
                    content={card.term}
                    isFlipped={card.isFlipped}
                    isMatched={card.isMatched}
                    isError={errorIndices.includes(index)} // Verifica se essa carta está no array de erro
                    onClick={() => handleCardClick(index)}
                  />
                ))}
            </div>
        )}
      </div>

      {/* MODAL (Pode manter o mesmo, adicionando motion se quiser) */}
      <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
        <DialogContent className="sm:max-w-md bg-white">
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
                <span className="text-2xl md:text-3xl font-mono font-bold tracking-wider">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
                    autoFocus
                />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleFinalSubmit} className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700">
                Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}