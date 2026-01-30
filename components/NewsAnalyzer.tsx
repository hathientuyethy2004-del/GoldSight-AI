import React, { useState } from 'react';
import { analyzeNewsImpact, getTrendingNews } from '../services/geminiService';
import { NewsSentiment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const NewsAnalyzer: React.FC = () => {
  const [headline, setHeadline] = useState('');
  const [sentiment, setSentiment] = useState<NewsSentiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingNews, setTrendingNews] = useState<string[]>([]);
  const { t, language } = useLanguage();

  const analyze = async (text: string = headline) => {
    if (!text) return;
    setLoading(true);
    setHeadline(text); 
    try {
      const res = await analyzeNewsImpact(text, language);
      setSentiment(res);
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    setTrendingLoading(true);
    try {
      const news = await getTrendingNews(language);
      setTrendingNews(news);
    } finally {
      setTrendingLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8a2 2 0 0 1 2 2v6"/></svg>
          {t('news_engine')}
        </h3>
        <button 
          onClick={loadTrending}
          disabled={trendingLoading}
          className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-50"
        >
          {trendingLoading ? t('loading') : t('load_trending')}
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder={t('paste_placeholder')}
          className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-blue-500 outline-none placeholder:text-slate-600"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze(headline)}
        />
        <button 
          onClick={() => analyze(headline)}
          disabled={loading || !headline}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? '...' : t('analyze')}
        </button>
      </div>

      {trendingNews.length > 0 && !sentiment && (
         <div className="mb-4 space-y-2 animate-fade-in">
           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('suggested_headlines')}</p>
           {trendingNews.map((news, idx) => (
             <div 
               key={idx}
               onClick={() => analyze(news)}
               className="p-2 bg-slate-900/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 rounded cursor-pointer text-xs text-slate-300 transition-colors truncate"
             >
               {news}
             </div>
           ))}
         </div>
      )}

      {sentiment && (
        <div className="bg-slate-900/50 rounded p-4 border border-slate-700 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
              sentiment.impact === 'POSITIVE' ? 'bg-green-900/50 text-green-400 border border-green-700' :
              sentiment.impact === 'NEGATIVE' ? 'bg-red-900/50 text-red-400 border border-red-700' :
              'bg-gray-800 text-gray-400 border border-gray-600'
            }`}>
              {t(sentiment.impact)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Score: {sentiment.score}/100</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{sentiment.analysis}</p>
          <button onClick={() => setSentiment(null)} className="mt-3 text-[10px] text-slate-500 hover:text-slate-300 underline">
            {t('clear_analysis')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsAnalyzer;
