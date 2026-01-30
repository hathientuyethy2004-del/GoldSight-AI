
import React, { useEffect, useState } from 'react';
import { subscribeToMarketData } from '../services/marketData';

const initialAssets = [
  { symbol: 'PAXG/USDT', price: 'Loading...', change: '0.00%' },
  { symbol: 'XAG/USD', price: '28.15', change: '+1.20%' },
  { symbol: 'BTC/USD', price: '64,250.00', change: '-0.85%' },
  { symbol: 'EUR/USD', price: '1.0845', change: '+0.12%' },
  { symbol: 'US10Y', price: '4.42%', change: '-0.05%' },
  { symbol: 'WTI Oil', price: '78.50', change: '+0.90%' },
  { symbol: 'SPX', price: '5,210.00', change: '+0.30%' },
  { symbol: 'DXY', price: '104.20', change: '-0.25%' },
];

const TickerTape: React.FC = () => {
  const [assets, setAssets] = useState(initialAssets);

  useEffect(() => {
    // Listen for Gold Price updates
    const unsubscribe = subscribeToMarketData((candle, history) => {
        if (history.length > 1) {
            const open = history[0].open; // Compare to start of session (simplification)
            const current = candle.close;
            const change = ((current - open) / open * 100).toFixed(2);
            const sign = change.startsWith('-') ? '' : '+';
            
            setAssets(prev => {
                const newAssets = [...prev];
                newAssets[0] = {
                    symbol: 'PAXG/USDT',
                    price: current.toFixed(2),
                    change: `${sign}${change}%`
                };
                return newAssets;
            });
        }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden h-8 flex items-center">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...assets, ...assets, ...assets].map((item, idx) => (
          <div key={idx} className="flex items-center mx-6 text-xs font-mono">
            <span className="text-slate-400 mr-2 font-bold">{item.symbol}</span>
            <span className="text-slate-200 mr-2">{item.price}</span>
            <span className={item.change.startsWith('+') || !item.change.startsWith('-') ? 'text-green-400' : 'text-red-400'}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TickerTape;
