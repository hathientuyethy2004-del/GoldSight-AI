import React from 'react';

const steps = [
  { id: 1, title: 'Data Pipeline', desc: 'ETL: Yahoo Finance, FRED, GDELT', color: 'border-blue-500 text-blue-400' },
  { id: 2, title: 'Preprocessing', desc: 'Cleaning, Normalization, Lag Features', color: 'border-indigo-500 text-indigo-400' },
  { id: 3, title: 'Model Training', desc: 'XGBoost, LSTM, Transformer', color: 'border-purple-500 text-purple-400' },
  { id: 4, title: 'Backtesting', desc: 'RMSE, Directional Accuracy', color: 'border-pink-500 text-pink-400' },
  { id: 5, title: 'Inference API', desc: 'FastAPI / Real-time Prediction', color: 'border-yellow-500 text-yellow-400' },
];

const RoadmapCard: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        System Architecture
      </h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex items-center gap-4">
            {idx !== steps.length - 1 && (
              <div className="absolute left-[15px] top-8 w-0.5 h-6 bg-slate-700"></div>
            )}
            <div className={`w-8 h-8 rounded-full border-2 ${step.color} flex items-center justify-center font-bold bg-slate-900 z-10`}>
              {step.id}
            </div>
            <div>
              <div className={`font-semibold text-sm ${step.color.split(' ')[1]}`}>{step.title}</div>
              <div className="text-xs text-slate-400">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapCard;