import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface MacroAsset {
  id: string;
  name: string;
  symbol: string;
  correlation: number;
  description: string;
}

const assets: MacroAsset[] = [
  { id: 'dxy', name: 'USD Index', symbol: 'DXY', correlation: -0.92, description: 'Strong Inverse. Gold rises when Dollar weakens.' },
  { id: 'us10y', name: 'US 10Y Yield', symbol: 'US10Y', correlation: -0.85, description: 'Inverse. Higher rates hurt non-yielding Gold.' },
  { id: 'oil', name: 'Crude Oil', symbol: 'WTI', correlation: 0.65, description: 'Positive. Inflation proxy often moves with Gold.' },
  { id: 'spx', name: 'S&P 500', symbol: 'SPX', correlation: 0.30, description: 'Weak Positive. Risk-on sentiment alignment.' },
];

const generateScatterData = (correlation: number) => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 100;
    const noise = (Math.random() - 0.5) * 30;
    const y = correlation > 0 ? x + noise : 100 - x + noise;
    data.push({ x: Math.round(x), y: Math.round(y) });
  }
  return data;
};

const MacroCorrelations: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<MacroAsset>(assets[0]);
  const [scatterData, setScatterData] = useState(generateScatterData(assets[0].correlation));
  const { t } = useLanguage();

  const handleAssetClick = (asset: MacroAsset) => {
    setSelectedAsset(asset);
    setScatterData(generateScatterData(asset.correlation));
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {t('intermarket_analysis')}
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-700 px-2 py-1 rounded">
          {t('rolling_corr')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">{t('select_variable')}</p>
          {assets.map((asset) => (
            <div 
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAsset.id === asset.id 
                  ? 'bg-slate-700 border-blue-500/50 shadow-md' 
                  : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-200">{asset.symbol}</span>
                  <span className="text-xs text-slate-500">{asset.name}</span>
                </div>
              </div>
              
              <div className={`text-sm font-mono font-bold px-2 py-1 rounded min-w-[60px] text-center ${
                asset.correlation > 0.5 ? 'bg-green-900/30 text-green-400' :
                asset.correlation < -0.5 ? 'bg-red-900/30 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {asset.correlation > 0 ? '+' : ''}{asset.correlation}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 flex flex-col">
          <h4 className="text-xs text-center text-slate-400 mb-2 uppercase tracking-wide">
             {t('gold_vs')} {selectedAsset.symbol} {t('simulated')}
          </h4>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={true} />
                <XAxis type="number" dataKey="x" name={selectedAsset.symbol} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Gold Price" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ strokeDasharray: '3 3' }} 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                />
                <Scatter name="Correlation" data={scatterData} fill={selectedAsset.correlation < 0 ? '#f87171' : '#4ade80'} shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] text-center text-slate-500 italic">
            X-Axis: {selectedAsset.symbol} Normalized &nbsp;|&nbsp; Y-Axis: Gold Price Normalized
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroCorrelations;
