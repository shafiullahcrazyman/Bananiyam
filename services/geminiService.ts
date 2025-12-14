import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { WordChallenge, HomophoneChallenge, Difficulty } from "../types";

// --- MANUAL API KEY CONFIGURATION ---
// PASTE YOUR KEYS HERE IF .ENV IS NOT WORKING
const MANUAL_API_KEYS: string[] = [
  "PASTE_YOUR_KEY_1_HERE",
  "PASTE_YOUR_KEY_2_HERE",
  "PASTE_YOUR_KEY_3_HERE",
  "PASTE_YOUR_KEY_4_HERE",
  "PASTE_YOUR_KEY_5_HERE",
];

// Helper to shuffle arrays
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- API KEY ROTATION LOGIC ---

// Helper to collect all available keys
const getAvailableKeys = () => {
  let env: any = {};
  
  // Safely try to access process.env (Standard)
  try {
    if (typeof process !== 'undefined' && process.env) {
      env = { ...env, ...process.env };
    }
  } catch (e) {}

  // Safely try to access import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      env = { ...env, ...import.meta.env };
    }
  } catch (e) {}

  // Helper to check multiple naming conventions
  const getKey = (suffix: string) => {
     return env[`API_KEY${suffix}`] || 
            env[`GEMINI_API_KEY${suffix}`] || 
            env[`VITE_API_KEY${suffix}`] || 
            env[`REACT_APP_API_KEY${suffix}`];
  };

  const envKeys = [
    getKey(''),   // API_KEY or GEMINI_API_KEY
    getKey('_2'), // API_KEY_2 or GEMINI_API_KEY_2
    getKey('_3'), // API_KEY_3 or GEMINI_API_KEY_3
    getKey('_4'), // API_KEY_4 or GEMINI_API_KEY_4
    getKey('_5')  // API_KEY_5 or GEMINI_API_KEY_5
  ];

  const allKeys = [...envKeys, ...MANUAL_API_KEYS];

  return allKeys.filter(k => 
    k && 
    typeof k === 'string' && 
    k.trim().length > 10 && 
    !k.includes("PLACEHOLDER") && 
    !k.includes("PASTE_YOUR_KEY")
  ) as string[];
};

let currentKeyIndex = 0;

// Generic Retry Wrapper
// Now strictly enforces API usage. No fallback data.
async function withRetry<T>(
    operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
    const keys = getAvailableKeys();
    
    if (keys.length === 0) {
        throw new Error("No valid API Keys available. Please check services/geminiService.ts");
    }

    let attempts = 0;
    let lastError: any;

    while (attempts < keys.length) {
        const keyIndex = (currentKeyIndex + attempts) % keys.length;
        const apiKey = keys[keyIndex];
        
        try {
            const ai = new GoogleGenAI({ apiKey });
            return await operation(ai);
        } catch (error: any) {
            console.warn(`Request failed with key index ${keyIndex}. Error: ${error.message}`);
            lastError = error;
            attempts++;
            if (keyIndex === currentKeyIndex) {
                 currentKeyIndex = (currentKeyIndex + 1) % keys.length;
            }
        }
    }
    
    throw lastError || new Error("All API keys failed.");
}


/**
 * GENERATE WORD LIST
 */
export const generateWordList = async (difficulty: Difficulty, count: number = 5, context?: string): Promise<WordChallenge[]> => {
  return withRetry(async (ai) => {
    let topics = [
      "Nature", "Technology", "Space", "History", "Art", "Science", 
      "Literature", "Music", "Geography", "Ocean", "Forest", "City Life",
      "Inventions", "Emotions", "Weather", "Architecture", "Food", "Sports"
    ];
    
    let promptContext = `Topic context: ${topics[Math.floor(Math.random() * topics.length)]}.`;
    
    if (context === 'SILENT_LETTER') {
      promptContext = "IMPORTANT: Every word generated MUST contain at least one silent letter (e.g., Knight, Island, Psychology, Comb).";
    } else if (context === 'BOSS') {
      promptContext = `Game Mode: Boss Fight (Survival). 
      Generate a set of words appropriate for the ${difficulty} difficulty level, 
      but ensure they are solid examples of that level to test the user's endurance.`;
    } else if (context) {
      promptContext = `Topic context: "${context}". 
      Generate words specifically related to the theme "${context}". 
      Explore diverse sub-topics within this theme (e.g., if "Ocean", include marine life, shipping, oceanography, myths).`;
    }

    const randomSeed = Date.now().toString() + Math.random().toString(36).substring(7);

    let vocabularyInstruction = "";
    if (difficulty === Difficulty.EASY || difficulty === Difficulty.MEDIUM) {
      vocabularyInstruction = "CRITICAL: Use COMMON, everyday English words suitable for general audiences or students. Avoid obscure, archaic, or overly technical words.";
    } else {
      vocabularyInstruction = "Use challenging, advanced, and diverse English words.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} distinct English words for a spelling bee game. 
      ${vocabularyInstruction}
      ${promptContext}
      Random seed: ${randomSeed}.
      Difficulty level: ${difficulty}.
      Include a definition and an example sentence for each word. 
      The sentence must contain the word.
      CRITICAL: Ensure words are truly random and different from previous sets. Do not output a static list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
            },
            required: ["word", "definition", "exampleSentence"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text) as WordChallenge[];
  });
};

/**
 * GENERATE DAILY CHALLENGE
 */
export const generateDailyWord = async (difficulty: Difficulty): Promise<WordChallenge[]> => {
  return withRetry(async (ai) => {
    const dateSeed = new Date().toDateString() + "-" + difficulty; 
    
    let difficultyInstruction = "It should be a moderately challenging word.";
    if (difficulty === Difficulty.EASY) difficultyInstruction = "It must be a common, simple word suitable for beginners.";
    if (difficulty === Difficulty.EXTREME) difficultyInstruction = "It must be a very rare, complex, or difficult word.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate EXACTLY ONE unique, interesting English word for the "Word of the Day".
      Seed based on this string: ${dateSeed}.
      Difficulty Level: ${difficulty}.
      ${difficultyInstruction}
      Include definition and sentence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
            },
            required: ["word", "definition", "exampleSentence"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as WordChallenge[];
  });
};

/**
 * GENERATE REMEDIAL LIST
 */
export const generateRemedialWordList = async (missedWords: string[], count: number = 5): Promise<WordChallenge[]> => {
  return withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} distinct English words for a spelling bee game.
      The user recently misspelled these words: ${missedWords.join(", ")}.
      
      Requirements:
      1. INCLUDE the misspelled words provided above in the new list (up to the limit of ${count}).
      2. Fill the rest of the list with NEW words that have similar spelling patterns to the misspelled words.
      3. Total words generated must be exactly ${count}.
      4. Include a definition and an example sentence for each word.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
            },
            required: ["word", "definition", "exampleSentence"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text) as WordChallenge[];
  });
};

/**
 * GENERATE HOMOPHONE QUESTIONS
 */
export const generateHomophones = async (difficulty: Difficulty, count: number = 5): Promise<HomophoneChallenge[]> => {
  return withRetry(async (ai) => {
    const randomSeed = Date.now().toString() + Math.random().toString(36).substring(7);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} homophone challenges for a spelling game.
      Random seed: ${randomSeed}.
      Vocabulary level: ${difficulty}.
      For Easy, use common pairs (e.g. sun/son, blue/blew).
      For Hard/Extreme, use complex pairs (e.g. stationary/stationery, complement/compliment).
      
      For each item:
      1. Create a sentence where a homophone is used, but replace the word with "_____".
      2. Provide 2 or 3 options (the correct word and its homophones).
      3. Identify the correct word.
      Example: Sentence: "I went to _____ house." Options: ["their", "there", "they're"]. Correct: "their".
      ENSURE diverse examples.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctWord: { type: Type.STRING },
              definition: { type: Type.STRING },
            },
            required: ["sentence", "options", "correctWord", "definition"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    const data = JSON.parse(text) as HomophoneChallenge[];
    return data.map(item => ({
        ...item,
        options: shuffleArray(item.options)
    }));
  });
};

/**
 * GENERATE REMEDIAL HOMOPHONES
 */
export const generateRemedialHomophones = async (missedWords: string[], count: number = 5): Promise<HomophoneChallenge[]> => {
  return withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} homophone challenges for a spelling game.
      The user previously struggled with these words (which were the correct answers): ${missedWords.join(", ")}.
      
      Requirements:
      1. Create challenges specifically targeting these missed words.
      2. If you need more to fill the count of ${count}, generate similar homophone challenges.
      3. Format: Sentence with "_____", options array, correct word, definition.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctWord: { type: Type.STRING },
              definition: { type: Type.STRING },
            },
            required: ["sentence", "options", "correctWord", "definition"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    const data = JSON.parse(text) as HomophoneChallenge[];
    return data.map(item => ({
        ...item,
        options: shuffleArray(item.options)
    }));
  });
};

/**
 * CONNECT LIVE SESSION
 */
export const connectLiveSession = async (
  onOpen: () => void,
  onMessage: (data: { audioData?: string; text?: string; turnComplete?: boolean }) => void,
  onClose: () => void,
  onError: (error: any) => void
) => {
  const keys = getAvailableKeys();
  if (keys.length === 0) {
      const err = new Error("No API Keys found");
      setTimeout(() => onError(err), 100);
      return Promise.reject(err);
  }

  let lastError;
  
  // Try keys in sequence for connection
  for (let i = 0; i < keys.length; i++) {
      const keyIndex = (currentKeyIndex + i) % keys.length;
      const apiKey = keys[keyIndex];
      
      try {
          const ai = new GoogleGenAI({ apiKey });
          const session = await ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onopen: onOpen,
                  onmessage: (message: LiveServerMessage) => {
                      const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      const turnComplete = message.serverContent?.turnComplete;
                      onMessage({ audioData, turnComplete });
                  },
                  onclose: onClose,
                  onerror: onError,
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                  },
                  systemInstruction: "You are a friendly spelling bee coach. Give the user a word to spell. Wait for them to spell it out. Then tell them if they are correct. If they ask for a hint, give a definition.",
              },
          });
          return session;
      } catch (e) {
          console.warn(`Live Connect failed with key index ${keyIndex}`, e);
          lastError = e;
          if (keyIndex === currentKeyIndex) {
              currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          }
      }
  }
  
  setTimeout(() => onError(lastError || new Error("All keys failed")), 100);
  throw lastError || new Error("All keys failed");
};

/**
 * TEST API CONNECTION
 */
export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await withRetry(async (ai) => {
      // Just a lightweight call to check if key is valid
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Ping',
      });
      return null;
    });
    return { success: true, message: "Connected to Gemini API successfully." };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to connect." };
  }
};
