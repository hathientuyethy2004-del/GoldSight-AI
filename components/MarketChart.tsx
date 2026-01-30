
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, LineStyle, Time } from 'lightweight-charts';
import { PredictionResult, Candle } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { subscribeToMarketData } from '../services/marketData';

interface MarketChartProps {
  prediction: PredictionResult | null;
}

const MarketChart: React.FC<MarketChartProps> = ({ prediction }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const forecastSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  const [historyData, setHistoryData] = useState<Candle[]>([]);
  const { t } = useLanguage();

  // 1. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155', visible: false },
        horzLines: { color: '#334155', visible: true, style: LineStyle.Dashed },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#4ade80',
      wickDownColor: '#f87171',
    });

    const forecastSeries = chart.addLineSeries({
      color: '#facc15',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      title: 'Forecast',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    forecastSeriesRef.current = forecastSeries;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. Subscribe to Data
  useEffect(() => {
    const unsubscribe = subscribeToMarketData((candle, history) => {
      setCurrentCandle(candle);
      setHistoryData(history); 

      if (candleSeriesRef.current) {
        // Format data for LWC (sort by time, no duplicates)
        // Convert ms to seconds
        const formattedHistory = history.map(c => ({
          time: (c.time / 1000) as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        
        // Update the series data
        candleSeriesRef.current.setData(formattedHistory);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Handle Prediction Visualization
  useEffect(() => {
    if (!forecastSeriesRef.current || !currentCandle || !prediction) {
       if (forecastSeriesRef.current) forecastSeriesRef.current.setData([]);
       return;
    }

    const currentPrice = currentCandle.close;
    const pctStr = prediction.predictedPriceChange.replace('%', '');
    const pct = parseFloat(pctStr) / 100;
    const targetPrice = currentPrice * (1 + pct);
    const startTime = currentCandle.time / 1000;

    // Create 5 future points (simulated 1 min intervals)
    const points = [];
    // Start point (connect to current candle)
    points.push({ time: (startTime) as Time, value: currentPrice });

    const projectionPoints = 5;
    for (let i = 1; i <= projectionPoints; i++) {
        const interpolatedPrice = currentPrice + ((targetPrice - currentPrice) * (i / projectionPoints));
        points.push({
            time: (startTime + i * 60) as Time, // + i minutes in seconds
            value: interpolatedPrice
        });
    }

    forecastSeriesRef.current.setData(points);

    // Fit content to show prediction if needed
    // chartRef.current?.timeScale().fitContent(); 

  }, [prediction, currentCandle]);

  const currentPrice = currentCandle?.close || 2300;
  const startPrice = historyData.length > 0 ? historyData[0].close : currentPrice;
  const isPositive = currentPrice >= startPrice;
  const percentChange = startPrice ? ((currentPrice - startPrice) / startPrice * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            PAXG/USDT <span className="text-slate-500 text-sm font-normal">{t('gold_spot')} Proxy</span>
          </h3>
          <div className="flex items-baseline gap-3">
            <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                ${currentPrice.toFixed(2)}
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {percentChange}%
            </span>
             <div className="flex items-center gap-1.5 ml-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Live (TradingView)</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 z-10">
           <button className="px-3 py-1 text-xs font-medium rounded bg-slate-700 text-yellow-400 shadow-sm">1m</button>
           <button className="px-3 py-1 text-xs font-medium rounded text-slate-500 cursor-not-allowed">1h</button>
           <button className="px-3 py-1 text-xs font-medium rounded text-slate-500 cursor-not-allowed">1d</button>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 w-full relative min-h-[300px]">
         {prediction && (
            <div className="absolute top-2 left-2 z-20 bg-slate-900/90 backdrop-blur-sm border border-yellow-500/30 px-3 py-1.5 rounded text-xs text-yellow-400 font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                {t('forecast')}: {t(prediction.trend)} ({prediction.predictedPriceChange})
            </div>
         )}
         
         <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default MarketChart;
