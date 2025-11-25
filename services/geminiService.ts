import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sentence_start: { type: Type.STRING, description: "The part of the sentence before the first verb blank." },
    verb1_prompt: { type: Type.STRING, description: "The first verb in base form, e.g., '(to be)'." },
    sentence_middle: { type: Type.STRING, description: "The part of the sentence between the two verb blanks." },
    verb2_prompt: { type: Type.STRING, description: "The second verb in base form, e.g., '(to buy)'." },
    sentence_end: { type: Type.STRING, description: "The rest of the sentence." },
    answer1: { type: Type.STRING, description: "The correct conjugated form for the first verb in Conditional Type 2." },
    answer2: { type: Type.STRING, description: "The correct conjugated form for the second verb in Conditional Type 2." },
    explanation: { type: Type.STRING, description: "A brief explanation of why these forms are correct." },
  },
  required: ["sentence_start", "verb1_prompt", "sentence_middle", "verb2_prompt", "sentence_end", "answer1", "answer2", "explanation"],
};

export const generateQuestions = async (count: number = 5): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} distinct English grammar questions testing "Conditional Sentences Type 2". 
      
      Rules:
      1. Type 2 conditionals refer to hypothetical situations in the present or future.
      2. Structure: If + Past Simple, ... would/could/might + base verb.
      3. Exception: Use "were" instead of "was" for "I/he/she/it" in formal grammar (e.g., "If I were you").
      4. Ensure the questions are varied and appropriate for students.
      5. Provide the answers clearly.
      
      Example output structure idea: "If I [blank] (have) time, I [blank] (visit) you." -> answer1: "had", answer2: "would visit".
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema,
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Add IDs to questions
      return data.map((q: any, index: number) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
      }));
    }
    
    throw new Error("No data received from Gemini");
  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Fallback questions in case of API error or quota limits
    return [
      {
        id: "fallback-1",
        sentence_start: "If I ",
        verb1_prompt: "(be)",
        sentence_middle: " a millionaire, I ",
        verb2_prompt: "(travel)",
        sentence_end: " the world.",
        answer1: "were",
        answer2: "would travel",
        explanation: "Type 2: If + Past Simple (were), ... would + infinitive (would travel)."
      },
      {
        id: "fallback-2",
        sentence_start: "If she ",
        verb1_prompt: "(study)",
        sentence_middle: " harder, she ",
        verb2_prompt: "(pass)",
        sentence_end: " the exam.",
        answer1: "studied",
        answer2: "would pass",
        explanation: "Type 2: If + Past Simple (studied), ... would + infinitive (would pass)."
      },
       {
        id: "fallback-3",
        sentence_start: "If we ",
        verb1_prompt: "(have)",
        sentence_middle: " a map, we ",
        verb2_prompt: "(not be)",
        sentence_end: " lost.",
        answer1: "had",
        answer2: "would not be",
        explanation: "Type 2: If + Past Simple (had), ... would + infinitive (would not be)."
      },
      {
        id: "fallback-4",
        sentence_start: "What ",
        verb1_prompt: "(you / do)",
        sentence_middle: " if you ",
        verb2_prompt: "(see)",
        sentence_end: " a ghost?",
        answer1: "would you do",
        answer2: "saw",
        explanation: "Question form: Would + subject + infinitive ... if + Past Simple."
      },
      {
        id: "fallback-5",
        sentence_start: "If I ",
        verb1_prompt: "(know)",
        sentence_middle: " his number, I ",
        verb2_prompt: "(call)",
        sentence_end: " him.",
        answer1: "knew",
        answer2: "would call",
        explanation: "Type 2: If + Past Simple (knew), ... would + infinitive (would call)."
      }
    ];
  }
};
