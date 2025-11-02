import { GoogleGenAI } from "@google/genai";
import { CommaFeedEntry } from '../types';

// IMPORTANT: This key is read from environment variables and must be configured in the deployment environment.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateAnswer = async (entries: CommaFeedEntry[], question: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }
  
    const context = entries
        .slice(0, 20) // Limit to the 20 most recent entries to manage context size
        .map(entry => `Title: ${entry.title}\nContent: ${(entry.content || '').replace(/<[^>]*>/g, '').substring(0, 1500)}`)
        .join('\n\n---\n\n');

    const prompt = `You are a helpful feed reading assistant. The user can see a list of the recent article titles from their feed. Based on the full content of those articles provided below, answer the user's question. Be concise and helpful.

Context from the feed:
${context}

User's Question:
${question}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating answer from Gemini:", error);
        throw new Error("Failed to get a response from the AI. Please check your API key and network connection.");
    }
};
