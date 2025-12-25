
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ScenarioResponse, BeYouUserDetails, BeYouPersonaResponse, ChatMessage, DifficultyLevel } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCENARIO_MODEL = "gemini-3-pro-preview"; 
const LITE_MODEL = "gemini-3-flash-preview";
const ULTRA_LITE_MODEL = "gemini-flash-lite-latest"; 
const SPEECH_MODEL = "gemini-2.5-flash-preview-tts";
const IMAGE_MODEL = "gemini-2.5-flash-image";

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateScenario = async (topic: string, grade: string, difficulty: DifficultyLevel = 'MEDIUM'): Promise<ScenarioResponse> => {
  const ai = getAI();
  const prompt = `Target Audience: Grade ${grade} Student. Topic: "${topic}". Difficulty: ${difficulty}. Create a modern learning module that eliminates rote memorization. STRICT PLAIN TEXT. Output JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: SCENARIO_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 12000 },
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            role: { type: Type.STRING },
            objective: { type: Type.STRING },
            scenario: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            quote: { type: Type.STRING },
          },
          required: ["explanation", "examples", "role", "objective", "scenario", "steps", "quote"],
        },
      },
    });
    return { ...JSON.parse(response.text || '{}'), difficulty } as ScenarioResponse;
  } catch (error) {
    console.error("Scenario Gen Error:", error);
    throw error;
  }
};

export const engineOceanQuery = async (query: string, grade: string, marks: string, difficulty: string = 'Standard'): Promise<any> => {
  const ai = getAI();
  const prompt = `Grade: ${grade}, Marks: ${marks}, Difficulty: ${difficulty}, Query: ${query}. 
  Depth Requirement: For ${marks} marks, output length must be precisely calibrated. 
  STRICT RULES: NO MARKDOWN. NO SPECIAL CHARACTERS (*, #, _, -). JUST PLAIN CLEAN TEXT.
  1. HUMANIZED_RESULT: Comprehensive deep-dive briefing. 
  2. AI_SUMMARY: Meta-architectural view.
  Output in JSON. Use simple language appropriate for grade ${grade}.`;

  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL, 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            humanized: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["humanized", "summary"]
        }
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      humanized: parsed.humanized || "Resolution failed.",
      summary: parsed.summary || "AI offline.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Ocean Query Error:", error);
    throw error;
  }
};

export const deepDiveQuery = async (originalQuery: string, context: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Perform an extreme technical deep dive for: "${originalQuery}". 
  Context from previous synthesis: "${context.substring(0, 1000)}".
  STRICT FORMATTING: 
  1. NO MARKDOWN (no asterisks, no hashtags, no bold symbols).
  2. NO SPECIAL CHARACTERS.
  3. JUST PLAIN TEXT.
  4. USE MULTIPLE NEWLINES TO CREATE SECTIONS.
  5. Goal: Explore edge cases and first principles with extreme depth but concise phrasing. Eliminate all memory-based fluff. Be purely application-driven.`;
  
  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: prompt,
      config: { temperature: 0.2 }
    });
    return response.text || "Deep dive failed.";
  } catch (e) { return "Nexus depth limit reached."; }
};

export const generateSpeech = async (text: string, targetLanguage: string = 'English'): Promise<AudioBuffer | null> => {
  const ai = getAI();
  try {
    const cleanText = text.replace(/[*#_~`]/g, '').substring(0, 8000); 
    const prompt = `Directly speak this text in ${targetLanguage} with natural prosody. Do not skip content. TEXT: ${cleanText}`;

    const response = await ai.models.generateContent({
      model: SPEECH_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    return await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
  } catch (error) {
    console.error("Speech Gen Error:", error);
    return null;
  }
};

export const generateFounderRemark = async (content: string, type: 'OCEAN' | 'SCENARIO'): Promise<{ remark: string, quote: string }> => {
  const ai = getAI();
  const prompt = `Analyze: ${content.substring(0, 300)}. Type: ${type}. Output JSON: { remark, quote }. Keep it sharp and visionary.`;
  try {
    const response = await ai.models.generateContent({
      model: ULTRA_LITE_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            remark: { type: Type.STRING },
            quote: { type: Type.STRING }
          },
          required: ["remark", "quote"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { remark: "Focus on application.", quote: "Synthesis is the only path." };
  }
};

export const globalChatResponse = async (message: string, history: ChatMessage[]) => {
    const ai = getAI();
    const contents = [...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: message }] }];
    const response = await ai.models.generateContent({
        model: ULTRA_LITE_MODEL, 
        contents: contents,
        config: { systemInstruction: "You are the CuriousMinds Assistant. Modern, fast, and intellectually sharp. Help users navigate engines. Be concise.", temperature: 0.5 }
    });
    return response.text;
}

export const generateAssessmentQuestions = async (details: BeYouUserDetails): Promise<string[]> => {
  const ai = getAI();
  const prompt = `Based on these details: ${JSON.stringify(details)}, generate 5 deep psychological and aptitude assessment questions to help determine their future success. Output as a JSON array of strings.`;
  
  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Assessment Questions Error:", error);
    return [
      "What is your primary motivation for pursuing this field?",
      "How do you handle complex problem-solving under pressure?",
      "What legacy do you wish to leave in your industry?",
      "How do you define personal and professional success?",
      "Which specific technological shift excites you the most?"
    ];
  }
};

export const generateBeYouPersona = async (details: BeYouUserDetails, qaPairs: {question: string, answer: string}[]): Promise<BeYouPersonaResponse> => {
  const ai = getAI();
  const prompt = `User Details: ${JSON.stringify(details)}. Assessment Answers: ${JSON.stringify(qaPairs)}. 
  Based on this, generate a highly personalized success roadmap and a persona of their 'Future Successful Self'.
  The persona includes system instructions for a chat and an initial encouraging greeting.`;

  try {
    const response = await ai.models.generateContent({
      model: SCENARIO_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmap: { type: Type.STRING },
            systemInstruction: { type: Type.STRING },
            initialGreeting: { type: Type.STRING }
          },
          required: ["roadmap", "systemInstruction", "initialGreeting"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as BeYouPersonaResponse;
  } catch (error) {
    console.error("BeYou Persona Gen Error:", error);
    throw error;
  }
};

export const chatWithPersona = async (systemInstruction: string, history: ChatMessage[], message: string): Promise<string> => {
  const ai = getAI();
  const contents = [...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: message }] }];
  try {
    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      contents: contents,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "Signal interference. Please retry.";
  } catch (error) {
    console.error("Persona Chat Error:", error);
    return "The future self node is temporarily offline.";
  }
};

export const generateMissionImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ text: `A futuristic, high-tech cinematic representation of: ${prompt}. Minimalist, dark background, cyan and purple accents.` }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (error) {
    console.error("Mission Image Gen Error:", error);
    return "";
  }
};
