import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Captura o nível de dificuldade da URL (padrão: medium)
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') || 'medium';

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" } // Força JSON nativo do Gemini 2.0
    });

    // 2. Definição explícita das regras de dificuldade para o Prompt
    const difficultyRules = {
      easy: "Equação de 1 passo. Formato: x +/- A = B. Números entre 1 e 20. Exemplo: x + 5 = 12.",
      medium: "Equação de 2 passos. Formato: Ax +/- B = C. Números entre 1 e 50. Exemplo: 2x - 4 = 10.",
      hard: "Equação com variáveis em ambos os lados ou números maiores. Formato: Ax + B = Cx + D. Solução inteira obrigatória. Exemplo: 3x + 5 = x + 25."
    };

    const selectedRule = difficultyRules[level as keyof typeof difficultyRules] || difficultyRules.medium;

    const prompt = `
      Você é uma API de geração de jogos matemáticos (Math Game Engine).
      
      TAREFA:
      Gere uma equação do primeiro grau baseada na dificuldade: "${level}".
      Regra de Dificuldade: ${selectedRule}

      REQUISITOS RÍGIDOS:
      1. A solução (x) DEVE ser um número INTEIRO.
      2. Separe a equação em termos visuais lógicos para um jogo da memória.
      3. O JSON deve seguir estritamente o schema abaixo.

      SCHEMA DE RESPOSTA:
      {
        "equationDisplay": "string",
        "solution": number,
        "difficulty": "${level}",
        "terms": ["string", "string", "string"...]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Como configuramos responseMimeType: "application/json", o texto já vem limpo geralmente
    const data = JSON.parse(response.text());

    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Falha ao gerar desafio.", details: String(error) }, 
      { status: 500 }
    );
  }
}