
import React, { useMemo, useState, useEffect } from 'react';
import { 
  ComposedChart, Line, Area, BarChart, Bar, Cell, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { PredictionResult, Candle } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeToMarketData } from '../services/marketData';
import { RSI, SMA, EMA, MACD, ATR } from 'technicalindicators';

type SignalType = 'BUY' | 'SELL' | 'NEUTRAL' | 'VOLATILE';

interface HistoryEntry {
  date: string;
  signal: SignalType;
  value: string;
}

interface Indicator {
  name: string;
  value: string;
  signal: SignalType;
  color: string;
  desc: string;
  history: HistoryEntry[];
}

interface TechnicalIndicatorsProps {
  prediction: PredictionResult | null;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ prediction }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [history, setHistory] = useState<Candle[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = subscribeToMarketData((_, fullHistory) => {
      setHistory(fullHistory);
    });
    return () => unsubscribe();
  }, []);

  // Calculate Indicators based on Real History
  const indicators: Indicator[] = useMemo(() => {
    if (history.length < 50) return []; // Need enough data

    const closes = history.map(c => c.close);
    const highs = history.map(c => c.high);
    const lows = history.map(c => c.low);

    // 1. RSI (14)
    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const currentRSI = rsiValues[rsiValues.length - 1] || 50;
    let rsiSignal: SignalType = 'NEUTRAL';
    if (currentRSI > 70) rsiSignal = 'SELL';
    else if (currentRSI < 30) rsiSignal = 'BUY';

    // 2. SMA (20)
    const smaValues = SMA.calculate({ values: closes, period: 20 });
    const currentSMA = smaValues[smaValues.length - 1] || 0;
    const currentPrice = closes[closes.length - 1];
    const smaSignal: SignalType = currentPrice > currentSMA ? 'BUY' : 'SELL';

    // 3. EMA (50)
    const emaValues = EMA.calculate({ values: closes, period: 50 });
    const currentEMA = emaValues[emaValues.length - 1] || 0;
    const emaSignal: SignalType = currentPrice > currentEMA ? 'BUY' : 'SELL';

    // 4. MACD (12, 26, 9)
    const macdValues = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const currentMACD = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
    const macdSignal: SignalType = (currentMACD.histogram || 0) > 0 ? 'BUY' : 'SELL';

    // 5. ATR (14)
    const atrValues = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
    const currentATR = atrValues[atrValues.length - 1] || 0;
    const atrSignal: SignalType = currentATR > 5 ? 'VOLATILE' : 'NEUTRAL'; // Threshold is arbitrary for demo

    return [
      { 
        name: 'RSI (14)', 
        value: currentRSI.toFixed(1), 
        signal: rsiSignal, 
        color: 'text-slate-400', 
        desc: 'Relative Strength', 
        history: [] // Populate if needed
      },
      { 
        name: 'SMA (20)', 
        value: currentSMA.toFixed(2), 
        signal: smaSignal, 
        color: 'text-green-400', 
        desc: 'Simple Moving Avg',
        history: []
      },
      { 
        name: 'EMA (50)', 
        value: currentEMA.toFixed(2), 
        signal: emaSignal, 
        color: 'text-green-400', 
        desc: 'Exponential Moving Avg',
        history: []
      },
      { 
        name: 'MACD (12,26)', 
        value: (currentMACD.MACD || 0).toFixed(2), 
        signal: macdSignal, 
        color: 'text-red-400', 
        desc: 'Conv/Divergence',
        history: []
      },
      { 
        name: 'ATR (14)', 
        value: currentATR.toFixed(2), 
        signal: atrSignal, 
        color: 'text-yellow-400', 
        desc: 'Average True Range',
        history: []
      }
    ];
  }, [history]);

  // Chart data for visualization (last 50 points)
  const chartData = useMemo(() => {
    if (history.length < 50) return [];
    
    const closes = history.map(c => c.close);
    const smaValues = SMA.calculate({ values: closes, period: 20 });
    const emaValues = EMA.calculate({ values: closes, period: 50 });

    // Align arrays (indicators are shorter than price history)
    const diffSMA = closes.length - smaValues.length;
    const diffEMA = closes.length - emaValues.length;

    return history.slice(-30).map((c, i) => {
       // Re-map index to full array
       const fullIndex = history.length - 30 + i;
       return {
         time: new Date(c.time).toLocaleTimeString(),
         price: c.close,
         sma: fullIndex >= diffSMA ? smaValues[fullIndex - diffSMA] : null,
         ema: fullIndex >= diffEMA ? emaValues[fullIndex - diffEMA] : null,
       };
    });

  }, [history]);

  const getSignalColor = (signal: SignalType) => {
    switch(signal) {
      case 'BUY': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'SELL': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'VOLATILE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const consensus = prediction ? prediction.trend : 'NEUTRAL';
  const consensusColor = consensus === 'BULLISH' ? 'text-green-400' : consensus === 'BEARISH' ? 'text-red-400' : 'text-yellow-400';

  if (history.length === 0) {
      return (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex items-center justify-center">
              <span className="text-slate-500 animate-pulse text-xs">Waiting for Real-time Data...</span>
          </div>
      );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full relative flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          {t('tech_indicators')}
        </h3>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs text-slate-400">Calculated Live</span>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 mb-4 -mt-2">Real-time indicators based on PAXG/USDT (Gold) stream.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {indicators.map((ind, i) => (
            <div 
              key={i} 
              // onClick={() => setSelectedIndicator(ind)} // Simplified for now
              className="group relative cursor-default bg-slate-900/40 p-4 rounded-lg border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{ind.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSignalColor(ind.signal)}`}>
                   {ind.signal}
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-200 mb-1">{ind.value}</div>
              <div className="text-[10px] text-slate-500 truncate">{ind.desc}</div>
            </div>
        ))}
      </div>

      <div className="w-full bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 flex-1 min-h-[150px]">
        <h4 className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">{t('trend_analysis')}</h4>
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorPriceIndicator" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
                
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#facc15" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPriceIndicator)" 
                  name={t('price')}
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="sma" 
                  stroke="#4ade80" 
                  strokeWidth={1.5} 
                  dot={false} 
                  strokeDasharray="5 5" 
                  name="SMA (20)" 
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="ema" 
                  stroke="#38bdf8" 
                  strokeWidth={1.5} 
                  dot={false} 
                  name="EMA (50)" 
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
        </div>
      </div>

       <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 max-w-md">
             System aggregates signals from RSI, MACD, and Moving Averages.
          </p>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
             <span className="text-xs text-slate-300">{t('system_consensus')}</span>
             <span className={`text-sm font-bold ${consensusColor}`}>{t(consensus)}</span>
          </div>
       </div>
    </div>
  );
};

export default TechnicalIndicators;
