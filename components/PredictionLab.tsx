
import React, { useState } from 'react';
import { MacroData, ModelType, PredictionResult, Candle } from '../types';
import { simulatePrediction, getLiveMacroData, analyzeRealTimeMarket, getTrendingNews } from '../services/geminiService';
import { getMarketHistory } from '../services/marketData';
import { useLanguage } from '../contexts/LanguageContext';
import { RSI, SMA, EMA, MACD } from 'technicalindicators';

interface PredictionLabProps {
  onPredictionComplete?: (result: PredictionResult) => void;
}

const PredictionLab: React.FC<PredictionLabProps> = ({ onPredictionComplete }) => {
  const [mode, setMode] = useState<'SIMULATION' | 'REALTIME'>('REALTIME');
  
  // Simulation State
  const [data, setData] = useState<MacroData>({
    dxy: 104.5, fedRate: 5.5, oilPrice: 78.2, inflation: 3.2
  });
  const [model, setModel] = useState<ModelType>(ModelType.XGBoost);
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { t, language } = useLanguage();

  const handlePredict = async () => {
    setLoading(true);
    try {
      let res: PredictionResult;

      if (mode === 'REALTIME') {
        // --- REAL-TIME RAG FLOW ---
        const history = getMarketHistory();
        if (history.length < 30) {
            alert(language === 'vi' ? "Chưa đủ dữ liệu nến (cần >30). Đang chờ Binance..." : "Not enough candle data (>30 needed). Waiting for Binance...");
            setLoading(false);
            return;
        }

        // 1. Calculate Indicators
        const closes = history.map(c => c.close);
        const rsiVal = RSI.calculate({ values: closes, period: 14 }).pop() || 50;
        const macdVal = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false }).pop() || { MACD: 0, signal: 0, histogram: 0 };
        const smaVal = SMA.calculate({ values: closes, period: 20 }).pop() || 0;
        const emaVal = EMA.calculate({ values: closes, period: 50 }).pop() || 0;

        const indicators = {
            rsi: rsiVal,
            macd: { macd: macdVal.MACD || 0, signal: macdVal.signal || 0, histogram: macdVal.histogram || 0 },
            sma20: smaVal,
            ema50: emaVal,
            currentPrice: closes[closes.length - 1]
        };

        // 2. Get News Context
        const news = await getTrendingNews(language);

        // 3. Call RAG Service
        res = await analyzeRealTimeMarket(history, indicators, news, language);

      } else {
        // --- SIMULATION FLOW ---
        res = await simulatePrediction(model, data, language);
      }

      setResult(res);
      if (onPredictionComplete) {
        onPredictionComplete(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const liveData = await getLiveMacroData();
      setData(liveData);
    } catch (e) {
      console.error("Failed to sync", e);
    } finally {
      setSyncing(false);
    }
  };

  const SliderInput = ({ label, val, min, max, step, onChange, unit }: any) => (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
        <span>{label}</span>
        <span className="text-yellow-500 font-mono">{val}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={val} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
      />
    </div>
  );

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 shadow-lg flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>

      {/* Header & Mode Switch */}
      <div className="flex justify-between items-center mb-5 relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
           {mode === 'REALTIME' ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 12v.01"/><path d="M12 16v.01"/></svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
           )}
           {mode === 'REALTIME' ? 'Live RAG Analyst' : t('scenario_simulator')}
        </h3>
        
        <div className="flex bg-slate-900 rounded p-0.5 border border-slate-700">
           <button 
             onClick={() => setMode('REALTIME')}
             className={`px-2 py-1 text-[10px] rounded ${mode === 'REALTIME' ? 'bg-red-900/50 text-red-200 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
           >
             LIVE
           </button>
           <button 
             onClick={() => setMode('SIMULATION')}
             className={`px-2 py-1 text-[10px] rounded ${mode === 'SIMULATION' ? 'bg-yellow-900/50 text-yellow-200 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
           >
             SIM
           </button>
        </div>
      </div>

      {/* Content based on Mode */}
      {mode === 'SIMULATION' ? (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-2">
            <button onClick={handleSyncData} disabled={syncing} className="text-[10px] text-blue-400 hover:underline">
                {syncing ? t('syncing') : t('reset_live')}
            </button>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-5 relative z-10">
            <p className="text-[10px] text-slate-400 mb-3 italic">{t('adjust_sliders')}</p>
            <SliderInput label={t('dxy_index')} val={data.dxy} min={95} max={115} step={0.1} unit="" onChange={(v: number) => setData({...data, dxy: v})} />
            <SliderInput label={t('fed_rate')} val={data.fedRate} min={0} max={10} step={0.25} unit="%" onChange={(v: number) => setData({...data, fedRate: v})} />
            <SliderInput label={t('oil_price')} val={data.oilPrice} min={50} max={120} step={1} unit="$" onChange={(v: number) => setData({...data, oilPrice: v})} />
            <SliderInput label={t('inflation')} val={data.inflation} min={0} max={10} step={0.1} unit="%" onChange={(v: number) => setData({...data, inflation: v})} />
          </div>
          <div className="mb-5 relative z-10">
             <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">{t('model_arch')}</label>
             <select value={model} onChange={(e) => setModel(e.target.value as ModelType)} className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-white text-sm outline-none">
                {Object.values(ModelType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800/50 mb-5 text-sm text-slate-400 space-y-3 animate-fade-in relative z-10">
            <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <strong>Data Source:</strong> Binance WebSocket (PAXG)
            </p>
            <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <strong>Strategy:</strong> RAG (Retrieval-Augmented)
            </p>
            <p className="text-xs italic opacity-70 border-t border-slate-700 pt-2">
                {language === 'vi' ? 
                 "Hệ thống sẽ tổng hợp 30 nến gần nhất, tính toán RSI/MACD thực tế và quét tin tức nóng để đưa ra dự đoán." : 
                 "System aggregates last 30 candles, calculates real RSI/MACD, and scans breaking news to generate prediction."}
            </p>
        </div>
      )}

      <button 
        onClick={handlePredict}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold text-slate-900 transition-all text-sm uppercase tracking-wide relative z-10 ${
          loading ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-yellow-400 hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
        }`}
      >
        {loading ? t('running') : mode === 'REALTIME' ? (language === 'vi' ? 'Phân Tích Dữ Liệu Thực' : 'Analyze Live Market') : t('run_simulation')}
      </button>

      {result && (
        <div className="mt-5 pt-5 border-t border-slate-700 animate-fade-in flex-1 flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">{t('forecast')}</span>
              <span className={`text-xl font-bold ${
                result.trend === 'BULLISH' ? 'text-green-400' : 
                result.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {t(result.trend)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">{t('projected')}</span>
              <span className="text-white font-mono text-lg">{result.predictedPriceChange}</span>
            </div>
          </div>
          
          <div className="mb-4">
             <div className="flex justify-between text-[10px] text-slate-400 mb-1">
               <span>{t('probability')}</span>
               <span>{result.confidence}%</span>
             </div>
             <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${result.trend === 'BULLISH' ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-300 leading-relaxed border border-slate-800 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
            {result.reasoning}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionLab;
