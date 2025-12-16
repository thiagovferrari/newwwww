import { GoogleGenAI, Type } from "@google/genai";
import { Priority, AIResponse } from "../types";

// Initialize Gemini API
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const enhanceReminder = async (text: string): Promise<AIResponse> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning default fallback.");
    return {
      improvedTitle: text,
      improvedDescription: "Adicione uma chave de API para sugestões inteligentes.",
      suggestedPriority: Priority.MEDIUM
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analise este lembrete bruto: "${text}". 
      Melhore o texto para ser mais claro e acionável. 
      Sugira uma prioridade (Baixa, Média, Alta) baseada na urgência implícita.
      Se o texto for muito curto, expanda com detalhes lógicos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedTitle: {
              type: Type.STRING,
              description: "Um título curto e claro para a tarefa",
            },
            improvedDescription: {
              type: Type.STRING,
              description: "Uma descrição detalhada e acionável",
            },
            suggestedPriority: {
              type: Type.STRING,
              enum: ["Baixa", "Média", "Alta"],
              description: "A prioridade sugerida para a tarefa",
            },
          },
          required: ["improvedTitle", "improvedDescription", "suggestedPriority"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        improvedTitle: data.improvedTitle,
        improvedDescription: data.improvedDescription,
        suggestedPriority: data.suggestedPriority as Priority,
      };
    }
    
    throw new Error("No response text from AI");

  } catch (error) {
    console.error("Error enhancing reminder:", error);
    // Fallback in case of error
    return {
      improvedTitle: text,
      improvedDescription: "Não foi possível melhorar o texto automaticamente no momento.",
      suggestedPriority: Priority.MEDIUM
    };
  }
};
