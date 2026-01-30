
import React, { useEffect, useState } from 'react';
import MarketChart from './components/MarketChart';
import PredictionLab from './components/PredictionLab';
import TechnicalIndicators from './components/TechnicalIndicators';
import MacroCorrelations from './components/MacroCorrelations';
import TickerTape from './components/TickerTape';
import AIAnalyst from './components/AIAnalyst';
import TradeSignalLog from './components/TradeSignalLog';
import NewsAnalyzer from './components/NewsAnalyzer';
import { getLiveMarketContext } from './services/geminiService';
import { MarketContext, PredictionResult } from './types';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setMarketContext(null);
    getLiveMarketContext(language).then(setMarketContext);
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12 font-sans relative selection:bg-yellow-500/30">
      {/* Top Ticker */}
      <TickerTape />

      {/* Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl shadow-[0_0_15px_rgba(250,204,21,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-[-150%] animate-shimmer"></div>
              G
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">{t('system_title')}</h1>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider">{t('system_subtitle')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="flex flex-col items-end">
                 <span className="text-slate-500 uppercase text-[10px] font-bold">{t('system_status')}</span>
                 <span className="flex items-center gap-1.5 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {t('operational')}</span>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div className="flex flex-col items-end">
                 <span className="text-slate-500 uppercase text-[10px] font-bold">{t('model')}</span>
                 <span className="text-slate-300">Gemini 3 Flash</span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
            
            <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'vi' ? 'bg-yellow-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                VN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Market Intel Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest">{t('live_intelligence')}</span>
                <span className="text-slate-600 text-[10px]">|</span>
                <span className="text-slate-400 text-[10px]">{new Date().toUTCString()}</span>
             </div>
             {marketContext ? (
                <div className="space-y-2">
                   <p className="text-sm text-slate-300 leading-snug">{marketContext.summary}</p>
                   <div className="flex flex-wrap gap-2">
                      {marketContext.sources.map((src, i) => (
                        <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/30 transition-colors">
                          {src.title} ↗
                        </a>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="animate-pulse h-4 bg-slate-800 rounded w-96 max-w-full"></div>
             )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Row 1: Main Visuals & Prediction Lab */}
          <div className="xl:col-span-8 h-[550px]">
             <MarketChart prediction={activePrediction} />
          </div>

          <div className="xl:col-span-4 h-[550px]">
             <PredictionLab onPredictionComplete={setActivePrediction} />
          </div>

          {/* Row 2: Indicators, Correlations & Signals */}
          <div className="xl:col-span-4">
             <TechnicalIndicators prediction={activePrediction} />
          </div>

          <div className="xl:col-span-4">
             <MacroCorrelations />
          </div>

          <div className="xl:col-span-4">
             <TradeSignalLog prediction={activePrediction} />
          </div>
           
           {/* Row 3: Global Sentiment (Full Width) */}
          <div className="xl:col-span-12">
            <NewsAnalyzer />
          </div>

        </div>

        <footer className="border-t border-slate-800 pt-6 pb-8 text-center">
           <p className="text-slate-500 text-xs">
             {t('footer_text')}
           </p>
        </footer>

      </main>

      <AIAnalyst />
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(150%) skewX(-12deg); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
      `}</style>
    </div>
  );
};

export default App;
