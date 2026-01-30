
import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { ModelType, PredictionResult, NewsSentiment, MarketContext, MacroData, EconomicEvent, Language, Candle, TechnicalAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJSON = <T>(text: string): T => {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Text:", text);
    throw e;
  }
};

export const getLiveMarketContext = async (language: Language = 'en'): Promise<MarketContext> => {
  const ai = getAI();
  try {
    const prompt = language === 'vi' 
      ? "Giá Vàng (XAU/USD) hiện tại là bao nhiêu và 3 tin tức chính nào đang ảnh hưởng đến nó? Trả lời tóm tắt bằng Tiếng Việt."
      : "What is the current Gold Price (XAU/USD) today and what are the top 3 major news headlines affecting it right now? Answer in English.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text || (language === 'vi' ? "Không thể lấy dữ liệu trực tuyến." : "Unable to fetch live data.");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .map(c => c.web ? { title: c.web.title || 'Source', uri: c.web.uri || '#' } : null)
      .filter((s): s is { title: string; uri: string } => s !== null)
      .slice(0, 3);

    return { summary, sources };
  } catch (error) {
    console.error("Market Context Error:", error);
    return { summary: language === 'vi' ? "Dữ liệu trực tuyến không khả dụng." : "Live market context unavailable.", sources: [] };
  }
};

export const getLiveMacroData = async (): Promise<MacroData> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the current real-time values for: USD Index (DXY), US Fed Funds Rate, WTI Crude Oil Price, and latest US CPI Inflation Rate (YoY). Return ONLY a raw JSON object.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                dxy: {type: Type.NUMBER},
                fedRate: {type: Type.NUMBER},
                oilPrice: {type: Type.NUMBER},
                inflation: {type: Type.NUMBER}
            },
            required: ["dxy", "fedRate", "oilPrice", "inflation"]
        }
      }
    });

    if (response.text) {
      return parseJSON<MacroData>(response.text);
    }
    throw new Error("No text response");
  } catch (error) {
    console.error("Macro Fetch Error:", error);
    return { dxy: 104.0, fedRate: 5.5, oilPrice: 75.0, inflation: 3.2 };
  }
};

export const analyzeRealTimeMarket = async (
  candles: Candle[],
  indicators: TechnicalAnalysis,
  news: string[],
  language: Language = 'en'
): Promise<PredictionResult> => {
  const ai = getAI();

  const recentCandles = candles.slice(-30).map(c => 
    `Time: ${new Date(c.time).toLocaleTimeString()} | Close: ${c.close}`
  ).join('\n');

  const langInstruction = language === 'vi' 
    ? "Return 'reasoning' and 'keyFactors' in VIETNAMESE." 
    : "Return output in English.";

  const prompt = `
    Act as a professional Gold Analyst.
    
    === MARKET DATA ===
    Last 30 Candles (1m):
    ${recentCandles}

    === INDICATORS ===
    - Price: ${indicators.currentPrice}
    - RSI: ${indicators.rsi.toFixed(2)}
    - MACD: ${indicators.macd.macd.toFixed(4)}
    - SMA20: ${indicators.sma20.toFixed(2)}

    === NEWS ===
    ${news.join('\n- ')}

    Predict the Gold price trend for the next few hours.
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            confidence: { type: Type.NUMBER },
            predictedPriceChange: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            keyFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["trend", "confidence", "predictedPriceChange", "reasoning", "keyFactors"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PredictionResult;
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      trend: "NEUTRAL",
      confidence: 0,
      predictedPriceChange: "0%",
      reasoning: "Analysis failed.",
      keyFactors: ["Error"]
    };
  }
};

const executeTradeTool: FunctionDeclaration = {
  name: "executeTrade",
  description: "Executes a trade order for Gold.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, enum: ["BUY", "SELL"] },
      amount: { type: Type.NUMBER, description: "oz" },
    },
    required: ["action", "amount"]
  }
};

export const chatWithAnalyst = async (
  message: string, 
  context: any, 
  language: Language = 'en',
  onTradeExecution?: (action: string, amount: number) => string
): Promise<string> => {
  const ai = getAI();
  const tools: Tool[] = [{ functionDeclarations: [executeTradeTool] }];

  const systemPrompt = `You are 'Aura', a senior analyst. Context: ${JSON.stringify(context)}. Language: ${language}.`;

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemPrompt,
        tools: tools,
      }
    });

    const result = await chat.sendMessage({ message: message });
    const call = result.functionCalls?.[0];
    
    if (call && call.name === "executeTrade" && onTradeExecution) {
      const tradeResult = onTradeExecution(call.args.action as string, call.args.amount as number);
      const toolResponse = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: "executeTrade",
            response: { result: tradeResult },
            id: call.id
          }
        }]
      });
      return toolResponse.text || "Trade executed.";
    }

    return result.text || "...";
  } catch (error) {
    return language === 'vi' ? "Lỗi kết nối." : "Connection error.";
  }
};

export const simulatePrediction = async (
  modelType: ModelType,
  data: MacroData,
  language: Language
): Promise<PredictionResult> => {
  const isBullish = data.dxy < 103 || data.inflation > 2.5;
  return {
    trend: isBullish ? 'BULLISH' : 'BEARISH',
    confidence: 82,
    predictedPriceChange: isBullish ? "+0.85%" : "-0.45%",
    reasoning: language === 'vi' 
        ? `Mô hình ${modelType} dự báo dựa trên biến động vĩ mô (DXY, CPI).` 
        : `${modelType} model prediction based on macro variables.`,
    keyFactors: ["Macro Correlation", "Technical Support"]
  };
};

export const analyzeNewsImpact = async (text: string, language: Language = 'en'): Promise<NewsSentiment> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze sentiment: "${text}". Language: ${language}`,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            impact: { type: Type.STRING, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
            analysis: { type: Type.STRING }
          },
          required: ["score", "impact", "analysis"]
        }
      }
    });
    if (response.text) return parseJSON<NewsSentiment>(response.text);
    throw new Error("Empty");
  } catch (e) {
    return { score: 0, impact: 'NEUTRAL', analysis: "Analysis error." };
  }
};

export const getTrendingNews = async (language: Language = 'en'): Promise<string[]> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find 5 latest news headlines affecting Gold price. Language: ${language}`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        if (response.text) return parseJSON<string[]>(response.text);
        return [];
    } catch (e) {
        return ["Central Banks buying gold", "Inflation data pending", "Geopolitical risks"];
    }
};

export const getEconomicEvents = async (language: Language = 'en'): Promise<EconomicEvent[]> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
             model: "gemini-3-flash-preview",
             contents: `List 3 high-impact US economic events this week. Language: ${language}`,
             config: {
                 tools: [{ googleSearch: {} }],
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                             id: { type: Type.STRING },
                             date: { type: Type.STRING },
                             event: { type: Type.STRING },
                             impact: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                             forecast: { type: Type.STRING },
                             aiAnalysis: { type: Type.STRING }
                         },
                         required: ["id", "date", "event", "impact", "forecast", "aiAnalysis"]
                     }
                 }
             }
        });
        if (response.text) return parseJSON<EconomicEvent[]>(response.text);
        return [];
    } catch (e) {
        return [];
    }
};
