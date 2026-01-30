import React, { useEffect, useState } from 'react';
import { PredictionResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Trade {
  id: string;
  time: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number | null;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  pnl: number | null;
  strategy: string;
}

const initialTrades: Trade[] = [
  { id: 'T-1024', time: '14:30', type: 'LONG', entry: 2342.50, exit: null, status: 'OPEN', pnl: 4.20, strategy: 'Trend Follow (EMA)' },
  { id: 'T-1023', time: '09:15', type: 'SHORT', entry: 2355.10, exit: 2348.00, status: 'CLOSED', pnl: 7.10, strategy: 'Mean Reversion' },
  { id: 'T-1022', time: 'Yesterday', type: 'LONG', entry: 2330.00, exit: 2332.50, status: 'CLOSED', pnl: 2.50, strategy: 'Macro Event' },
];

interface TradeSignalLogProps {
  prediction: PredictionResult | null;
}

const TradeSignalLog: React.FC<TradeSignalLogProps> = ({ prediction }) => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const { t } = useLanguage();

  useEffect(() => {
    if (prediction && prediction.trend !== 'NEUTRAL') {
      const type = prediction.trend === 'BULLISH' ? 'LONG' : 'SHORT';
      const newTrade: Trade = {
        id: `T-${1025 + Math.floor(Math.random() * 100)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type,
        entry: 2345.00, // Simulated current price
        exit: null,
        status: 'PENDING',
        pnl: null,
        strategy: 'AI Ensemble Model'
      };
      
      // Add new trade to top
      setTrades(prev => [newTrade, ...prev.slice(0, 9)]); // Keep last 10
    }
  }, [prediction]);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          {t('algo_log')}
        </h3>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-xs text-slate-400">{t('trading_active')}</span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-700">
              <th className="pb-2 pl-2">{t('time')}</th>
              <th className="pb-2">{t('type')}</th>
              <th className="pb-2">{t('entry')}</th>
              <th className="pb-2">{t('status')}</th>
              <th className="pb-2 text-right pr-2">{t('pnl')}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {trades.map((trade) => (
              <tr key={trade.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${trade.status === 'PENDING' ? 'bg-yellow-500/5' : ''}`}>
                <td className="py-3 pl-2">
                  <div className="font-mono text-slate-300 text-xs">{trade.time}</div>
                  <div className="text-[10px] text-slate-500">{trade.strategy}</div>
                </td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    trade.type === 'LONG' 
                      ? 'bg-green-900/30 text-green-400 border-green-800' 
                      : 'bg-red-900/30 text-red-400 border-red-800'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="py-3 font-mono text-slate-400 text-xs">
                  ${trade.entry.toFixed(2)}
                </td>
                <td className="py-3">
                   {trade.status === 'OPEN' ? (
                     <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> OPEN
                     </span>
                   ) : trade.status === 'PENDING' ? (
                     <span className="text-[10px] text-yellow-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></span> PENDING
                     </span>
                   ) : (
                     <span className="text-[10px] text-slate-500">CLOSED</span>
                   )}
                </td>
                <td className={`py-3 pr-2 text-right font-mono font-bold ${
                  (trade.pnl || 0) > 0 ? 'text-green-400' : (trade.pnl || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {trade.pnl ? (trade.pnl > 0 ? '+' : '') + trade.pnl.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
         <div className="text-xs text-slate-500">{t('total_pnl')}</div>
         <div className="text-sm font-bold text-green-400 font-mono">+$11.30</div>
      </div>
    </div>
  );
};

export default TradeSignalLog;
