
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  'system_title': { en: 'GoldSight AI', vi: 'GoldSight AI' },
  'system_subtitle': { en: 'PREDICTIVE ANALYTICS ENGINE', vi: 'HỆ THỐNG PHÂN TÍCH DỰ BÁO' },
  'system_status': { en: 'System Status', vi: 'Trạng Thái' },
  'operational': { en: 'Operational', vi: 'Hoạt Động Tốt' },
  'model': { en: 'Model', vi: 'Mô Hình' },
  'live_intelligence': { en: 'Market Intel', vi: 'Thông Tin Thị Trường' },
  'footer_text': { en: 'Powered by Gemini 3. Pro AI for Finance.', vi: 'Sử dụng công nghệ Gemini 3. AI chuyên dụng cho tài chính.' },

  'gold_spot': { en: 'Gold Spot', vi: 'Giá Vàng Spot' },
  'price': { en: 'Price', vi: 'Giá' },
  'forecast': { en: 'Forecast', vi: 'Dự Báo' },
  
  'scenario_simulator': { en: 'AI Simulation', vi: 'Mô Phỏng AI' },
  'reset_live': { en: 'Live Feed', vi: 'Dữ Liệu Thực' },
  'syncing': { en: 'Syncing...', vi: 'Đang Tải...' },
  'adjust_sliders': { en: 'Adjust macro variables:', vi: 'Điều chỉnh các biến vĩ mô:' },
  'dxy_index': { en: 'DXY Index', vi: 'Chỉ Số DXY' },
  'fed_rate': { en: 'Fed Rate', vi: 'Lãi Suất Fed' },
  'oil_price': { en: 'Oil (WTI)', vi: 'Dầu (WTI)' },
  'inflation': { en: 'Inflation (CPI)', vi: 'Lạm Phát (CPI)' },
  'model_arch': { en: 'Strategy', vi: 'Chiến Lược' },
  'run_simulation': { en: 'Run Inference', vi: 'Chạy Dự Báo' },
  'running': { en: 'Analyzing...', vi: 'Đang Phân Tích...' },
  'projected': { en: 'Projected', vi: 'Dự Kiến' },
  'probability': { en: 'Confidence', vi: 'Độ Tin Cậy' },

  'tech_indicators': { en: 'Technical Stack', vi: 'Chỉ Báo Kỹ Thuật' },
  'trend_analysis': { en: 'Trend Mapping', vi: 'Bản Đồ Xu Hướng' },
  'system_consensus': { en: 'AI Consensus:', vi: 'Đồng Thuận AI:' },

  'intermarket_analysis': { en: 'Inter-market Flow', vi: 'Dòng Chảy Liên Thị Trường' },
  'rolling_corr': { en: 'Correlation Matrix', vi: 'Ma Trận Tương Quan' },
  'select_variable': { en: 'Select Asset:', vi: 'Chọn Tài Sản:' },
  'gold_vs': { en: 'Gold vs', vi: 'Vàng vs' },
  'simulated': { en: '(Inference)', vi: '(Dự Đoán)' },
  
  'news_engine': { en: 'Sentiment Engine', vi: 'Phân Tích Cảm Xúc' },
  'load_trending': { en: 'Trending News', vi: 'Tin Tức Nóng' },
  'loading': { en: 'Loading...', vi: 'Đang Tải...' },
  'paste_placeholder': { en: "Analyze news impact...", vi: "Phân tích tác động tin tức..." },
  'analyze': { en: 'Scan', vi: 'Quét' },
  'suggested_headlines': { en: 'Live Feed', vi: 'Dòng Tin Thực' },
  'clear_analysis': { en: 'Clear', vi: 'Xóa' },

  'algo_log': { en: 'Algo Ledger', vi: 'Sổ Lệnh Thuật Toán' },
  'trading_active': { en: 'Market Open', vi: 'Thị Trường Mở' },
  'time': { en: 'Time', vi: 'Thời Gian' },
  'type': { en: 'Type', vi: 'Loại' },
  'entry': { en: 'Entry', vi: 'Vào Lệnh' },
  'status': { en: 'Status', vi: 'Trạng Thái' },
  'pnl': { en: 'PnL', vi: 'Lãi/Lỗ' },
  'total_pnl': { en: 'Session Total:', vi: 'Tổng Phiên:' },

  'analyst_name': { en: 'Aura GPT', vi: 'Aura GPT' },
  'online': { en: 'Live', vi: 'Sẵn Sàng' },
  'ask_placeholder': { en: 'Ask Aura about Gold...', vi: 'Hỏi Aura về thị trường Vàng...' },
  'analyst_intro': { en: 'Welcome to GoldSight. I am Aura, your quantitative assistant. Ask me anything about current trends.', vi: 'Chào mừng đến GoldSight. Tôi là Aura, trợ lý định lượng của bạn. Hãy hỏi tôi về xu hướng thị trường.' },

  'BULLISH': { en: 'BULLISH', vi: 'TĂNG GIÁ' },
  'BEARISH': { en: 'BEARISH', vi: 'GIẢM GIÁ' },
  'NEUTRAL': { en: 'NEUTRAL', vi: 'ĐI NGANG' },
  'POSITIVE': { en: 'POSITIVE', vi: 'TÍCH CỰC' },
  'NEGATIVE': { en: 'NEGATIVE', vi: 'TIÊU CỰC' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage failed');
  return context;
};
