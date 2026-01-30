import React, { useEffect, useState } from 'react';
import { getEconomicEvents } from '../services/geminiService';
import { EconomicEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const EventRadar: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    getEconomicEvents(language).then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, [language]);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          {t('economic_radar')}
        </h3>
        <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> {t('HIGH')} Impact
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> {t('MEDIUM')} Impact
            </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
           <span className="animate-pulse">{t('scanning')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div key={evt.id} className="group relative bg-slate-900/40 hover:bg-slate-900 border border-slate-700/50 hover:border-blue-500/50 p-4 rounded-lg transition-all duration-300">
               {/* Impact Badge */}
               <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${
                   evt.impact === 'HIGH' ? 'bg-red-500' : evt.impact === 'MEDIUM' ? 'bg-yellow-500' : 'bg-slate-600'
               }`}></div>

               <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">{evt.date}</span>
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        evt.impact === 'HIGH' ? 'text-red-400 border-red-900/50 bg-red-900/20' : 
                        evt.impact === 'MEDIUM' ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/20' : 
                        'text-slate-400 border-slate-700 bg-slate-800'
                     }`}>{t(evt.impact)}</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-100 mb-1">{evt.event}</h4>
                  
                  <div className="text-xs text-slate-300 mb-3 flex items-center gap-2">
                     <span className="text-slate-500">{t('forecast')}:</span> {evt.forecast}
                  </div>

                  <div className="p-2 bg-slate-800/50 rounded text-[11px] text-slate-400 italic border-l-2 border-blue-500/30">
                     "AI: {evt.aiAnalysis}"
                  </div>
               </div>
            </div>
          ))}
          {events.length === 0 && (
             <div className="col-span-3 text-center text-slate-500 text-xs py-4">{t('no_events')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventRadar;
