import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- CONFIGURAÇÕES ANTI-CACHE (Next.js) ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') || 'medium';

    // Aumentamos a temperature para 1.0 (máximo criativo seguro) para variar os números
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 1.0,
      } 
    });

    const difficultyRules = {
      easy: "Gere uma equação super simples (x +/- A = B). Use números aleatórios entre 1 e 30.",
      medium: "Gere uma equação de 2 passos (Ax +/- B = C). Use números aleatórios entre 2 e 80.",
      hard: "Gere uma equação complexa com variáveis dos dois lados. Use números maiores (até 200)."
    };

    const selectedRule = difficultyRules[level as keyof typeof difficultyRules] || difficultyRules.medium;

    // Adicionamos um seed aleatório no prompt para garantir variação semântica
    const randomSeed = Math.floor(Math.random() * 10000);

    const prompt = `
      Seed aleatória: ${randomSeed} (Use isso para variar os números).
      Tarefa: Math Game Engine.
      Dificuldade: ${level}.
      Regra: ${selectedRule}
      
      IMPORTANTE:
      - A solução deve ser INTEIRA.
      - NÃO repita exemplos padrões. Seja criativo nos números.
      - JSON output apenas.
      
      Schema:
      {
        "equationDisplay": "string",
        "solution": number,
        "difficulty": "${level}",
        "terms": ["termo1", "termo2", ...]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());

    // Retornamos com headers agressivos de NO-CACHE
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("Erro API:", error);
    return NextResponse.json({ error: "Erro na geração" }, { status: 500 });
  }
}