
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client following the mandatory guidelines.
// Always use process.env.API_KEY as a direct named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  /**
   * Generates advice for jewelry using the Gemini 3 Flash model.
   * Uses ai.models.generateContent as per guidelines.
   */
  async getJewelryAdvice(prompt: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a professional jewelry expert for TillaBazar. Answer user questions about gold purity, gemstones, jewelry care, and market trends in a helpful and luxurious tone. Keep responses concise.",
          temperature: 0.7,
        },
      });

      // Directly access the text property on the GenerateContentResponse object.
      return response.text || "Sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having trouble connecting to my knowledge base right now.";
    }
  }
}

export const geminiService = new GeminiService();
