import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const models = [
  {
    name: 'ARIMA (Baseline)',
    type: 'Linear',
    rmse: 24.5,
    mae: 18.2,
    winRate: 52,
    status: 'Stable',
    color: 'text-slate-400',
    barColor: 'bg-slate-500'
  },
  {
    name: 'XGBoost (Macro)',
    type: 'Ensemble',
    rmse: 14.2,
    mae: 10.5,
    winRate: 68,
    status: 'Active',
    color: 'text-blue-400',
    barColor: 'bg-blue-500'
  },
  {
    name: 'LSTM-Attention',
    type: 'Deep Learning',
    rmse: 12.8,
    mae: 9.1,
    winRate: 74,
    status: 'Training',
    color: 'text-purple-400',
    barColor: 'bg-purple-500'
  }
];

const generateEquityData = () => {
    const data = [];
    let balance = 10000;
    for (let i = 0; i < 90; i++) {
        // Simulation: General upward trend with some drawdowns
        const dailyReturn = (Math.random() - 0.4) * 200; 
        balance += dailyReturn;
        data.push({
            day: `D${i}`,
            balance: Math.round(balance)
        });
    }
    return data;
};

const equityData = generateEquityData();

const ModelPerformance: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          Backtesting Performance
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border border-slate-700 px-2 py-1 rounded">Last 90 Days</span>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Equity Curve Chart */}
        <div className="h-32 w-full bg-slate-900/30 rounded-lg p-2 border border-slate-700/30 relative">
            <div className="absolute top-2 left-3 text-[10px] text-slate-400 font-bold uppercase z-10">Equity Curve (Start: $10,000)</div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', color: '#f1f5f9' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(val) => [`$${val}`, 'Balance']}
                        labelStyle={{ display: 'none' }}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBalance)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Models List */}
        <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {models.map((model, idx) => (
            <div key={idx} className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm ${model.color}`}>{model.name}</h4>
                    {model.status === 'Training' && <span className="animate-pulse w-2 h-2 rounded-full bg-yellow-500"></span>}
                    </div>
                    <div className="text-xs text-slate-500">{model.type}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">Win Rate</div>
                    <div className="text-sm font-mono font-bold text-white">{model.winRate}%</div>
                </div>
                </div>

                {/* Win Rate Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mb-3 overflow-hidden">
                <div className={`h-full ${model.barColor}`} style={{ width: `${model.winRate}%` }}></div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 rounded p-1.5 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">RMSE</div>
                    <div className="text-xs font-mono text-slate-200">{model.rmse}</div>
                </div>
                <div className="bg-slate-900 rounded p-1.5 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">MAE</div>
                    <div className="text-xs font-mono text-slate-200">{model.mae}</div>
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
         <span>Evaluation Metric: Directional Accuracy</span>
         <span className="text-slate-400">Total Samples: 1,420</span>
      </div>
    </div>
  );
};

export default ModelPerformance;