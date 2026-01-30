
export enum ModelType {
  ARIMA = 'ARIMA (Linear)',
  XGBoost = 'XGBoost (Non-linear)',
  LSTM = 'LSTM (Deep Learning)'
}

export type Language = 'en' | 'vi';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalAnalysis {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  sma20: number;
  ema50: number;
  currentPrice: number;
}

export interface PredictionResult {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  predictedPriceChange: string;
  reasoning: string;
  keyFactors: string[];
}

export interface NewsSentiment {
  score: number; // -100 to 100
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  analysis: string;
}

export interface MarketContext {
  summary: string;
  sources: { title: string; uri: string }[];
}

export interface MacroData {
  dxy: number;
  fedRate: number;
  oilPrice: number;
  inflation: number;
}

export interface EconomicEvent {
  id: string;
  date: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast: string;
  aiAnalysis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
