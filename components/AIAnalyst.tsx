
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithAnalyst } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const AIAnalyst: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    setMessages([
        { id: '0', role: 'model', text: t('analyst_intro'), timestamp: new Date() }
    ]);
  }, [language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Mock Trade Execution Function
  const handleMockTrade = (action: string, amount: number) => {
    console.log(`Executing Trade: ${action} ${amount}oz Gold`);
    // In a real app, this would call your backend API
    const price = 2345.50; // Mock price
    const total = (price * amount).toFixed(2);
    return `SUCCESS: Order filled. ${action} ${amount}oz @ $${price} (Total: $${total}). Order ID: #${Math.floor(Math.random()*10000)}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const currentContext = {
        market: "Gold Spot XAU/USD (Proxy: PAXG)",
        status: "Real-time Feed Active",
      };

      // Pass handleMockTrade callback to the service
      const responseText = await chatWithAnalyst(input, currentContext, language, handleMockTrade);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl mb-4 w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right ${
        isOpen ? 'opacity-100 scale-100 translate-y-0 h-[500px]' : 'opacity-0 scale-95 translate-y-10 h-0 overflow-hidden'
      }`}>
        <div className="p-4 bg-slate-800 rounded-t-xl border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m9 12 5.6-5.6"/><path d="m15 12-5.6-5.6"/><path d="M19 12v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-3"/></svg>
             </div>
             <div>
               <h3 className="text-sm font-bold text-white">{t('analyst_name')}</h3>
               <div className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] text-slate-400">{t('online')}</span>
               </div>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-slate-800 rounded-lg p-3 rounded-bl-none border border-slate-700">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                   <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('ask_placeholder')}
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-700 text-white' : 'bg-yellow-400 text-slate-900'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>
    </div>
  );
};

export default AIAnalyst;
