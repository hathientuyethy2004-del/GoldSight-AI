
import { Candle } from '../types';

type Subscriber = (candle: Candle, history: Candle[]) => void;

let history: Candle[] = [];
let subscribers: Subscriber[] = [];
let ws: WebSocket | null = null;
const MAX_HISTORY = 100;

// Initialize WebSocket connection to Binance for PAXG/USDT (Gold Token)
export const initBinanceWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  // 1. Fetch initial snapshot (REST API) to fill history immediately
  fetch('https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1m&limit=100')
    .then(res => res.json())
    .then(data => {
      history = data.map((d: any) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
      if (history.length > 0) {
        notifySubscribers(history[history.length - 1]);
      }
    })
    .catch(err => console.error("Failed to fetch history:", err));

  // 2. Connect WebSocket for real-time updates
  ws = new WebSocket('wss://stream.binance.com:9443/ws/paxgusdt@kline_1m');

  ws.onopen = () => {
    console.log('Connected to Binance Market Data (PAXG/USDT)');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.e === 'kline') {
      const k = message.k;
      const candle: Candle = {
        time: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c), // Real-time price
        volume: parseFloat(k.v)
      };

      // Manage History
      const lastCandle = history[history.length - 1];
      
      // Check if it's an update to the current candle or a new candle
      if (lastCandle && lastCandle.time === candle.time) {
        history[history.length - 1] = candle; // Update current
      } else {
        history.push(candle); // Add new
        if (history.length > MAX_HISTORY) history.shift();
      }

      notifySubscribers(candle);
    }
  };

  ws.onclose = () => {
    console.log('Binance disconnected. Reconnecting...');
    setTimeout(initBinanceWebSocket, 5000);
  };
};

const notifySubscribers = (candle: Candle) => {
  subscribers.forEach(sub => sub(candle, [...history]));
};

export const subscribeToMarketData = (callback: Subscriber) => {
  subscribers.push(callback);
  
  // If we already have data, send it immediately
  if (history.length > 0) {
    callback(history[history.length - 1], [...history]);
  }
  
  if (!ws) {
    initBinanceWebSocket();
  }

  return () => {
    subscribers = subscribers.filter(s => s !== callback);
  };
};

export const getMarketHistory = () => [...history];
