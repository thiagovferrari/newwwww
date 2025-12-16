import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Priority, AIResponse } from "../types";

// Initialize Gemini API
// Ensure we use the VITE_ prefixed variable for client-side access
const apiKey = (import.meta.env.VITE_GOOGLE_AI_KEY || '').trim();

// Initialize the client only if key exists to avoid immediate errors
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const enhanceReminder = async (text: string): Promise<AIResponse> => {
  if (!genAI) {
    console.warn("API Key is missing. Returning default fallback.");
    return {
      improvedTitle: text,
      improvedDescription: "Adicione sua chave VITE_GOOGLE_AI_KEY nas variáveis de ambiente da Vercel.",
      suggestedPriority: Priority.MEDIUM
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            improvedTitle: {
              type: SchemaType.STRING,
              description: "Um título curto e claro para a tarefa",
            },
            improvedDescription: {
              type: SchemaType.STRING,
              description: "Uma descrição detalhada e acionável",
            },
            suggestedPriority: {
              type: SchemaType.STRING,
              enum: ["Baixa", "Média", "Alta"],
              description: "A prioridade sugerida para a tarefa",
            },
          },
          required: ["improvedTitle", "improvedDescription", "suggestedPriority"],
        }
      }
    });

    const prompt = `Analise este lembrete bruto: "${text}". 
    Melhore o texto para ser mais claro e acionável. 
    Sugira uma prioridade (Baixa, Média, Alta) baseada na urgência implícita.
    Se o texto for muito curto, expanda com detalhes lógicos.
    Responda APENAS com o JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    if (jsonString) {
      const data = JSON.parse(jsonString);
      return {
        improvedTitle: data.improvedTitle,
        improvedDescription: data.improvedDescription,
        suggestedPriority: data.suggestedPriority as Priority,
      };
    }

    throw new Error("No response text from AI");

  } catch (error: any) {
    console.error("Error enhancing reminder:", error);
    // Fallback in case of error with details
    return {
      improvedTitle: text,
      improvedDescription: `Erro na IA: ${error.message || "Falha desconhecida"}. Verifique se a chave VITE_GOOGLE_AI_KEY está correta e se a api do Gemini está habilitada.`,
      suggestedPriority: Priority.MEDIUM
    };
  }
};
