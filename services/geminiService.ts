
import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { CourseModule, DashboardData, ApiKey } from "../types";
import { saveApiKey, deleteApiKey } from "./firestoreService";

// --- API Key Management System ---

class KeyManager {
  private keys: ApiKey[] = [];
  private currentKeyIndex: number = 0;

  constructor() {
    // Initial load from local storage as fallback, but main source will be injected
    this.loadKeys();
  }

  private loadKeys() {
    try {
      const stored = localStorage.getItem('umkm_api_keys');
      if (stored) {
        this.keys = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load local keys", e);
    }
  }

  // Method to update keys from Firestore listener
  public setKeys(newKeys: ApiKey[]) {
      this.keys = newKeys;
      this.currentKeyIndex = 0;
  }

  public getActiveKey(): string {
    // 1. Try User Keys
    if (this.keys.length > 0) {
      const validKeys = this.keys.filter(k => k.isActive && k.isValid);
      if (validKeys.length > 0) {
          if (this.currentKeyIndex >= validKeys.length) {
            this.currentKeyIndex = 0;
          }
          return validKeys[this.currentKeyIndex].key;
      }
    }
    // 2. Fallback to Env
    return process.env.API_KEY || '';
  }

  public rotateKey(): boolean {
    const validKeys = this.keys.filter(k => k.isActive && k.isValid);
    if (validKeys.length <= 1) return false; 
    
    this.currentKeyIndex = (this.currentKeyIndex + 1) % validKeys.length;
    console.log(`Rotating to API Key Index: ${this.currentKeyIndex}`);
    return true;
  }

  public getKeys(): ApiKey[] {
    return this.keys;
  }

  public addKey(key: string, label: string) {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      key,
      label,
      addedAt: Date.now(),
      isActive: true,
      isValid: true
    };
    this.keys.push(newKey);
    saveApiKey(newKey).catch(console.error);
  }

  public removeKey(id: string) {
    this.keys = this.keys.filter(k => k.id !== id);
    deleteApiKey(id).catch(console.error);
  }
}

export const keyManager = new KeyManager();

// --- Client Factory ---

const getClient = () => {
  const apiKey = keyManager.getActiveKey();
  if (!apiKey) {
    // throw new Error("No API Key available. Please add a key in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Verifies if an API key is valid by making a lightweight call.
 * Returns true if valid (even if quota exceeded 429), false if invalid.
 */
export const verifyApiKey = async (key: string): Promise<boolean> => {
  try {
    const tempAI = new GoogleGenAI({ apiKey: key });
    await tempAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'ping',
    });
    return true;
  } catch (error: any) {
    // Check if it's a quota error (429). If so, the key is technically valid (auth passed), just out of quota.
    // We want to allow saving these keys so rotation can use them later or when quota resets.
    const isQuotaError = 
        error.toString().includes('429') || 
        error.status === 429 || 
        error.code === 429 ||
        error.message?.includes('quota') || 
        error.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError) {
        console.warn("Key verified but has exceeded quota (429). Treating as valid for storage.");
        return true;
    }

    console.error("Key Verification Failed (Invalid):", error);
    return false;
  }
};

/**
 * Smart Wrapper to handle Quota Exhaustion (429) by rotating keys
 */
async function executeWithRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  const maxAttempts = Math.max(1, keyManager.getKeys().length + 1); // Try all keys + env
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const ai = getClient();
      return await operation(ai);
    } catch (error: any) {
      lastError = error;
      
      // Check for Quota Exceeded (429) or other retryable errors
      const isQuotaError = error.toString().includes('429') || error.status === 429 || error.message?.includes('quota');
      
      if (isQuotaError) {
        console.warn(`Quota exceeded for current key. Attempting rotation... (Attempt ${attempt + 1}/${maxAttempts})`);
        const rotated = keyManager.rotateKey();
        if (!rotated) throw error; // No other keys to try
      } else {
        throw error; // Not a quota error, throw immediately
      }
    }
  }
  throw lastError;
}

// System instructions for the general consultant
const getConsultantInstruction = (language: string) => `
You are "Rumah UMKM AI", an advanced business consultant specifically designed to help Micro, Small, and Medium Enterprises (MSMEs).

**IDENTITY & MEMORY:**
- **Name:** Rumah UMKM AI
- **Creator:** Osman Ghani (Instagram: @ziddi.heart.143)
- **Mission:** To educate, mentor, and empower MSMEs with business insights, marketing tools, and personalized learning paths.

**WHAT YOU CAN DO:**
1. **Strategic Consulting:** Provide actionable advice on operations, finance, and strategy.
2. **Business Simulation:** Run deep 5-layer agentic simulations for market analysis and financial forecasting.
3. **Education:** Generate personalized, MBA-level business curriculums and lessons.
4. **Marketing:** Create viral marketing copy and content strategies for various platforms.

**BEHAVIORAL GUIDELINES:**
- Your tone should be encouraging, professional, yet accessible.
- If asked "Who are you?" or "Who created you?", strictly use the information in the "IDENTITY & MEMORY" section.
- IMPORTANT: You MUST reply in ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
`;

/**
 * Chat with the AI Business Consultant (Standard Mode)
 */
export const createChatSession = (language: 'en' | 'id') => {
  const ai = getClient(); // Uses active key
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getConsultantInstruction(language),
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
};

/**
 * Auto-generate a title for a chat session based on the first user message
 */
export const generateChatTitle = async (message: string, language: 'en' | 'id'): Promise<string> => {
  return executeWithRetry(async (ai) => {
    try {
      const langInstruction = language === 'id' ? 'Indonesian' : 'English';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a very short, punchy title (max 4 words) for a conversation starting with this message: "${message}". 
        The title must be in ${langInstruction}. Do not use quotes. Return only the title.`,
      });
      return response.text?.trim() || (language === 'id' ? 'Percakapan Baru' : 'New Conversation');
    } catch (error) {
      return language === 'id' ? 'Percakapan Baru' : 'New Conversation';
    }
  });
};

// Helper to determine source authority score
const getSourceScore = (uri: string): number => {
    const u = uri.toLowerCase();
    if (u.includes('.gov') || u.includes('.go.')) return 4; // High Priority (Gov)
    if (u.includes('.edu') || u.includes('.ac.')) return 3; // High Priority (Academic)
    if (u.includes('.org') || u.includes('.int')) return 2; // Medium Priority (Org)
    return 1; // General Commercial
};

/**
 * 5-Layer Agentic Workflow with Web Search
 */
export const runAgenticWorkflow = async (
  userMessage: string, 
  language: 'en' | 'id',
  onStepChange: (step: string) => void,
  signal?: AbortSignal
): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
  
  return executeWithRetry(async (ai) => {
      const model = 'gemini-2.5-flash';
      const langName = language === 'id' ? 'Indonesian' : 'English';

      const checkAbort = () => {
          if (signal?.aborted) throw new DOMException("Aborted by user", "AbortError");
      };

      checkAbort();

      // LAYER 1: INPUT UNDERSTANDING & ENHANCEMENT
      onStepChange(language === 'id' ? "LAYER 1/5: ANALISIS_SEMANTIK... MEMPERJELAS_MAKSUD" : "LAYER 1/5: SEMANTIC_CORE_ACTIVE... ENHANCING_USER_INTENT");
      const enhancementResponse = await ai.models.generateContent({
          model,
          contents: `Act as a Senior Business Analyst. Your task is to refine the user's raw input into a highly structured, professional business query. 
          
          User Input: "${userMessage}"
          
          1. Identify the core business intent (e.g., Market Research, Financial Analysis, Strategic Planning).
          2. Expand with relevant business terminology.
          3. Make it specific and actionable.
          
          Return ONLY the refined, enhanced prompt text in English (for better search results).`,
      });
      const enhancedPrompt = enhancementResponse.text?.trim() || userMessage;

      checkAbort();

      // LAYER 2: STRATEGY & QUERY OPTIMIZATION
      onStepChange(language === 'id' ? "LAYER 2/5: PENYELARASAN_STRATEGI... GENERASI_VEKTOR_PENCARIAN" : "LAYER 2/5: STRATEGIC_ALIGNMENT... GENERATING_SEARCH_VECTORS");
      const strategyResponse = await ai.models.generateContent({
        model,
        contents: `Context: "${enhancedPrompt}". 
        Generate a single, highly effective Google Search query to retrieve authoritative data for this request. 
        Prioritize official sources, government reports, and industry analysis.
        Return ONLY the query text.`,
      });
      const searchQuery = strategyResponse.text?.trim() || enhancedPrompt;

      checkAbort();

      // LAYER 3: RETRIEVAL (GOOGLE SEARCH) & SOURCE PRIORITIZATION
      onStepChange(language === 'id' ? `LAYER 3/5: TAUTAN_GLOBAL... PINDAI_NODE: [${searchQuery}]` : `LAYER 3/5: GLOBAL_UPLINK... SCANNING_NODES: [${searchQuery}]`);
      
      let searchResponse;
      let sources: { title: string; uri: string }[] = [];
      
      try {
          searchResponse = await ai.models.generateContent({
            model,
            contents: `Search query: ${searchQuery}. Find comprehensive, official, and up-to-date details.`,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          // Extract & Sort Sources
          const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (groundingChunks) {
              groundingChunks.forEach((chunk: any) => {
                  if (chunk.web) {
                      sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                  }
              });
          }
          sources.sort((a, b) => getSourceScore(b.uri) - getSourceScore(a.uri));
      
      } catch (searchError) {
          console.warn("Search tool failed, falling back to internal knowledge", searchError);
          searchResponse = await ai.models.generateContent({
            model,
            contents: `Context: "${enhancedPrompt}". Provide comprehensive details based on your internal knowledge base regarding: ${searchQuery}.`,
          });
      }

      const rawData = searchResponse.text;

      checkAbort();

      // LAYER 4: ANALYSIS & FACT CHECKING
      onStepChange(language === 'id' ? "LAYER 4/5: PEMROSESAN_DATA... VALIDASI_FAKTA" : "LAYER 4/5: PROCESSING_DATA_STREAMS... CROSS_VALIDATING_FACTS");
      const analysisResponse = await ai.models.generateContent({
        model,
        contents: `Analyze the following data based on the refined request: "${enhancedPrompt}".
        
        Data:
        ${rawData}

        Task:
        1. Extract key facts.
        2. Verify consistency.
        3. Discard irrelevant info.
        
        Output a structured summary of verified facts.`,
      });
      const facts = analysisResponse.text;

      checkAbort();

      // LAYER 5: SYNTHESIS & FINAL POLISH
      onStepChange(language === 'id' ? "LAYER 5/5: SINTESIS_LAPORAN... FINALISASI_OUTPUT" : "LAYER 5/5: SYNTHESIZING_STRATEGIC_REPORT... FINALIZING_OUTPUT");
      const finalResponse = await ai.models.generateContent({
        model,
        contents: `You are "Rumah UMKM AI", created by Osman Ghani.
        
        Original Intent: "${userMessage}"
        Refined Context: "${enhancedPrompt}"
        Verified Market Data:
        ${facts}
        
        Write a comprehensive, professional response in **${langName}**.
        - Use professional formatting (Bold, Lists).
        - Be direct and high-value.
        - Cite the "Verified Market Data" implicitly in your advice.
        - If the Original Intent asks about your identity/creator, explicitly state: "I am Rumah UMKM AI, created by Osman Ghani."
        - Ensure the output is strictly in ${langName}.`,
      });

      return {
        text: finalResponse.text || "I apologize, I could not synthesize a final answer.",
        sources: sources
      };
  });
};

/**
 * Generate a personalized curriculum for a specific business type
 */
export const generateCurriculum = async (businessType: string, skillLevel: string, language: 'en' | 'id'): Promise<CourseModule[]> => {
  return executeWithRetry(async (ai) => {
      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            moduleTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["moduleTitle", "description", "duration", "keyTakeaways"],
          propertyOrdering: ["moduleTitle", "description", "duration", "keyTakeaways"]
        }
      };

      const langName = language === 'id' ? 'Indonesian' : 'English';
      const prompt = `Create a 5-module educational curriculum for a user running a "${businessType}" business at a "${skillLevel}" skill level. Focus on practical, actionable business skills.
      IMPORTANT: The content of JSON (titles, descriptions, etc) MUST be in ${langName}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as CourseModule[];
  });
};

/**
 * Generate detailed content for a specific lesson module
 */
export const generateLessonContent = async (moduleTitle: string, businessType: string, language: 'en' | 'id'): Promise<string> => {
  return executeWithRetry(async (ai) => {
      const langName = language === 'id' ? 'Indonesian' : 'English';
      const prompt = `
        You are an expert business instructor. 
        Create a comprehensive lesson for the module "${moduleTitle}" specifically tailored for a "${businessType}" business.
        
        Structure the lesson with:
        1. **Introduction**: Why this matters.
        2. **Core Concepts**: Detailed explanation.
        3. **Real-world Example**: A scenario relevant to a ${businessType}.
        4. **Actionable Steps**: 3-5 things the user can do today.
        5. **Mini Quiz**: 1 simple question to test understanding.
        
        Use Markdown formatting. Use **bold** for emphasis and lists for steps.
        IMPORTANT: Write the entire lesson in ${langName}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Failed to generate lesson content.";
  });
};

/**
 * Generate marketing copy
 */
export const generateMarketingCopy = async (productName: string, platform: string, targetAudience: string, language: 'en' | 'id'): Promise<string> => {
  return executeWithRetry(async (ai) => {
      const langName = language === 'id' ? 'Indonesian' : 'English';
      const prompt = `Write a compelling marketing copy for a product named "${productName}". 
      Platform: ${platform}. 
      Target Audience: ${targetAudience}. 
      Include emojis where appropriate and a call to action. Return only the ad text.
      IMPORTANT: Write the copy in ${langName}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Could not generate copy.";
  });
};

/**
 * 5-Layer Agentic Dashboard Generation with Real-Time Data
 */
export const generateDashboardData = async (
    businessDescription: string,
    language: 'en' | 'id',
    onStepChange?: (step: string) => void,
    signal?: AbortSignal
): Promise<DashboardData | null> => {
  
  return executeWithRetry(async (ai) => {
      const model = 'gemini-2.5-flash';
      const langName = language === 'id' ? 'Indonesian' : 'English';

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          revenueHistory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                revenue: { type: Type.NUMBER },
                expenses: { type: Type.NUMBER }
              }
            }
          },
          customerHistory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                customers: { type: Type.NUMBER }
              }
            }
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              totalRevenue: { type: Type.STRING },
              revenueGrowth: { type: Type.STRING },
              activeCustomers: { type: Type.STRING },
              customerGrowth: { type: Type.STRING },
              satisfaction: { type: Type.STRING },
              aiInsight: { type: Type.STRING }
            }
          }
        },
        required: ["revenueHistory", "customerHistory", "metrics"]
      };

      const checkAbort = () => {
        if (signal?.aborted) throw new DOMException("Aborted by user", "AbortError");
      };

      checkAbort();

      // LAYER 1: STRATEGY
      onStepChange?.(language === 'id' ? "PROTOKOL_STRATEGI... IDENTIFIKASI_SEKTOR_PASAR" : "INIT_STRATEGY_PROTOCOL... IDENTIFYING_MARKET_SECTOR");
      const strategyPrompt = `I need to run a business simulation for: "${businessDescription}".
      Generate a single specific Google Search query to find financial benchmarks, average revenue, and growth trends for this specific business type and location (if specified). 
      Return ONLY the query.`;
      
      const strategyResponse = await ai.models.generateContent({ model, contents: strategyPrompt });
      const query = strategyResponse.text?.trim() || businessDescription + " business benchmarks";

      checkAbort();

      // LAYER 2: RETRIEVAL (SEARCH)
      onStepChange?.(language === 'id' ? `AGEN_PENCARIAN_AKTIF... TARGET: [${query}]` : `SEARCH_AGENT_DEPLOYED... TARGET: [${query}]`);
      
      let searchData = "";
      let sources: { title: string; uri: string }[] = [];

      try {
          const searchResponse = await ai.models.generateContent({
              model,
              contents: `Find financial data for: ${query}`,
              config: { tools: [{ googleSearch: {} }] }
          });

          // Extract & Sort Sources
          const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (groundingChunks) {
              groundingChunks.forEach((chunk: any) => {
                  if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
              });
          }
          sources.sort((a, b) => getSourceScore(b.uri) - getSourceScore(a.uri));
          searchData = searchResponse.text || "";
      } catch (searchError) {
          console.warn("Dashboard search failed, using internal simulation", searchError);
          searchData = "Simulate realistic financial data based on typical industry standards for this business type.";
      }

      checkAbort();

      // LAYER 3: EXTRACTION
      onStepChange?.(language === 'id' ? "PARSING_DATA... EKSTRAKSI_VEKTOR_KEUANGAN" : "PARSING_UNSTRUCTURED_DATA... EXTRACTING_FINANCIAL_VECTORS");
      const extractionPrompt = `Analyze this data: 
      ${searchData}
      
      Extract or estimate:
      1. Average monthly revenue range.
      2. Typical profit margins.
      3. Customer growth trends.
      
      Return a short summary of these parameters.`;
      
      const extractionResponse = await ai.models.generateContent({ model, contents: extractionPrompt });
      const benchmarks = extractionResponse.text;

      checkAbort();

      // LAYER 5: GENERATION
      onStepChange?.(language === 'id' ? "MEMBANGUN_MATRIKS_SIMULASI... GENERASI_PROYEKSI_12_BULAN" : "BUILDING_SIMULATION_MATRIX... GENERATING_12_MONTH_PROJECTION");
      const finalPrompt = `
        Generate realistic 12-MONTH business performance data (Jan to Dec, or rolling 12 months) for: "${businessDescription}".
        You MUST provide exactly 12 data points for 'revenueHistory' and 'customerHistory'.
        
        Use these real-world benchmarks to constrain your simulation:
        ${benchmarks}
        
        Rules:
        - 'aiInsight' MUST be written in ${langName} and cite the specific market trend found in the benchmarks.
        - 'metrics.totalRevenue' should be formatted as string with currency symbols appropriate for the region (e.g. IDR for Indonesia, $ for others).
        - 'metrics.activeCustomers', 'metrics.satisfaction' should be localized numbers.
        - Month names in 'revenueHistory' should be in ${langName} (e.g. 'Januari', 'Februari' if Indonesian).
      `;

      const finalResponse = await ai.models.generateContent({
        model,
        contents: finalPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
      });

      const text = finalResponse.text;
      if (!text) return null;
      
      const data = JSON.parse(text) as DashboardData;
      // Attach sources to the data object
      data.simulationSources = sources;
      
      return data;
  });
};
