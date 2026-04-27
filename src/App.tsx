import React, { useState, useEffect, useCallback, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { Chatbot } from './components/Chatbot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { 
  Home, 
  CreditCard, 
  History, 
  User, 
  Share2,
  Wallet,
  Building2,
  Copy,
  Smartphone, 
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Settings,
  Gift,
  Package,
  X,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  TrendingUp,
  BarChart3,
  Ticket,
  Activity,
  Play,
  Image as ImageIcon,
  MessageCircle,
  Trophy,
  Dices,
  Save,
  Zap,
  Banknote,
  Shield,
  Bell,
  Megaphone,
  Calendar,
  Search,
  ShoppingCart,
  Crown,
  Flame,
  Star,
  Send,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SOUND_OPEN = "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3"; // Pop/Lách cách
const SOUND_WIN = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"; // Chúc mừng/Pháo nổ
const SOUND_SUCCESS = "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3"; // Giao dịch thành công
const SOUND_SHATTER = "https://assets.mixkit.co/active_storage/sfx/285/285-preview.mp3"; // Vỡ kính (không trúng)
const SOUND_EVENT = "https://assets.mixkit.co/active_storage/sfx/1001/1001-preview.mp3"; // Soft Chime
const SOUND_LOSE = "https://assets.mixkit.co/active_storage/sfx/136/136-preview.mp3"; // Game Over
const SOUND_DICE = "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3"; // Xúc xắc lách cách
const SOUND_FAIL = "https://assets.mixkit.co/active_storage/sfx/2802/2802-preview.mp3"; // Thất bại / Lỗi


type ToastEvent = { msg: string, type: 'success' | 'error' | 'info' | 'warning' };
const toastListeners = new Set<(e: ToastEvent) => void>();
export const toast = (msg: string | any, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
  toastListeners.forEach(l => l({ msg: message, type }));
};

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, iconClass: 'text-green-400', bg: 'bg-green-950/90', border: 'border-green-500/30' },
  error: { icon: AlertCircle, iconClass: 'text-red-400', bg: 'bg-red-950/90', border: 'border-red-500/30' },
  info: { icon: Info, iconClass: 'text-blue-400', bg: 'bg-blue-950/90', border: 'border-blue-500/30' },
  warning: { icon: AlertTriangle, iconClass: 'text-yellow-400', bg: 'bg-yellow-950/90', border: 'border-yellow-500/30' }
};

const ToastContainer = () => {
  const [toasts, setToasts] = React.useState<({id: number} & ToastEvent)[]>([]);
  React.useEffect(() => {
    const l = (e: ToastEvent) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { ...e, id }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    toastListeners.add(l);
    return () => toastListeners.delete(l);
  }, []);
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={cn("backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 w-max max-w-[90vw] border pointer-events-auto", config.bg, config.border)}
            >
              <Icon className={cn("w-5 h-5", config.iconClass)} />
              <span className="text-white font-bold text-sm whitespace-pre-line">{toast.msg}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};


const activeAudios: { [url: string]: HTMLAudioElement } = {};

const playSound = (url: string) => {
  if (typeof window !== 'undefined' && window.__SOUND_ENABLED__ === false) return;
  
  // Stop previously playing sound of the same url to avoid overlapping chatter
  if (activeAudios[url]) {
    activeAudios[url].pause();
    activeAudios[url].currentTime = 0;
  }
  
  const audio = new Audio(url);
  audio.volume = 0.5;
  activeAudios[url] = audio;
  
  audio.play().catch(() => {}); // Browsers might block auto-play
  
  // Clean up when ended
  const clearAudio = () => {
    if (activeAudios[url] === audio) {
      audio.pause();
      delete activeAudios[url];
    }
  };
  audio.onended = clearAudio;
  setTimeout(clearAudio, 2500);
};

export const stopAllSounds = () => {
  Object.values(activeAudios).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
};

// --- Icons & Assets ---
const IPHONE_IMG = "https://picsum.photos/seed/iphone15/400/400"; // Placeholder

// --- Components ---

interface UserData {
  tiktokId: string;
  balance: number;
  referrals?: number;
  referredBy?: string;
  referralCode?: string;
  lastCheckin?: string;
  inventory?: any[];
  referralHistory?: { invitedUser: string, bonus: number, date: string }[];
  phone?: string;
  address?: string;
  shopName?: string;
  avatarUrl?: string;
  claimedMissions?: string[];
}

interface CartItem {
  boxId: string;
  name: string;
  price: number;
  count: number;
}

interface Config {
  winRate: number;
  upgradeRate?: number;
  spinRates?: {
    none: number;
    coin10k: number;
    coin20k: number;
    coin50k: number;
    item: number;
    jackpot: number;
  };
  prices: { id: string, name: string, price: number, color: string, badge?: string }[];
  paymentInfo: {
    bank: { account: string, name: string, bankName: string, bankBin: string, qrUrl: string, bankNote?: string, isMaintenance?: boolean };
  };
}

interface RechargeRequest {
  id: string;
  type: string;
  amount: number;
  serial: string;
  code: string;
  status: 'waiting' | 'success' | 'error';
  createdAt: string;
}

type GridBoxMode = 'idle' | 'spawning' | 'opening' | 'win-reveal' | 'lose-reveal' | 'departing' | 'empty';
type GridBoxState = {
  id: string;
  slotIndex: number;
  mode: GridBoxMode;
  result?: any;
};

type MultiGameState = {
  active: boolean;
  boxTypeId: string;
  originalResults: any[];
  queue: any[];
  completedCount: number;
  jackpot: number;
  totalToOpen: number;
  grid: GridBoxState[];
};

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(15)].map((_, i) => {
        const left = `${Math.random() * 100}vw`;
        const size = `${Math.random() * 6 + 2}px`;
        const dur = `${Math.random() * 10 + 10}s`;
        const delay = `${Math.random() * 10}s`;
        return (
          <div 
            key={i} 
            className="particle-fx" 
            style={{
              left,
              width: size,
              height: size,
              animation: `float-up ${dur} ${delay} linear infinite`
            }}
          />
        );
      })}
    </div>
  );
};


export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [view, _setView] = useState<'home' | 'recharge' | 'collection' | 'account' | 'admin' | 'spin' | 'leaderboard'>('home');
  const setView = useCallback((newView: any) => {
    stopAllSounds();
    _setView(newView);
  }, []);
  const [rechargeDraft, setRechargeDraft] = useState<any>(null);

  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPinScreen, setShowPinScreen] = useState<{ tiktokId: string, isNew: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [publicHistory, setPublicHistory] = useState<any[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [screenShake, setScreenShake] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [eventsState, setEventsState] = useState<{ envelope: any, shakeEventActive: boolean }>({ envelope: null, shakeEventActive: false });
  const [isShaking, setIsShaking] = useState(false);
  const [insuranceActive, setInsuranceActive] = useState(false);
  
  useEffect(() => {
    window.__SOUND_ENABLED__ = soundEnabled;
  }, [soundEnabled]);
  const [boxToConfirm, setBoxToConfirm] = useState<{ id: string, name: string, price: number } | null>(null);
  const [interactiveState, setInteractiveState] = useState<{
    boxId: string;
    phase: 'spinning' | 'grand-reveal' | 'item-reveal' | 'consolation-reveal' | 'sad-close';
    apiResult: any;
  } | null>(null);

  useEffect(() => {
    // Capture referral link
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('referredBy', ref);

    // Artificial delay to show loading spinner on initial visit
    setTimeout(() => setIsInitialLoading(false), 1500);
  }, []);

  // Global event notification logic
  useEffect(() => {
    let lastTime = Date.now();
    const pollEvents = async () => {
      try {
        const res = await fetch(`/api/global-events?since=${lastTime}`);
        const events = await res.json();
        if (events && events.length > 0) {
          // Play notification sound
          playSound(SOUND_EVENT);
          
          // Display the chronologically last event as the toast
          const latestEvent = events[events.length - 1];
          toast(latestEvent.message, 'info');
          
          lastTime = latestEvent.timestamp;
        }
      } catch (e) {}
    };
    const interval = setInterval(pollEvents, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(setPublicHistory);

    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.paymentInfo) {
          data.paymentInfo = {
            momo: { phone: '', name: '', qrUrl: '' },
            bank: { bankName: '', account: '', name: '', bankBin: '', qrUrl: '' }
          };
        } else if (data && data.paymentInfo && !data.paymentInfo.bank.bankBin) {
          data.paymentInfo.bank.bankBin = '';
        }
        setConfig(data);
      });

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('referredBy', ref);

    const savedUser = localStorage.getItem('tiktokUser');
    const savedPin = localStorage.getItem('tiktokPin');
    if (savedUser) {
      handleLogin(savedUser, savedPin || undefined);
    }
  }, []);

  // Poll for payment notifications & event states
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/notifications/${encodeURIComponent(user.tiktokId)}`);
        if (res.ok) {
          const notifs = await res.json();
          if (Array.isArray(notifs) && notifs.length > 0) {
            notifs.forEach(msg => {
              toast(msg.title || msg, 'success');
              playSound(SOUND_SUCCESS);
            });
            handleLogin(user.tiktokId, (user as any).pin);
          }
        }

        const eventsRes = await fetch('/api/events-state');
        if (eventsRes.ok) {
          const evData = await eventsRes.json();
          setEventsState(evData);
        }

      } catch (e: any) {
        if (e && e.message && e.message.includes("pattern")) {
            // Ignore Safari fetch pattern errors if any
        } else {
            console.error("Poll error", e);
        }
      }
    };
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Monitor Low Balance
  useEffect(() => {
    if (user && user.balance < 20000 && user.notificationsEnabled !== false) {
      if (!sessionStorage.getItem('low_balance_warned')) {
        setTimeout(() => {
          toast("⚠️ Số dư của bạn đang thấp, hãy nạp thẻ để không gián đoạn cuộc vui nhé!", 'warning');
          playSound(SOUND_EVENT);
        }, 1000); // 1s delay
        sessionStorage.setItem('low_balance_warned', 'true');
      }
    } else if (user && user.balance >= 20000) {
      sessionStorage.removeItem('low_balance_warned');
    }
  }, [user?.balance, user?.notificationsEnabled]);

  const handleLogin = async (id: string, pin?: string) => {
    setLoading(true);
    try {
      const referredBy = localStorage.getItem('referredBy');
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: id, pin, referredBy })
      });
      const data = await res.json();
      
      if (data.needsPin) {
        setShowPinScreen({ tiktokId: id, isNew: data.isNew });
      } else if (data.tiktokId) {
        setUser(data);
        localStorage.setItem('tiktokUser', data.tiktokId);
        if (pin) localStorage.setItem('tiktokPin', pin);
        const isAdminId = data.tiktokId.toLowerCase() === '@admin' || 
                          data.tiktokId.toLowerCase() === 'thinh.khong.vui';
        if (isAdminId) setIsAdmin(true);
        setShowPinScreen(null);
        setPinInput('');
      } else if (data.error) {
        toast(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('tiktokUser');
    localStorage.removeItem('tiktokPin');
    setView('home');
  };

  const requestOpenBox = (boxId: string) => {
    if (!config) return;
    const box = config.prices.find((b: any) => b.id === boxId);
    if (!box) return;
    setBoxToConfirm(box);
  };

  const startInteractiveMode = async (boxId: string) => {
    if (!user) return;
    
    // Virtual Dice Roll Phase (1s)
    setInteractiveState({
      boxId,
      phase: 'dice-roll',
      apiResult: null
    });
    playSound(SOUND_DICE); 

    const startTime = Date.now();

    try {
      const res = await fetch('/api/blind-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId, boxId, count: 1, insurance: insuranceActive })
      });
      const data = await res.json();
      
      if (data.error) {
        toast(data.error, 'error');
        setInteractiveState(null);
        return;
      }

      // Switch to spinning after at least 1s
      setTimeout(() => {
        setInteractiveState(prev => prev && prev.phase === 'dice-roll' ? { ...prev, phase: 'spinning' } : prev);
        playSound(SOUND_OPEN);
      }, Math.max(1000, Date.now() - startTime));

      const elapsed = Date.now() - startTime;
      const waitTime = Math.max(0, 3000 - elapsed); // 1s dice + 2s spinning
      
      const firstResultStr = data.results[0]?.result || '';
      const isGrandPrize = firstResultStr.toLowerCase().includes('iphone') || firstResultStr.toLowerCase().includes('ipad');
      const isItem = data.results.some((r: any) => r.type === 'item');
      const isConsolation = data.results.some((r: any) => r.type === 'consolation' || r.type === 'rescue');
      const isFragment = data.results.some((r: any) => r.type === 'fragment');

      const patchedData = { ...data, result: firstResultStr };

      setTimeout(() => {
         if (isGrandPrize) {
            setInteractiveState({ boxId, phase: 'grand-reveal', apiResult: patchedData });
            playSound(SOUND_WIN);
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 3000);
            
            // Fireworks animation
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: ['#ff0000', '#ffd700', '#ffffff', '#a855f7'] }));
            }, 250);
            
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 3500);
         } else if (isItem) {
            setInteractiveState({ boxId, phase: 'item-reveal', apiResult: patchedData });
            playSound(SOUND_WIN);
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 2000);
         } else if (isFragment) {
            setInteractiveState({ boxId, phase: 'fragment-reveal' as any, apiResult: patchedData });
            playSound(SOUND_WIN);
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#d97706'] });
            
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 2000);
         } else if (isFragment) {
            setInteractiveState({ boxId, phase: 'fragment-reveal', apiResult: patchedData });
            playSound(SOUND_WIN);
            confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 }, colors: ['#a855f7', '#ffffff'] });
            
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 2000);
         } else if (isConsolation) {
            setInteractiveState({ boxId, phase: 'consolation-reveal', apiResult: patchedData });
            playSound(SOUND_WIN);
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
            
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 2000);
         } else {
            setInteractiveState({ boxId, phase: 'sad-close', apiResult: patchedData });
            playSound(SOUND_SHATTER);
            setTimeout(() => {
               if (data.balance !== undefined) setUser(prev => prev ? { ...prev, balance: data.balance } : null);
               setResult(patchedData.result);
               setInteractiveState(null);
            }, 2000);
         }
      }, waitTime);

    } catch (err) {
      toast('Có lỗi xảy ra', 'error');
      setInteractiveState(null);
    }
  };

  const [multiOpenResult, setMultiOpenResult] = useState<{results: any[], jackpot: number} | null>(null);
  const [multiGame, setMultiGame] = useState<MultiGameState | null>(null);

  const startMultiGame = (boxId: string, apiResults: any[], jackpot: number) => {
    const initialGrid = Array.from({length: 9}).map((_, i) => ({
      id: `slot-${i}-0`,
      slotIndex: i,
      mode: 'spawning' as GridBoxMode
    }));
    setMultiGame({
      active: true,
      boxTypeId: boxId,
      originalResults: apiResults,
      queue: apiResults,
      completedCount: 0,
      jackpot,
      totalToOpen: apiResults.length,
      grid: initialGrid
    });

    setTimeout(() => {
      setMultiGame(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          grid: prev.grid.map(b => ({ ...b, mode: 'idle' as GridBoxMode }))
        };
      });
    }, 500);
  };

  const handleGridBoxClick = (slotIndex: number) => {
    setMultiGame(prev => {
      if (!prev || prev.queue.length === 0) return prev;
      
      const box = prev.grid[slotIndex];
      if (box.mode !== 'idle') return prev;

      const result = prev.queue[0];
      const newQueue = prev.queue.slice(1);
      
      playSound(SOUND_OPEN);

      const newGrid = [...prev.grid];
      newGrid[slotIndex] = { ...box, mode: 'opening', result };

      setTimeout(() => transitionBoxToReveal(slotIndex, result), 1000);

      return {
        ...prev,
        queue: newQueue,
        grid: newGrid
      };
    });
  };

  const transitionBoxToReveal = (slotIndex: number, result: any) => {
    setMultiGame(prev => {
      if (!prev) return prev;
      const box = prev.grid[slotIndex];
      if (!box || box.mode !== 'opening') return prev;

      const isWin = result.type === 'jackpot' || result.type === 'item' || result.type === 'consolation' || result.type === 'rescue' || result.type === 'fragment';
      if (isWin) {
        playSound(SOUND_WIN);
        if (result.type === 'jackpot' || result.type === 'item' || result.type === 'fragment') {
            confetti({ particleCount: result.type === 'fragment' ? 50 : 100, spread: 60, origin: { x: (slotIndex % 3) * 0.33 + 0.16, y: Math.floor(slotIndex / 3) * 0.33 + 0.2 }, colors: result.type === 'fragment' ? ['#a855f7', '#ffffff'] : undefined });
        }
      } else {
        playSound(SOUND_SHATTER);
      }
      
      const newGrid = [...prev.grid];
      newGrid[slotIndex] = { ...box, mode: isWin ? 'win-reveal' : 'lose-reveal' };

      setTimeout(() => transitionBoxToDepart(slotIndex), 1800);

      return { ...prev, grid: newGrid };
    });
  };

  const transitionBoxToDepart = (slotIndex: number) => {
    setMultiGame(prev => {
      if (!prev) return prev;

      const newGrid = [...prev.grid];
      newGrid[slotIndex] = { ...newGrid[slotIndex], mode: 'departing' };

      setTimeout(() => spawnNewBoxOrFinish(slotIndex), 400);

      return { ...prev, grid: newGrid };
    });
  };

  const spawnNewBoxOrFinish = (slotIndex: number) => {
    setMultiGame(prev => {
      if (!prev) return prev;

      const newCompletedCount = prev.completedCount + 1;
      let newGrid = [...prev.grid];

      if (newCompletedCount >= prev.totalToOpen) {
         // Cập nhật slot này thành rỗng/đã xong vì tao không cần thêm hộp nào nữa
         newGrid[slotIndex] = { ...newGrid[slotIndex], mode: 'empty' };

         setTimeout(() => {
            setMultiOpenResult({ results: prev.originalResults, jackpot: prev.jackpot });
            const hasWin = prev.originalResults.some((r: any) => r.type === 'jackpot' || r.type === 'item');
            if (hasWin) {
              playSound(SOUND_WIN);
              confetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });
            } else {
              playSound(SOUND_LOSE);
            }
            setMultiGame(null);
         }, 1500); // Đợi 1.5s để ngắm các món cuối cùng thay vì tắt ngay
      } else {
        // Chỉ xuất hiện hộp mới nếu hàng chờ KHÔNG trống!
        if (prev.queue.length > 0) {
            newGrid[slotIndex] = { 
               id: `slot-${slotIndex}-${newCompletedCount}`, 
               slotIndex, 
               mode: 'spawning' 
            };
            setTimeout(() => setBoxIdle(slotIndex, newGrid[slotIndex].id), 500);
        } else {
            // Còn hộp đang nở, nhưng hộp gốc là hết queue, slot này để rỗng
            newGrid[slotIndex] = { ...newGrid[slotIndex], mode: 'empty' };
        }
      }

      return { ...prev, completedCount: newCompletedCount, grid: newGrid };
    });
  };

  const setBoxIdle = (slotIndex: number, expectedId: string) => {
    setMultiGame(prev => {
       if (!prev) return prev;
       const box = prev.grid[slotIndex];
       if (box.id === expectedId && box.mode === 'spawning') {
           const newGrid = [...prev.grid];
           newGrid[slotIndex] = { ...box, mode: 'idle' };
           return { ...prev, grid: newGrid };
       }
       return prev;
    });
  };

  const handleMultiOpen = async (boxId: string, count: number) => {
    if (!user) return;
    setIsInitialLoading(true);
    try {
      const res = await fetch('/api/blind-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId, boxId, count, insurance: insuranceActive })
      });
      const data = await res.json();
      setIsInitialLoading(false);
      
      if (data.error) {
        toast(data.error, 'error');
        return;
      }
      
      if (data.balance !== undefined) {
         setUser({ ...user, balance: data.balance });
      }
      
      // Start the multi-game instead of showing results instantly
      startMultiGame(boxId, data.results, data.jackpot);
    } catch (e) {
      setIsInitialLoading(false);
      toast('Lỗi kết nối tới server', 'error');
    }
  };

  if (!user) {
    return (
      <>
        <ToastContainer />
      <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center p-6 text-white text-center font-sans relative overflow-hidden">
        {/* Artistic background blur */}
        <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] bg-[#D0021B]/20 blur-[120px] rounded-full -z-10" />
        
        <AnimatePresence>
          {isInitialLoading && <LoadingSpinner text="ĐANG TẢI TRÒ CHƠI..." />}
        </AnimatePresence>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm space-y-10 relative z-10"
        >
          <div className="space-y-3">
            <div className="w-20 h-20 bg-yellow-500 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)] border-2 border-white/20">
              <Smartphone className="w-10 h-10 text-red-700" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-yellow-400 drop-shadow-lg">
              SHOP TÚI MÙ
            </h1>
            <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Senior Blind Box Platform • v2.0</p>
          </div>

          {!showPinScreen ? (
            <div className="bg-[#1e293b]/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[40px] rounded-full pointer-events-none" />
              <h3 className="text-white text-xs font-black uppercase tracking-widest opacity-60">Đăng nhập bằng ID TikTok</h3>
              <input 
                type="text" 
                placeholder="@ Nhập ID của bạn..." 
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 font-bold text-center focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all placeholder:text-slate-600 relative z-10"
              />
              <button 
                onClick={() => handleLogin(loginInput)}
                disabled={!loginInput || loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.2)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm relative overflow-hidden group border-b-4 border-yellow-700 hover:shadow-[0_15px_40px_rgba(234,179,8,0.4)] z-10"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                <span className="relative z-10">
                   {loading ? <Loader2 className="animate-spin mx-auto text-red-900" /> : 'Tiếp tục'}
                </span>
              </button>
            </div>
          ) : (
            <div className="bg-[#1e293b]/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[40px] rounded-full pointer-events-none" />
              <h3 className="text-white text-xs font-black uppercase tracking-widest opacity-60 relative z-10">
                {showPinScreen.isNew ? 'Thiết lập mã PIN mới (4 số)' : 'Nhập mã PIN của bạn'}
              </h3>
              <input 
                type="password" 
                maxLength={4}
                placeholder="****" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 font-black text-center focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all placeholder:text-slate-600 tracking-[1em] relative z-10"
              />
              <div className="flex gap-2 relative z-10 mt-6">
                <button 
                  onClick={() => setShowPinScreen(null)}
                  className="flex-1 bg-black/40 hover:bg-black/60 border border-white/5 text-slate-400 hover:text-white font-black py-4 rounded-xl active:scale-95 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Trở lại
                </button>
                <button 
                  onClick={() => handleLogin(showPinScreen.tiktokId, pinInput)}
                  disabled={pinInput.length < 4 || loading}
                  className="flex-[2] bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-red-900 font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(234,179,8,0.3)] hover:shadow-[0_10px_30px_rgba(234,179,8,0.5)] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-[10px] relative overflow-hidden group border-b-4 border-yellow-700"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                  <span className="relative z-10">
                    {loading ? <Loader2 className="animate-spin text-red-900 mx-auto w-4 h-4" /> : showPinScreen.isNew ? 'Xác nhận' : 'Vào Game'}
                  </span>
                </button>
              </div>
            </div>
          )}
          
          <div className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
            Hệ thống bảo mật • 42 người đang mở túi ⚡
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
    <div className={cn("min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131b2f] via-[#0a0f1d] to-[#04060b] pb-24 font-sans select-none text-slate-200 transition-all duration-300 relative overflow-x-hidden", screenShake && "animate-shake-screen")}>
      <BackgroundEffects />
      {/* Premium ambient light blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Winning Marquee (Bento Style) */}
      <div className="bg-black/60 backdrop-blur-md text-yellow-400 h-10 overflow-hidden flex items-center border-b border-white/5">
        <div className="animate-marquee whitespace-nowrap font-black text-xs uppercase tracking-widest">
          {[...publicHistory, 
            { tiktokId: '@haidang_9x', prize: 'iPhone 15 Pro' },
            { tiktokId: '@thuytien.p', prize: 'iPhone 14' },
            { tiktokId: '@jack_gamer', prize: 'iPhone 15 Pro Max' },
            { tiktokId: '@momo_kun', prize: 'iPhone 13' }
          ].map((h, i) => (
            <span key={i} className="mx-12">
              🔥 <span className="text-white">{h.tiktokId}</span> vừa trúng <span className="bg-yellow-500 text-black px-2 py-0.5 rounded ml-1">{h.prize}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Navbar (Bento Style) */}
      <nav className="bg-[#0a0f1d]/80 backdrop-blur-xl px-5 py-4 sticky top-0 z-50 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-xl shadow-lg shadow-red-900/40">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white italic uppercase">BENTO<span className="text-yellow-400">BOX</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] text-slate-500 font-black uppercase leading-tight tracking-widest">{user.shopName || user.tiktokId}</p>
            <p className="font-black text-yellow-400 text-lg tabular-nums leading-tight">
              {user.balance.toLocaleString()}đ
            </p>
          </div>
          {user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim().length > 0 ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white/10 object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
               <User className="w-5 h-5 text-slate-400" />
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setView('admin')} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </nav>

      {/* Main View */}
      <main className="p-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && <HomeView key="home" user={user} setUser={setUser} onOpen={requestOpenBox} onQuickOpen={handleMultiOpen} setView={setView} />}
            {view === 'spin' && <SpinView key="spin" user={user} setUser={setUser} setScreenShake={setScreenShake} />}
            {view === 'recharge' && <RechargeView key="recharge" user={user} config={config} prefill={rechargeDraft} onUsedPrefill={() => setRechargeDraft(null)} />}
            {view === 'collection' && <CollectionView key="collection" user={user} setUser={setUser} />}
            {view === 'account' && <AccountView key="account" user={user} setUser={setUser} onLogout={handleLogout} onRechargeAgain={(data: any) => { setRechargeDraft(data); setView('recharge'); }} setView={setView} />}
            {view === 'leaderboard' && <LeaderboardView key="leaderboard" />}
            {view === 'admin' && <AdminPanelView key="admin" />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Chatbot user={user} />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-3xl border-t border-white/5 flex justify-around py-4 px-2 z-[90] safe-area-bottom shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        {[
          { id: 'home', icon: Home, label: 'Sảnh' },
          { id: 'spin', icon: Play, label: 'Game' },
          { id: 'recharge', icon: CreditCard, label: 'Nạp' },
          { id: 'collection', icon: Package, label: 'Sưu tập' },
          { id: 'leaderboard', icon: Trophy, label: 'Top' },
          { id: 'account', icon: User, label: 'Me' },
          ...(isAdmin ? [{ id: 'admin', icon: Settings, label: 'Admin' }] : [])
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 relative group",
              view === item.id ? "text-yellow-400 -translate-y-2" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {view === item.id && (
              <>
                 <motion.div layoutId="nav-glow" className="absolute -top-1 w-10 h-10 bg-yellow-400/20 blur-xl rounded-full" />
                 <div className="absolute -bottom-3 w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,1)]" />
              </>
            )}
            <item.icon className={cn("w-6 h-6 transition-all duration-300 relative z-10", view === item.id ? "scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "group-hover:scale-110")} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest transition-all relative z-10", view === item.id ? "opacity-100" : "opacity-0 translate-y-2 group-hover:opacity-50 group-hover:translate-y-0")}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Loading Spinners */}
      <AnimatePresence>
        {isInitialLoading && <LoadingSpinner text="ĐANG TẢI TRÒ CHƠI..." />}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {boxToConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xs bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-white/10 space-y-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full" />
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg border-2 border-white/20 relative z-10">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Xác nhận</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed mb-2">
                  Bạn đang chọn loại <span className="text-white font-black uppercase">{boxToConfirm.name}</span>
                </p>

                <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5 mb-4 text-left">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={insuranceActive} onChange={e => setInsuranceActive(e.target.checked)} className="w-4 h-4 rounded checked:bg-yellow-500 cursor-pointer" />
                    <span className="text-yellow-400 text-xs font-bold leading-tight flex-1">Bảo hiểm thua cuộc (+5k/lượt)</span>
                  </label>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight tracking-wider">
                     Nếu mở trượt 10 lần hệ thống tự động hoàn trả 50.000đ
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const id = boxToConfirm.id;
                      setBoxToConfirm(null);
                      startInteractiveMode(id);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest flex justify-between items-center px-6 relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute inset-0 bg-white/5 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span> Mở Thường</span>
                    <span className="text-yellow-400 relative z-10">{(boxToConfirm.price + (insuranceActive ? 5000 : 0)).toLocaleString()}đ</span>
                  </button>

                  <button 
                    onClick={() => {
                      const id = boxToConfirm.id;
                      setBoxToConfirm(null);
                      handleMultiOpen(id, 5);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600/60 to-yellow-600/60 hover:from-orange-500/80 hover:to-yellow-500/80 border border-yellow-500/30 hover:border-yellow-400/50 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest flex justify-between items-center px-6 relative overflow-hidden group shadow-[0_5px_15px_rgba(234,179,8,0.15)] hover:shadow-[0_8px_25px_rgba(234,179,8,0.25)]"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <div className="flex items-center gap-2 relative z-10 w-full">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex flex-col items-center justify-center text-[10px] shadow-inner text-yellow-100 shrink-0">5</span>
                      <div className="flex flex-col items-start leading-tight flex-1">
                        <span>Mở Nhanh</span>
                        <span className="text-[9px] text-yellow-300 font-bold">Giảm 5%</span>
                      </div>
                    </div>
                    <span className="relative z-10 text-yellow-200 shrink-0">{((boxToConfirm.price * 5 * 0.95) + (insuranceActive ? 25000 : 0)).toLocaleString()}đ</span>
                  </button>

                  <button 
                    onClick={() => {
                      const id = boxToConfirm.id;
                      setBoxToConfirm(null);
                      handleMultiOpen(id, 10);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 border border-yellow-400/50 hover:border-yellow-300 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest flex justify-between items-center px-6 relative overflow-hidden group shadow-[0_10px_30px_rgba(234,179,8,0.3)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.5)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <div className="absolute -inset-2 bg-yellow-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity pointer-events-none -z-10" />
                    <div className="flex items-center gap-2 relative z-10 w-full">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] shadow-inner text-yellow-50 animate-pulse shrink-0">10</span>
                      <div className="flex flex-col items-start leading-tight flex-1">
                        <span className="flex items-center gap-1 drop-shadow-md">Tốc Độ Bàn Thờ <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" /></span>
                        <span className="text-[9px] text-yellow-100 font-bold drop-shadow-sm">Giảm 10% (Siêu tốc)</span>
                      </div>
                    </div>
                    <span className="text-white font-black relative z-10 drop-shadow-md tracking-wider shrink-0">{((boxToConfirm.price * 10 * 0.9) + (insuranceActive ? 50000 : 0)).toLocaleString()}đ</span>
                  </button>
                </div>
              </div>
              <div className="pt-4 relative z-10">
                <button 
                  onClick={() => setBoxToConfirm(null)}
                  className="w-full text-slate-500 hover:text-white font-black py-3 rounded-full active:scale-95 transition-all text-[10px] uppercase tracking-widest border border-slate-700/50 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/80 relative group shadow-inner"
                >
                  <span className="relative z-10 flex flex-col items-center justify-center">Hủy bỏ <span className="absolute bottom-1 w-4 h-0.5 bg-slate-600 rounded-full group-hover:bg-slate-400 group-hover:w-8 transition-all" /></span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Single 3D Box */}
      <AnimatePresence>
        {interactiveState && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-2xl"
          >
            <h2 className="absolute top-[20%] text-xl sm:text-2xl font-black text-yellow-400 uppercase italic tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              {interactiveState.phase === 'dice-roll' ? 'ĐANG LẮC XÚC XẮC...' : interactiveState.phase === 'spinning' ? 'ĐANG KHUI THẦN TỐC...' : ''}
            </h2>
            
            <div className="relative flex items-center justify-center mt-[-10%]">
               {/* Virtual Dice Roll phase */}
               {interactiveState.phase === 'dice-roll' && (
                 <motion.div
                    animate={{ 
                      rotateX: [0, 180, 360, 540, 720],
                      rotateY: [0, 90, 180, 270, 360],
                      z: [0, 50, 0, 50, 0]
                    }}
                    transition={{ 
                      duration: 1, 
                      ease: 'easeInOut' 
                    }}
                    className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-gray-200 relative perspective-[1000px] transform-style-3d"
                 >
                    <div className="grid grid-cols-3 gap-2 p-4 w-full h-full">
                       <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full place-self-start" />
                       <div />
                       <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full place-self-end" />
                       <div />
                       <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full place-self-center" />
                       <div />
                       <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full place-self-start" />
                       <div />
                       <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full place-self-end" />
                    </div>
                 </motion.div>
               )}

               {/* 3D Box auto-spin phase */}
               {(interactiveState.phase === 'spinning') && (
                 <motion.div
                    animate={{ 
                      x: [0, -8, 8, -6, 6, -4, 4, 0], 
                      y: [0, -4, 4, -4, 4, -2, 2, 0],
                      scale: [1, 1.05, 1, 1.05, 1],
                      filter: ['drop-shadow(0 0 20px #eab308)', 'drop-shadow(0 0 80px #ffffff)', 'drop-shadow(0 0 20px #eab308)'] 
                    }}
                    transition={{ 
                      x: { duration: 0.3, repeat: Infinity, ease: 'linear' },
                      y: { duration: 0.3, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 0.5, repeat: Infinity, ease: 'linear' },
                      filter: { duration: 0.8, repeat: Infinity } 
                    }}
                    className="w-40 h-40 sm:w-56 sm:h-56 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[3rem] flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/20 rounded-[inherit] overflow-hidden">
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.8)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_0.7s_infinite]" />
                    </div>
                    <Gift className="w-20 h-20 sm:w-28 sm:h-28 text-white relative z-10 drop-shadow-lg" />
                 </motion.div>
               )}

               {/* Grand Reveal */}
               {interactiveState.phase === 'grand-reveal' && (
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 150 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateZ: [0, -5, 5, -2, 2, 0] }}
                    transition={{ duration: 1, ease: 'backOut' }}
                    className="w-64 h-80 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-3xl p-4 flex flex-col items-center justify-center shadow-[0_0_150px_rgba(250,204,21,1)] border-4 border-white relative z-50 inner-glow overflow-visible"
                 >
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                       <div className="w-[300%] h-[300%] absolute -top-[100%] -left-[100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,1)_360deg)] animate-[spin_2s_linear_infinite] mix-blend-overlay" />
                    </div>
                    <Smartphone className="w-24 h-24 text-red-700 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] relative z-10 animate-bounce" />
                    <h3 className="mt-8 text-2xl font-black text-red-900 uppercase italic tracking-tighter relative z-10 drop-shadow-md text-center leading-tight">
                        {interactiveState.apiResult?.results?.[0]?.result?.split('+')[0] || 'SIÊU PHẨM'} 
                        <br/><span className="text-xl px-3 py-1 bg-gradient-to-r from-red-600 to-red-800 text-yellow-300 tracking-widest rounded-xl mt-2 inline-block border-2 border-yellow-400 shadow-xl">TRÚNG LỚN!</span>
                    </h3>
                 </motion.div>
               )}

               {/* Item Reveal */}
               {interactiveState.phase === 'item-reveal' && (
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                    className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-[3rem] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(192,38,211,0.6)] border-4 border-white/80"
                 >
                    <Package className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-2xl animate-bounce-subtle" />
                    <p className="text-yellow-300 font-black uppercase tracking-widest mt-6 text-sm drop-shadow-md">Trúng Vật Phẩm!</p>
                 </motion.div>
               )}

               {/* Fragment Reveal */}
               {interactiveState.phase === 'fragment-reveal' as any && (
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                    className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-[3rem] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.4)] border-4 border-yellow-500/50 relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                    <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 drop-shadow-2xl animate-bounce-subtle relative z-10 opacity-80" />
                    <p className="text-yellow-400 font-black uppercase tracking-widest mt-6 text-xs drop-shadow-md relative z-10 text-center">Một Mảnh Ghép iPhone!<br/><span className="text-[10px] text-yellow-200">Tiếp tục sưu tập nhé!</span></p>
                 </motion.div>
               )}

               {/* Consolation Reveal */}
               {interactiveState.phase === 'consolation-reveal' && (
                 <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                    className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[3rem] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.6)] border-4 border-white/80 relative"
                 >
                    <p className="absolute top-4 text-[10px] text-green-100/70 font-black tracking-widest uppercase text-center w-full">Rất tiếc, chúc bạn may mắn lần sau</p>
                    <Banknote className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-2xl animate-bounce-subtle mt-4" />
                    <p className="text-yellow-100 font-black uppercase tracking-widest mt-4 text-[10px] drop-shadow-md">Hoàn Tiền Khích Lệ</p>
                    <p className="text-white font-black tracking-widest text-lg drop-shadow-md mt-1">
                      +{interactiveState.apiResult?.results?.[0]?.amount?.toLocaleString() || '50,000'}đ
                    </p>
                 </motion.div>
               )}

               {/* Sad Close */}
               {interactiveState.phase === 'sad-close' && (
                 <motion.div
                    initial={{ scale: 1, rotateY: 0, y: 0, opacity: 1 }}
                    animate={{ scale: [1, 0.9, 0.85], rotateX: [0, 10, 25], y: [0, 20, 40], opacity: [1, 0.8, 0.5], filter: 'grayscale(100%)' }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="w-40 h-40 sm:w-56 sm:h-56 bg-[#1e293b] rounded-[3rem] flex items-center justify-center shadow-inner border border-slate-700 relative overflow-hidden"
                 >
                    <X className="w-16 h-16 sm:w-24 sm:h-24 text-slate-600 relative z-10" />
                    <p className="absolute bottom-6 text-slate-500 text-[10px] uppercase font-black tracking-widest">Chúc bạn may mắn lần sau</p>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi Interactive Grid */}
      <AnimatePresence>
        {multiGame && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-2xl"
          >
            <h2 className="absolute top-[6%] sm:top-[8%] text-xl sm:text-2xl font-black text-yellow-400 uppercase italic tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] bg-black/40 px-6 py-2 rounded-full border border-yellow-500/30 backdrop-blur-md">
               KHUI NHANH ({multiGame.completedCount}/{multiGame.totalToOpen})
            </h2>
             {multiGame.queue.length > 0 ? (
               <div className="absolute top-[13%] sm:top-[16%] text-slate-300 text-sm font-bold bg-[#1e293b]/80 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Bạn còn {multiGame.queue.length} lượt chọc hộp!
               </div>
             ) : (
               <div className="absolute top-[13%] sm:top-[16%] text-yellow-400 text-sm font-black bg-yellow-500/20 px-4 py-1.5 rounded-full border border-yellow-400/30 flex items-center gap-2 animate-bounce-subtle">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Đang thu thập kết quả...
               </div>
             )}
            
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10">
               {multiGame.grid.map((box) => (
                  <div key={box.id} className="relative w-24 h-24 sm:w-32 sm:h-32">
                      {box.mode === 'idle' && (
                        <motion.button
                           onClick={() => handleGridBoxClick(box.slotIndex)}
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className={cn(
                             "w-full h-full rounded-[2rem] flex flex-col items-center justify-center border-4 border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer group relative",
                             multiGame.boxTypeId === 'box100' ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 hover:shadow-[0_0_40px_rgba(250,204,21,0.6)]" : 
                             multiGame.boxTypeId === 'box200' ? "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] text-white" :
                             "bg-gradient-to-br from-red-400 via-red-500 to-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] text-white"
                           )}
                        >
                           <div className="absolute inset-0 bg-white/20 translate-x-[-150%] skew-x-[-45deg] group-hover:animate-sweep pointer-events-none" />
                           <Gift className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
                           <span className="text-[10px] font-black uppercase text-white/50 mt-1">MỞ</span>
                        </motion.button>
                      )}

                      {box.mode === 'spawning' && (
                        <motion.div
                           initial={{ y: 50, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           transition={{ duration: 0.4, ease: "easeOut" }}
                           className={cn(
                             "w-full h-full rounded-[2rem] flex items-center justify-center border-4 border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.5)]",
                             multiGame.boxTypeId === 'box100' ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600" : 
                             multiGame.boxTypeId === 'box200' ? "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600" :
                             "bg-gradient-to-br from-red-400 via-red-500 to-red-600"
                           )}
                        >
                           <Gift className="w-10 h-10 text-white drop-shadow-md opacity-30" />
                        </motion.div>
                      )}

                      {box.mode === 'opening' && (
                        <motion.div
                           animate={{ 
                             rotateZ: [0, -10, 10, -10, 10, -5, 5, 0],
                             scale: [1, 1.15, 1.1, 1.15, 1] 
                           }}
                           transition={{ duration: 0.8 }}
                           className={cn(
                             "w-full h-full rounded-[2rem] flex items-center justify-center border-4 border-white shadow-[0_0_50px_rgba(255,255,255,1)] z-10 relative overflow-hidden",
                             multiGame.boxTypeId === 'box100' ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600" : 
                             multiGame.boxTypeId === 'box200' ? "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600" :
                             "bg-gradient-to-br from-red-400 via-red-500 to-red-600"
                           )}
                        >
                           <div className="absolute inset-0 bg-white/50 animate-pulse-ring pointer-events-none" />
                           <Gift className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                        </motion.div>
                      )}

                      {box.mode === 'win-reveal' && (
                        <motion.div
                           initial={{ scale: 0.5, rotateY: 90 }}
                           animate={{ scale: 1, rotateY: 0 }}
                           transition={{ type: 'spring', bounce: 0.5 }}
                           className={cn(
                             "w-full h-full rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl relative overflow-hidden",
                             box.result?.type === 'jackpot' ? "bg-gradient-to-b from-yellow-300 to-yellow-600 border-yellow-400 animate-pulse" :
                             box.result?.type === 'item' ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 border-fuchsia-300" :
                             box.result?.type === 'fragment' ? "bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-500/50" :
                             "bg-gradient-to-br from-green-400 to-emerald-600 border-green-300"
                           )}
                        >
                           {box.result?.type === 'jackpot' && <Smartphone className="w-10 h-10 text-red-700 drop-shadow-md relative z-10" />}
                           {box.result?.type === 'item' && <Package className="w-10 h-10 text-white drop-shadow-md relative z-10" />}
                           {box.result?.type === 'fragment' && (
                              <div className="flex flex-col items-center justify-center z-10 relative">
                                <span className="text-[10px] font-black text-yellow-100 uppercase mb-1">Mảnh Ghép</span>
                                <Smartphone className="w-8 h-8 text-white drop-shadow-md opacity-80" />
                              </div>
                           )}
                           {['consolation', 'rescue'].includes(box.result?.type as string) && (
                              <div className="flex flex-col items-center justify-center z-10 relative">
                                <span className="text-[10px] font-black text-white/80 uppercase">Tiền thưởng</span>
                                <span className="text-sm font-black text-white drop-shadow-md">+{box.result?.amount?.toLocaleString() || '50,000'}đ</span>
                              </div>
                           )}
                           <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                        </motion.div>
                      )}

                      {box.mode === 'lose-reveal' && (
                        <motion.div
                           initial={{ scale: 1 }}
                           animate={{ scale: [1, 0.9, 0.8], filter: 'grayscale(100%)', opacity: 0.5, rotateZ: [-5, 5, -5] }}
                           transition={{ duration: 0.6 }}
                           className="w-full h-full rounded-2xl flex items-center justify-center bg-[#1e293b] border border-slate-700 shadow-inner overflow-hidden relative"
                        >
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[1px] h-[150%] bg-black/40 rotate-[35deg] absolute" />
                              <div className="w-[1px] h-[150%] bg-black/40 rotate-[-20deg] absolute" />
                           </div>
                           <X className="w-10 h-10 text-slate-600 relative z-10 drop-shadow-xl" />
                        </motion.div>
                      )}

                      {box.mode === 'departing' && (
                        <motion.div
                           initial={{ opacity: 1, scale: 1 }}
                           animate={{ opacity: 0, scale: 0.5, y: -20 }}
                           transition={{ duration: 0.3 }}
                           className="w-full h-full rounded-2xl flex items-center justify-center bg-[#1e293b]"
                        />
                      )}

                      {box.mode === 'empty' && (
                        <div className="w-full h-full rounded-2xl bg-black/20 border border-white/5" />
                      )}
                  </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-y-auto",
              (result.toLowerCase().includes('iphone') || result.toLowerCase().includes('ipad')) ? "bg-yellow-500/20" : "bg-black/90"
            )}
          >
            {(result.toLowerCase().includes('iphone') || result.toLowerCase().includes('ipad')) && !result.toLowerCase().includes('mảnh') ? (
              // SUCCESS - VÀNG KIM
              <div 
                className="w-full max-w-sm bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 p-8 rounded-[2rem] border-4 border-yellow-100 shadow-[0_0_50px_rgba(250,204,21,0.5)] text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                
                <div className="flex flex-col items-center justify-center relative z-10">
                  <Smartphone className="w-16 h-16 text-red-900" />
                  <h2 className="text-2xl font-black text-red-900 uppercase italic tracking-tighter mt-4 leading-none">BẠN ĐÃ TRÚNG <br/> SIÊU PHẨM!</h2>
                </div>
                
                <div className="relative z-10 my-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-yellow-400/30">
                  <p className="text-[9px] text-yellow-300 font-black uppercase tracking-widest mb-1">Phần thưởng:</p>
                  <p className="text-xl font-black text-white uppercase tracking-tighter leading-tight">{result}</p>
                </div>

                <div className="bg-white/20 p-6 rounded-[2.5rem] border border-white/30 space-y-3 mb-6">
                  <h3 className="text-red-900 text-xs font-black uppercase tracking-widest text-center">Địa chỉ nhận hàng</h3>
                  {(user.phone && user.address) ? (
                    <div className="text-left bg-white/40 border border-white/20 rounded-2xl px-5 py-4">
                       <p className="text-xs font-bold text-red-900 mb-1">Số điện thoại: <span className="font-black text-red-700">{user.phone}</span></p>
                       <p className="text-xs font-bold text-red-900">Địa chỉ: <span className="font-black text-red-700">{user.address}</span></p>
                       <p className="text-[10px] text-red-800/60 mt-2 font-bold italic">* Có thể thay đổi địa chỉ trong phần Me</p>
                    </div>
                  ) : (
                    <>
                      <input id="res-phone" className="w-full bg-white/40 border border-white/20 rounded-2xl px-5 py-4 text-xs font-bold text-red-900 placeholder:text-red-900/40" placeholder="Số điện thoại..." />
                      <textarea id="res-address" className="w-full bg-white/40 border border-white/20 rounded-2xl px-5 py-4 text-xs font-bold h-24 text-red-900 placeholder:text-red-900/40" placeholder="Địa chỉ chi tiết..." />
                    </>
                  )}
                </div>

                <button 
                   onClick={async () => {
                     const phone = user.phone || (document.getElementById('res-phone') as HTMLInputElement)?.value;
                     const address = user.address || (document.getElementById('res-address') as HTMLTextAreaElement)?.value;
                     if (!phone || !address) return toast('Vui lòng nhập đủ thông tin');
                     
                     const winRes = await fetch('/api/admin/winners');
                     const allWin = await winRes.json();
                     // find the latest pending win or any win if no pending is found directly right now, might use the top one
                     const myWin = allWin.find((w: any) => w.tiktokId === user.tiktokId && w.status === 'pending');
                     
                     if (myWin) {
                       await fetch('/api/update-winner-info', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ winnerId: myWin.id, address, phone })
                       });
                       
                       if (!user.phone || !user.address) {
                          await fetch('/api/user/update-profile', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ tiktokId: user.tiktokId, address, phone })
                          });
                          setUser({ ...user, phone, address });
                       }
                     }
                     
                     stopAllSounds();
                     setResult(null);
                     toast('Đã hoàn tất đơn hàng! Admin sẽ đóng gói ngay.', 'success');
                   }}
                   className="w-full bg-red-600 text-white font-black py-5 rounded-3xl shadow-xl uppercase tracking-widest text-sm active:scale-95 transition-all"
                >
                  {(user.phone && user.address) ? 'Xác nhận đơn hàng' : 'Gửi Thông Tin Nhận Hàng'}
                </button>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank');
                    }}
                    className="flex-1 bg-[#1877F2]/20 border border-white/20 text-white font-bold py-3 rounded-2xl text-[10px] flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Facebook
                  </button>
                </div>
              </div>
            ) : (
              // FAILURE - TỐI MỜ
              <motion.div 
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group">
                   <AlertCircle className="w-24 h-24 text-slate-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">SUÝT CHÚT NỮA LÀ TRÚNG RỒI!</h2>
                  <p className="text-slate-400 font-extrabold uppercase text-xs tracking-[0.2em] opacity-60">Siêu phẩm chỉ cách bạn một bước chân thôi...</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      stopAllSounds();
                      setResult(null);
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-black px-12 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(234,179,8,0.4)] uppercase tracking-[0.1em] text-lg active:scale-95 transition-all border-b-4 border-yellow-700 relative overflow-hidden group hover:shadow-[0_20px_80px_rgba(234,179,8,0.6)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <div className="absolute -inset-2 bg-yellow-400 bg-opacity-30 rounded-[inherit] blur-xl group-hover:animate-pulse-ring pointer-events-none" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       THỬ LẠI NGAY <Gift className="w-5 h-5 text-red-900 group-hover:animate-bounce-subtle" />
                    </span>
                  </button>
                  <button 
                    onClick={() => {
                      stopAllSounds();
                      setResult(null);
                    }} 
                    className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors relative group"
                  >
                    Để sau vậy
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-slate-500 group-hover:w-full transition-all duration-300" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* Notification banner removed, using ToastContainer instead */}
      </AnimatePresence>

      {/* Multi-Open Modal */}
      <AnimatePresence>
        {multiOpenResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <div className="w-full max-w-md bg-gradient-to-b from-[#1e293b] to-black p-6 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter text-center mb-6">Kết Quả Khui Nhanh</h2>
               <div className="max-h-[60vh] overflow-y-auto space-y-3 px-2 custom-scrollbar">
                  {multiOpenResult.results.map((r, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-3xl border flex items-center justify-between",
                      r.type === 'jackpot' ? "bg-yellow-500 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-red-900" :
                      r.type === 'item' ? "bg-purple-600/20 border-purple-500/30 text-white" :
                      r.type === 'rescue' ? "bg-blue-600/20 border-blue-500/30 text-white" :
                      "bg-white/5 border-white/5 text-slate-400"
                    )}>
                       <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <span className="opacity-50">#{i+1}</span>
                          {r.result}
                       </div>
                       {r.type === 'jackpot' && <Trophy className="w-5 h-5 text-red-900 drop-shadow-md" />}
                       {r.type === 'item' && <Package className="w-5 h-5 text-purple-400" />}
                       {r.type === 'rescue' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </div>
                  ))}
               </div>
               <button 
                  onClick={() => {
                    stopAllSounds();
                    setMultiOpenResult(null);
                  }}
                  className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
               >
                  TUYỆT VỜI
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Envelope Overlay */}
      <AnimatePresence>
         {eventsState?.envelope && (
           <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="fixed bottom-24 right-4 z-50">
              <button onClick={async () => {
                  try {
                     const res = await fetch('/api/claim-envelope', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tiktokId: user?.tiktokId}) });
                     const d = await res.json();
                     if(d.success) {
                        setEventsState({ ...eventsState, envelope: null });
                        toast(`Chúc mừng! Bạn đã chớp được lì xì: ${d.prize.toLocaleString()}đ`);
                        playSound(SOUND_WIN);
                        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                        setUser(prev => prev ? {...prev, balance: prev.balance + d.prize} : null);
                     } else {
                        toast(d.error);
                     }
                  }catch(e){}
              }} className="bg-gradient-to-br from-red-600 to-red-800 text-yellow-300 w-20 h-24 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.5)] border border-yellow-400 flex flex-col items-center justify-center animate-bounce-subtle z-50 overflow-hidden">
                 <div className="absolute inset-0 bg-white/10 animate-[shimmer_2s_infinite] pointer-events-none" />
                 <span className="text-3xl drop-shadow-md">🧧</span>
                 <span className="text-[10px] font-black mt-2 text-center leading-tight tracking-tighter shadow-black text-yellow-300 relative z-10">MỞ<br/>LÌ XÌ</span>
                 <span className="absolute -top-2 -right-2 bg-red-500 border-2 border-yellow-400 w-7 h-7 rounded-full text-[10px] font-black flex items-center justify-center text-white animate-pulse">{eventsState.envelope.remains}</span>
              </button>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Shake Event Overlay */}
      <AnimatePresence>
         {eventsState?.shakeEventActive && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-4">
               <h2 className="text-4xl font-black text-yellow-400 mb-2 text-center drop-shadow-lg italic uppercase">GIỜ VÀNG LẮC QUÀ!</h2>
               <p className="text-white font-bold text-center mb-10 tracking-widest uppercase text-sm">Lắc điện thoại hoặc Bấm vào màn hình</p>
               <motion.button 
                  animate={isShaking ? { x: [-15, 15, -15, 15, 0], rotateZ: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  onClick={async () => {
                      setIsShaking(true);
                      playSound(SOUND_DICE);
                      setTimeout(() => setIsShaking(false), 500);
                      try {
                         const res = await fetch('/api/shake-claim', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tiktokId: user?.tiktokId}) });
                         const d = await res.json();
                         if(d.success) {
                            toast(`Tuyệt vời! Bạn nhận được ${d.reward.toLocaleString()}đ!`, 'success');
                            playSound(SOUND_WIN);
                            confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 }, colors: ['#ffea00', '#ff0000', '#00ff00', '#0000ff'] });
                            setUser(prev => prev ? {...prev, balance: prev.balance + d.reward} : null);
                            setTimeout(() => {
                               setEventsState({ ...eventsState, shakeEventActive: false });
                            }, 3000);
                         } else {
                            if (d.error !== 'Bạn đã nhận quà sự kiện này rồi!') {
                                toast(d.error, 'error');
                                playSound(SOUND_FAIL);
                            }
                         }
                      }catch(e){}
                  }} 
                  className="w-56 h-56 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(234,179,8,0.6)] border-8 border-white/20 mb-8 active:scale-95 transition-all outline-none">
                  <Smartphone className="w-24 h-24 text-white mb-2" />
                  <span className="text-white font-black text-2xl uppercase tracking-wider">LẮC LẮC</span>
               </motion.button>
               <button onClick={() => setEventsState({...eventsState, shakeEventActive: false})} className="mt-8 px-8 py-3 font-bold uppercase tracking-widest text-xs bg-white/10 rounded-full hover:bg-white/20 transition-colors">Đóng tạm thời</button>
           </motion.div>
         )}
      </AnimatePresence>

    </div>
    </>
  );
}

// --- Sub-Views ---

const MiniGameBento: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="bg-black rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 p-4">
           <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">HOT</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-4xl">🎲🎁</div>
           <div>
              <h3 className="text-white font-black uppercase text-base tracking-tighter italic">MINI GAME</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Thử vận may, quà khủng!</p>
           </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-[#111] rounded-[2rem] p-6 w-full max-w-sm border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black uppercase italic text-lg">Chọn Trò Chơi</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setView('spin'); setIsOpen(false); }} className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 hover:border-yellow-500/50 transition-colors col-span-2">
                  <div className="text-3xl mb-2">🎁</div>
                  <h4 className="text-white font-black text-xs uppercase">Vòng Quay</h4>
                  <p className="text-slate-500 text-[9px] uppercase font-bold text-center">Săn iPhone 14</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HomeView: React.FC<{ user: UserData, setUser: (user: any) => void, onOpen: (id: string) => void, onQuickOpen: (id: string, count: number) => void, setView: (view: any) => void }> = ({ user, setUser, onOpen, onQuickOpen, setView }) => {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [jackpot, setJackpot] = useState<number>(0);

  useEffect(() => {
    fetch('/api/admin/config').then(res => res.json()).then(data => setBoxes(data.prices || []));
    fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
    fetch('/api/jackpot').then(res => res.json()).then(data => setJackpot(data.jackpotAmount || 0));
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        box50: (prev.box50 || 12050) + Math.floor(Math.random() * 2),
        box100: (prev.box100 || 8420) + Math.floor(Math.random() * 2),
        box200: (prev.box200 || 4560) + Math.floor(Math.random() * 2),
      }));
      // Auto-refresh jackpot frequently
      fetch('/api/jackpot').then(res => res.json()).then(data => setJackpot(data.jackpotAmount || 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const suggestRandomBox = () => {
    if (boxes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * boxes.length);
    const box = boxes[randomIndex];
    toast(`🎲 Gợi ý: Hãy thử vận may với hộp ${box.name}!`, 'info');
  };

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6 pb-4"
    >
      {/* Bento Banner */}
      <div className="bg-[#D0021B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="bg-yellow-400 text-red-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">HŨ VÀNG SIÊU PHẨM</div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
            {jackpot > 0 ? (
               <motion.span 
                 key={jackpot}
                 initial={{ scale: 1.1, textShadow: "0 0 30px rgba(253,224,71,1)" }}
                 animate={{ scale: 1, textShadow: "0 0 15px rgba(253,224,71,0.6)" }}
                 className="text-yellow-300 inline-block"
               >
                 {jackpot.toLocaleString()}đ
               </motion.span>
            ) : "ĐANG TẢI HŨ..."}
          </h2>
          <p className="text-red-100 text-[11px] font-bold opacity-90 uppercase tracking-widest leading-tight mt-1">Trúng siêu phẩm công nghệ ẵm trọn HŨ VÀNG!</p>
          <div className="pt-4 flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Sôi động nhất hôm nay!</span>
          </div>
        </div>
        <Trophy className="absolute -bottom-6 -right-6 w-48 h-48 text-yellow-500/30 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
      </div>

      {/* Daily Gift Highlight */}
      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl flex items-center justify-between relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
        onClick={async () => {
           const res = await fetch('/api/daily-checkin', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ tiktokId: user.tiktokId })
           });
           const data = await res.json();
           if (data.success) {
             toast(data.message);
             setUser({ ...user, balance: data.balance, lastCheckin: new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) });
             confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
           } else {
             toast(data.error);
           }
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-2xl relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-2xl animate-pulse-ring pointer-events-none" />
            <Gift className="w-6 h-6 text-yellow-500 animate-bounce-subtle relative z-10" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase italic text-sm tracking-tighter leading-tight">Quà Tặng Hàng Ngày</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Điểm danh nhận tới 10.000đ</p>
          </div>
        </div>
        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Mini Game Bento */}
      <MiniGameBento setView={setView} />

      {/* Bento Grid Boxes */}
      <div className="mb-4 text-center">
        <button 
           onClick={suggestRandomBox}
           className="bg-purple-600/20 text-purple-300 font-bold px-6 py-2 rounded-full text-xs hover:bg-purple-600/30 transition-all border border-purple-500/30 shadow-sm"
        >
          🎲 Gợi ý hộp ngẫu nhiên
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {boxes.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-slate-500 font-medium">
            <p className="text-sm">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          boxes.map((box, idx) => {
            const isWide = idx % 3 === 0; // Every 3rd box is wide (e.g. 0, 3, 6)
            return (
              <motion.div 
                key={box.id}
                whileHover={{ 
                  scale: 1.03, 
                  rotate: [-2, 2, -2, 2, 0],
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)" 
                }}
                transition={{ duration: 0.4 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-[2rem] p-0.5 relative overflow-hidden shadow-xl transition-all duration-300 group cursor-pointer",
                  isWide ? "bg-gradient-to-br from-yellow-300 to-yellow-600 col-span-2 min-h-[11rem] hover:animate-glow-pulse" : "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 h-auto min-h-[14rem] hover:border-yellow-400/50 hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                )}
              >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-150%] skew-x-[-45deg] group-hover:animate-sweep pointer-events-none z-20" />
            <div className={cn(
              "h-full rounded-[1.9rem] p-5 flex flex-col justify-between items-center text-center relative overflow-hidden",
              isWide ? "bg-gradient-to-r from-red-600 to-red-700 flex-row text-left gap-4" : "bg-[#1e293b]/40 backdrop-blur-xl"
            )}>
              {isWide && <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/20 blur-[40px] rounded-full pointer-events-none" />}
              {isWide ? (
                <>
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase w-fit mb-2 border border-white/30 backdrop-blur-sm">HOT PACKAGE</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white drop-shadow-md">{box.name}</h3>
                    <p className="text-3xl font-black text-yellow-400 tracking-tighter mt-1 tabular-nums drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{box.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <div className="relative">
                       <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-xl animate-pulse-ring rounded-full" />
                       <Gift className="w-12 h-12 text-white animate-bounce-subtle drop-shadow-2xl relative z-10" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onOpen(box.id)}
                        className="bg-white text-red-600 font-black px-4 py-2.5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-yellow-50 uppercase text-[10px] tracking-widest active:scale-[0.98] transition-all"
                      >
                        KHUI NGAY
                      </button>
                      <button 
                        onClick={() => onQuickOpen(box.id, 5)}
                        className="bg-red-500/20 text-red-100 font-black px-4 py-2.5 rounded-2xl shadow-xl hover:bg-red-500/30 uppercase text-[10px] tracking-widest active:scale-[0.98] transition-all"
                      >
                        KHUI NHANH
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                    <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-lg animate-pulse">HOT</div>
                    <div className="bg-yellow-500/20 text-yellow-500 text-[7px] font-black px-1.5 py-0.5 rounded border border-yellow-500/10 backdrop-blur-sm">BEST SELLER</div>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-2 relative z-10">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative group-hover:scale-110 transition-transform duration-300", box.color)}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-[inherit] transition-opacity duration-300" />
                      <Gift className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tighter text-white drop-shadow-md mt-2">{box.name}</h3>
                    <p className="text-xl font-black text-yellow-400 tabular-nums drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{box.price.toLocaleString()}đ</p>
                  </div>
                  <div className="w-full space-y-3 relative z-10 px-2 lg:px-4 pb-4">
                    <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest bg-black/20 p-2 rounded-lg border border-white/5 text-center mt-2">
                       LƯỢT CHƠI LỚN
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <button 
                        onClick={() => onOpen(box.id)}
                        className="w-full bg-white text-red-600 font-black py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-yellow-50 uppercase text-xs sm:text-sm tracking-widest active:scale-[0.98] transition-all"
                      >
                        KHUI NGAY
                      </button>
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => onQuickOpen(box.id, 5)}
                          className="flex-1 bg-red-500/20 text-red-100 font-black py-3 rounded-2xl shadow-xl hover:bg-red-500/30 uppercase text-xs sm:text-sm tracking-widest active:scale-[0.98] transition-all"
                        >
                          X5
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
            )
          })
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl relative overflow-hidden mt-8">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-yellow-400/10 blur-[50px] rounded-full" />
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">BẢNG XẾP HẠNG</h2>
          </div>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                    i === 0 ? "bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]" :
                    i === 1 ? "bg-slate-300 text-slate-800" :
                    i === 2 ? "bg-amber-600 text-amber-900" : "bg-white/10 text-white"
                  )}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-white truncate w-24">{u.tiktokId}</p>
                    <p className="text-[10px] text-slate-400 tracking-widest uppercase font-bold">
                      {u.iphonesWon > 0 ? `${u.iphonesWon} SIÊU PHẨM` : (u.itemsValue > 0 ? `${u.itemsValue.toLocaleString()}đ V.P` : 'CHƯA TRÚNG')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-yellow-400 tabular-nums">-{u.totalSpent.toLocaleString()}đ</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Đã nạp vào lỗ vũ trụ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const RechargeView: React.FC<{ user: UserData, config: Config | null, prefill?: any, onUsedPrefill?: () => void }> = ({ user, config, prefill, onUsedPrefill }) => {
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const [formData, setFormData] = useState({ type: 'VIETTEL', amount: '50000', serial: '', code: '' });

  useEffect(() => {
    if (prefill) {
      setMethod(prefill.type === 'BANK' ? 'bank' : 'card');
      setFormData({ 
        type: prefill.type, 
        amount: String(prefill.amount), 
        serial: prefill.serial === 'Chuyển khoản' ? '' : prefill.serial, 
        code: prefill.code 
      });
      if (onUsedPrefill) onUsedPrefill();
    }
  }, [prefill, onUsedPrefill]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const memo = `NAP ${user.tiktokId.replace(/^@/, '')}`.toUpperCase();
  const currentPayment = config?.paymentInfo?.bank;
  const amountVal = formData.amount || '0';

  const isNumeric = (val: string) => /^\d+$/.test(val?.replace(/\s/g, ''));
  
  // Dynamic VietQR logic
  let qrSrc = currentPayment?.qrUrl;
  const hasManualQR = qrSrc && qrSrc.startsWith('data:');
  
  if (!hasManualQR) {
    if (method === 'bank') {
      const bank = config?.paymentInfo?.bank;
      if (bank?.bankBin && bank?.account && isNumeric(bank.bankBin)) {
        const cleanBin = bank.bankBin.replace(/\s/g, '');
        const cleanAcc = bank.account.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
        qrSrc = `https://img.vietqr.io/image/${cleanBin}-${cleanAcc}-compact.png?amount=${amountVal}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(bank.name)}`;
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'card' && (!formData.serial || !formData.code)) return toast('Nhập đầy đủ thông tin');
    if (method === 'bank' && !formData.amount) return toast('Vui lòng nhập số tiền');
    
    setLoading(true);
    try {
      const payload = { 
        tiktokId: user.tiktokId, 
        type: method === 'card' ? formData.type : 'BANK', 
        amount: Number(formData.amount),
        serial: method === 'bank' ? 'Chuyển khoản' : formData.serial,
        code: method === 'bank' ? memo : formData.code
      };

      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        playSound(SOUND_SUCCESS);
        toast('Gửi yêu cầu thành công! Vui lòng đợi Admin duyệt lệnh (1-5 phút)', 'success');
      } else {
        playSound(SOUND_FAIL);
        toast(data.error || 'Có lỗi xảy ra', 'error');
      }
      setLoading(false);
    } catch (err) {
      playSound(SOUND_FAIL);
      toast('Có lỗi xảy ra', 'error');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Đã copy: ' + text);
  };

  return (
    <motion.div 
      key="recharge"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      {/* Tabs */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2">
        {[
          { id: 'card', label: 'Thẻ Cào', icon: CreditCard },
          { id: 'bank', label: 'Ngân Hàng', icon: Building2 }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => {
              playSound(SOUND_EVENT);
              setMethod(t.id as any);
            }}
            className={cn(
              "flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all",
              method === t.id ? "bg-yellow-500 text-red-900 shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <t.icon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
        
        {method === 'card' ? (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loại thẻ</label>
                <select 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-4 py-4 font-bold text-white focus:border-yellow-500 focus:outline-none transition-all appearance-none"
                  value={formData.type}
                  onChange={e => {
                    playSound(SOUND_EVENT);
                    setFormData({ ...formData, type: e.target.value });
                  }}
                >
                  <option>VIETTEL</option>
                  <option>MOBIFONE</option>
                  <option>VINAPHONE</option>
                  <option>GARENA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mệnh giá</label>
                <select 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-4 py-4 font-bold text-white focus:border-yellow-500 focus:outline-none transition-all appearance-none"
                  value={formData.amount}
                  onChange={e => {
                    playSound(SOUND_EVENT);
                    setFormData({ ...formData, amount: e.target.value });
                  }}
                >
                  {[20000, 50000, 100000, 200000, 500000].map(v => (
                    <option key={v} value={v}>{v.toLocaleString()}đ</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số Serial</label>
              <input 
                type="text" 
                placeholder="Nhập Serial..."
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-4 font-bold text-white focus:border-yellow-500 focus:outline-none"
                value={formData.serial}
                onFocus={() => playSound(SOUND_EVENT)}
                onChange={e => setFormData({ ...formData, serial: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mã thẻ</label>
              <input 
                type="text" 
                placeholder="Nhập Mã thẻ..."
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-4 font-bold text-white focus:border-yellow-500 focus:outline-none"
                value={formData.code}
                onFocus={() => playSound(SOUND_EVENT)}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-red-900 font-black py-5 rounded-[1.5rem] shadow-[0_5px_20px_rgba(234,179,8,0.3)] hover:shadow-[0_10px_30px_rgba(234,179,8,0.5)] active:scale-95 transition-all text-xs uppercase tracking-widest relative overflow-hidden group border-b-4 border-yellow-700"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
              <span className="relative z-10">NẠP THẺ CÀO</span>
            </button>
          </form>
        ) : config?.paymentInfo?.bank?.isMaintenance ? (
          <div className="relative z-10 space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
               <Activity className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-red-500 uppercase tracking-widest drop-shadow-md">Bảo trì hệ thống</h3>
            <p className="text-slate-400 text-xs font-bold leading-relaxed px-4">
               Cổng nạp qua số tài khoản đang tạm thời bảo trì để nâng cấp.<br/>Vui lòng quay lại sau hoặc thử phương thức thẻ cào.
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="bg-black/30 p-4 rounded-3xl border border-white/5 text-center">
              <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-4">Thông tin chuyển khoản</p>
              
              {currentPayment && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4 mb-4">
                    {qrSrc ? (
                      <div className="bg-white p-2 rounded-2xl shadow-2xl border-4 border-yellow-500">
                        <img 
                          src={qrSrc} 
                          alt="QR Code" 
                          className="w-48 h-48 rounded-xl object-contain bg-white"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-black/40 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Chưa có mã QR<br/>Vui lòng báo Admin cấu hình</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {qrSrc ? 'Quét mã QR để lấy thông tin' : 'Thông tin chuyển khoản bên dưới'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Account Number */}
                    <div className="bg-black/40 p-5 rounded-3xl border border-white/10 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] uppercase text-slate-500 font-black">Số tài khoản</p>
                        <button onClick={() => copyToClipboard((currentPayment as any).account || '')} className="text-[8px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">SAO CHÉP</button>
                      </div>
                      <p className="text-white font-black text-xl tracking-tight">{currentPayment?.account || ''}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{currentPayment?.name || ''}</p>
                      <p className="text-[10px] text-blue-400 font-black">{currentPayment?.bankName || ''}</p>
                    </div>

                    {/* Transfer Content */}
                    <div className="bg-yellow-500/10 p-5 rounded-3xl border-2 border-yellow-500/30 group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] uppercase text-yellow-600 font-black flex items-center gap-1.5">Nội dung (BẮT BUỘC)</p>
                        <button onClick={() => copyToClipboard(memo)} className="text-[8px] font-black uppercase text-yellow-900 bg-yellow-400 px-2 py-1 rounded-lg">SAO CHÉP</button>
                      </div>
                      <p className="text-yellow-400 font-black text-2xl tracking-widest uppercase">{memo}</p>
                      {config.paymentInfo?.bank?.bankNote && (
                        <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-2xl">
                              <p className="text-[9px] text-yellow-400 font-black uppercase mb-1">⚠️ LƯU Ý</p>
                              <p className="text-[9px] text-white font-bold leading-relaxed whitespace-pre-wrap">
                                {config.paymentInfo?.bank?.bankNote}
                              </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số tiền đã nạp</label>
              <input 
                type="number" 
                placeholder="Ví dụ: 100000"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-4 font-bold text-white focus:border-yellow-500 focus:outline-none"
                onFocus={() => playSound(SOUND_EVENT)}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-red-900 font-black py-5 rounded-[1.5rem] shadow-[0_5px_20px_rgba(234,179,8,0.4)] hover:shadow-[0_10px_30px_rgba(234,179,8,0.6)] uppercase tracking-widest text-xs relative overflow-hidden group active:scale-95 transition-all outline outline-offset-2 outline-yellow-500/50"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
              <div className="absolute -inset-2 bg-yellow-400 bg-opacity-20 rounded-[inherit] blur-xl group-hover:animate-pulse-ring pointer-events-none -z-10" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                XÁC NHẬN ĐÃ CHUYỂN <CreditCard className="w-5 h-5 fill-red-900 group-hover:scale-110 transition-transform" />
              </span>
            </button>
          </div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-yellow-500/10 text-yellow-500 p-4 rounded-2xl border border-yellow-500/20 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
            {message.includes('🔍') ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {message}
          </motion.div>
        )}

        {/* Voucher Section */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-4 h-4 text-blue-400" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Có mã Voucher?</h4>
          </div>
          <div className="flex gap-2">
            <input 
              id="voucher-input"
              type="text" 
              placeholder="Nhập mã..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold uppercase tracking-widest"
            />
            <button 
              onClick={async () => {
                const code = (document.getElementById('voucher-input') as HTMLInputElement).value;
                if(!code) return;
                const res = await fetch('/api/use-voucher', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tiktokId: user.tiktokId, code })
                });
                const data = await res.json();
                if (data.success) {
                  toast(`Sử dụng thành công! Bạn nhận được ${data.amount.toLocaleString()}đ`);
                  window.location.reload();
                } else {
                  toast(data.error);
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-colors shadow-lg shadow-blue-500/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
              <span className="relative z-10">DÙNG</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SpinView: React.FC<{ user: UserData, setUser: (u: any) => void, setScreenShake: (s: boolean) => void }> = ({ user, setUser, setScreenShake }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [finalItemIndex, setFinalItemIndex] = useState<number>(-1);

  const ITEMS = [
    { label: 'Rất tiếc (Xịt)', type: 'none', color: 'text-slate-500' },
    { label: '10,000đ', type: 'coin10k', color: 'text-green-400' },
    { label: '20,000đ', type: 'coin20k', color: 'text-yellow-400' },
    { label: '50,000đ', type: 'coin50k', color: 'text-orange-400' },
    { label: 'Bearbrick Mini', type: 'item', color: 'text-purple-400' },
    { label: 'NỔ HŨ 200,000đ', type: 'jackpot', color: 'text-red-500' }
  ];

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setFinalItemIndex(-1);
    
    // Play a tick sound initially
    playSound(SOUND_OPEN);
    
    // Tick sound interval to simulate wheel
    const tickInterval = setInterval(() => {
      playSound(SOUND_EVENT); 
    }, 150);

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId })
      });
      const data = await res.json();
      if (data.error) {
        clearInterval(tickInterval);
        toast(data.error);
        setSpinning(false);
        return;
      }

      // Determine target index
      let targetIndex = 0;
      if (data.rewardType === 'none') targetIndex = 0;
      else if (data.rewardType === 'item') targetIndex = 4;
      else if (data.result.includes('NỔ HŨ')) targetIndex = 5;
      else if (data.rewardValue === 50000) targetIndex = 3;
      else if (data.rewardValue === 20000) targetIndex = 2;
      else if (data.rewardValue === 10000) targetIndex = 1;

      // Start the deceleration animation
      setFinalItemIndex(targetIndex);

      // Stop ticking right as it slows down (approx 2s)
      setTimeout(() => clearInterval(tickInterval), 2200);

      // Animation takes 3.5s
      setTimeout(() => {
        setResult(data);
        setUser({ ...user, balance: data.balance, inventory: data.inventory });
        setSpinning(false);
        if (data.rewardType !== 'none') {
          playSound(SOUND_WIN);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 800);
          if (data.result.includes('NỔ HŨ')) {
            confetti({ particleCount: 300, spread: 150, origin: { y: 0.1 } });
          } else {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.2 } });
          }
        } else {
          playSound(SOUND_SHATTER); // Vỡ kính
          setTimeout(() => playSound("https://assets.mixkit.co/active_storage/sfx/136/136-preview.mp3"), 400); // Âm thanh buồn
        }
      }, 3500);
      
    } catch (e) {
      clearInterval(tickInterval);
      toast('Lỗi khi quay');
      setSpinning(false);
    }
  };

  return (
    <motion.div 
      key="spin"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6 flex flex-col items-center"
    >
      <div className="bg-[#1e293b] rounded-[2.5rem] w-full p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
         <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[60px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full" />
         
         <div className="flex justify-center mb-4 relative z-10">
           <div className="bg-yellow-500/20 p-4 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
               <Trophy className="w-12 h-12 text-yellow-500" />
           </div>
         </div>
         <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 relative z-10">Vòng Quay Nhân Phẩm</h2>
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6 relative z-10">Cơ hội nổ hũ lên tới 200,000đ</p>
         
         <div className="bg-black p-4 rounded-3xl border-4 border-yellow-500/80 mb-8 relative z-10 h-[180px] sm:h-[220px] flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
             
             {/* Center marker / Pointer */}
             <div className="absolute left-0 right-0 top-1/2 -mt-6 h-12 border-y-2 border-red-500 bg-red-500/20 pointer-events-none z-20 flex items-center justify-between px-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-red-500 border-b-[8px] border-b-transparent drop-shadow-md"></div>
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-red-500 border-b-[8px] border-b-transparent drop-shadow-md"></div>
             </div>

             <motion.div
                className="absolute flex flex-col items-center left-0 right-0 top-1/2"
                style={{ marginTop: '-20px' }} // Start position so the first item is centered
                animate={
                  spinning && finalItemIndex === -1 
                    ? { y: [0, -(ITEMS.length * 40 * 10)] } // fast fake spin 
                    : spinning && finalItemIndex !== -1
                    ? { y: -((15 * ITEMS.length + finalItemIndex) * 40) } // real decelerating spin ending at target
                    : result && finalItemIndex !== -1
                    ? { y: -((15 * ITEMS.length + finalItemIndex) * 40) } // hold final pos
                    : { y: 0 } // Intial standing still
                }
                transition={
                   spinning && finalItemIndex === -1
                     ? { duration: 2, repeat: Infinity, ease: 'linear' } // It shouldn't stay here long
                     : spinning && finalItemIndex !== -1 
                     ? { duration: 3.5, ease: [0.1, 0.9, 0.2, 1] } // Slot machine ease out curve
                     : { duration: 0 }
                }
             >
                {/* 20 repeating groups of items so we can freely scroll down */}
                {Array(20).fill(ITEMS).flat().map((item, i) => (
                   <div key={i} className={cn("h-10 flex items-center justify-center font-black text-lg sm:text-xl w-full px-8 text-center uppercase tracking-widest shrink-0", item.color)}>
                       {item.label}
                   </div>
                ))}
             </motion.div>
             
             {/* Shading gradients to fake depth */}
             <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
         </div>

         {result && !spinning && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 relative z-10">
               {result.rewardType !== 'none' ? (
                 <p className="text-2xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-md">
                   🎉 Trúng {result.result} 🎉
                 </p>
               ) : (
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest drop-shadow-md pb-4 text-center w-full">
                   Rất tiếc, chúc bạn may mắn lần sau
                 </p>
               )}
            </motion.div>
         )}

         <button 
           onClick={handleSpin}
           disabled={spinning}
           className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-black py-5 rounded-[1.5rem] shadow-[0_10px_40px_rgba(234,179,8,0.4)] uppercase tracking-widest text-lg disabled:opacity-50 active:scale-95 transition-all relative z-10 overflow-hidden group border-b-4 border-yellow-700 hover:shadow-[0_15px_50px_rgba(234,179,8,0.5)]"
         >
           <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
           <div className="absolute -inset-2 bg-yellow-400 bg-opacity-20 rounded-[inherit] blur-xl group-hover:animate-pulse-ring pointer-events-none -z-10" />
           <span className="relative z-10 flex items-center justify-center gap-2">
             QUAY NGAY 20K
             <motion.div
               animate={spinning ? { rotate: 360 } : { rotate: [0, 10, -10, 0] }}
               transition={spinning ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
               <Play className="w-5 h-5 fill-current" />
             </motion.div>
           </span>
         </button>
      </div>
    </motion.div>
  );
};

const CollectionView: React.FC<{ user: UserData, setUser: (u: any) => void }> = ({ user, setUser }) => {
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const sellItem = async (itemId: string) => {
    try {
      const res = await fetch('/api/inventory/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId, itemId })
      });
      const data = await res.json();
      if (data.success) {
        playSound(SOUND_SUCCESS);
        setUser({ ...user, balance: data.balance, inventory: data.inventory });
      }
    } catch (e) {
      toast('Có lỗi xảy ra');
    }
  };

  const inventory = (user.inventory || []).filter(item => rarityFilter === 'all' || item.rarity === rarityFilter);

  return (
    <motion.div 
      key="collection"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div className="bg-[#1e293b] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[60px] rounded-full" />
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Bộ Sưu Tập</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6">Linh vật may mắn từ Túi Mù</p>
        
        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Ticket className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Tổng cộng</p>
            <p className="text-sm font-black text-white italic">{inventory.length} Vật phẩm</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
         {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map(r => (
           <button key={r} onClick={() => setRarityFilter(r)} className={cn("px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all", rarityFilter === r ? "bg-yellow-500 text-red-900" : "bg-[#1e293b] text-slate-400 border border-white/5")}>
             {r}
           </button>
         ))}
      </div>

      {/* Fragment Shop */}
      <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 shadow-xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
         <div className="relative z-10 flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-[1rem] shadow-[0_5px_15px_rgba(234,179,8,0.3)]">
                  <Smartphone className="w-6 h-6 text-red-900" />
                </div>
                <div>
                   <h3 className="font-black text-white italic tracking-tighter text-sm uppercase">Cửa Hàng Phụ Kiện</h3>
                   <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-none mt-1">{user?.fragments || 0} / 100 Mảnh ghép</p>
                </div>
             </div>
             <button onClick={async () => {
                 try {
                     const res = await fetch('/api/exchange-fragments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tiktokId: user.tiktokId}) });
                     const d = await res.json();
                     if(d.success) {
                        toast(d.message);
                        playSound(SOUND_WIN);
                        setUser({ ...user, fragments: d.fragments });
                     } else {
                        toast(d.error);
                     }
                 } catch(e) {}
             }} className={cn(
               "px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-[0_5px_15px_rgba(234,179,8,0.3)]",
               (user?.fragments || 0) >= 100 ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 hover:from-yellow-300 hover:to-yellow-400" : "bg-black/40 text-slate-500 cursor-not-allowed border border-white/10"
             )}>Đổi iPhone</button>
         </div>
         <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden relative z-10 border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (user?.fragments || 0))}%` }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {inventory.map((item: any, i: number) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.04, rotateY: 3, rotateZ: Math.random() > 0.5 ? 1 : -1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1e293b] rounded-[2rem] p-5 border border-white/5 flex flex-col items-center gap-3 relative overflow-hidden shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-150%] skew-x-[-45deg] group-hover:animate-sweep pointer-events-none z-20" />
            
            {/* Rarity Glow Effect */}
            <div className={cn(
               "absolute top-0 inset-x-0 h-24 bg-gradient-to-b opacity-20 pointer-events-none",
               item.rarity === 'common' ? "from-slate-500 to-transparent" : 
               item.rarity === 'rare' ? "from-blue-500 to-transparent" : 
               item.rarity === 'epic' ? "from-purple-500 to-transparent" : "from-yellow-500 to-transparent"
            )} />

            <div className={cn(
               "absolute top-0 inset-x-0 h-1",
               item.rarity === 'common' ? "bg-slate-500" : 
               item.rarity === 'rare' ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : 
               item.rarity === 'epic' ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
            )} />
            
            <div className={cn(
               "w-16 h-16 rounded-2xl overflow-hidden ring-2 group-hover:scale-110 transition-transform duration-500 shadow-xl relative bg-black/40 flex items-center justify-center z-10",
               item.rarity === 'legendary' ? "ring-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]" : "ring-white/10",
               item.rarity === 'epic' ? "ring-purple-400/50" : ""
            )}>
              <img 
                src={item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name || item.id || 'item')}/150/150?blur=1`} 
                alt={item.name} 
                className={cn("w-full h-full object-cover absolute inset-0", !item.imageUrl && "opacity-60")} 
                referrerPolicy="no-referrer" 
              />
              {!item.imageUrl && item.icon && (
                <div className="relative z-10 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{item.icon}</div>
              )}
            </div>
            
            <div className="text-center mt-1 z-10">
              <p className="text-[10px] font-black text-white uppercase italic tracking-tighter leading-tight">{item.name}</p>
              <p className={cn(
                "text-[8px] font-black uppercase tracking-widest",
                item.rarity === 'common' ? "text-slate-500" : 
                item.rarity === 'rare' ? "text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" : 
                item.rarity === 'epic' ? "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" : "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] animate-pulse"
              )}>{item.rarity}</p>
            </div>
            
            <div className="flex gap-1 mt-1 w-full relative z-10 flex-col sm:flex-row">
              <button 
                onClick={(e) => { e.stopPropagation(); sellItem(item.id); }}
                className="w-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-[8px] sm:text-[9px] font-black text-slate-300 py-2 rounded-xl border border-white/5 shadow-inner"
              >
                ĐỔI {item.value.toLocaleString()}đ
              </button>
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm('Nâng cấp tốn 10,000đ. Thành công x3 giá trị, thất bại mất trắng. Chơi không?')) return;
                  const res = await fetch('/api/inventory/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tiktokId: user.tiktokId, itemId: item.id })
                  });
                  const data = await res.json();
                  if (data.error) return toast(data.error);
                  if (data.isBroken) {
                    toast('💥 Xịt rồi! Bảo vật đã tan thành mây khói...');
                  } else {
                    toast('✨ Tuyệt vời! Bảo vật cường hóa thành công!');
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                  }
                  setUser({ ...user, balance: data.balance, inventory: data.inventory });
                }}
                className="w-full bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 hover:from-purple-500/40 hover:to-fuchsia-500/40 text-purple-300 active:scale-95 transition-all text-[8px] sm:text-[9px] font-black py-2 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                 NÂNG CẤP
              </button>
            </div>
          </motion.div>
        ))}

        {inventory.length === 0 && (
          <div className="col-span-2 py-20 text-center space-y-4">
             <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto grayscale opacity-50">
                <Package className="w-8 h-8 text-slate-500" />
             </div>
             <div>
               <p className="text-slate-500 font-black uppercase text-[10px] italic tracking-widest leading-none mb-1">Chưa có linh vật nào</p>
               <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Mở túi mù để tìm linh vật hiếm!</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AccountView: React.FC<{ user: UserData, setUser: (u: any) => void, onLogout: () => void, onRechargeAgain: (data: any) => void, setView: (view: any) => void }> = ({ user, setUser, onLogout, onRechargeAgain, setView }) => {
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [editingRecharge, setEditingRecharge] = useState<RechargeRequest | null>(null);
  const [editFormData, setEditFormData] = useState({ serial: '', code: '' });
  const [currentUser, setCurrentUser] = useState<UserData>(user);
  
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileAddress, setProfileAddress] = useState(user.address || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled !== false);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = useCallback(() => {
    fetch(`/api/user-recharges/${encodeURIComponent(user.tiktokId)}`).then(res => res.json()).then(setRecharges);
    fetch(`/api/user/${encodeURIComponent(user.tiktokId)}`).then(res => res.json()).then(data => {
      if (!data.error) {
         setCurrentUser(data);
         setUser(data);
      }
    });
  }, [user.tiktokId, setUser]);

  useEffect(() => {
    fetchData();
    // Auto refresh status
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdate = async () => {
    if (!editingRecharge) return;
    const res = await fetch('/api/recharge/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingRecharge.id, ...editFormData })
    });
    if (res.ok) {
      setEditingRecharge(null);
      fetchData();
    }
  };

  const [shopName, setShopName] = useState(currentUser.shopName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawBank || !withdrawAccount) return toast('Vui lòng nhập đủ thông tin!');
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 100000) return toast('Số tiền rút tối thiểu là 100,000đ!');
    if (amount > currentUser.balance) return toast('Số dư không đủ!');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId, amount, bank: withdrawBank, account: withdrawAccount })
      });
      const data = await res.json();
      if (data.success) {
        toast('Gửi yêu cầu rút tiền thành công! Admin sẽ duyệt sớm.');
        setShowWithdraw(false);
        setWithdrawAmount('');
        fetchData();
      } else {
        toast(data.error);
      }
    } catch(e) {
      toast('Lỗi hệ thống');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokId: user.tiktokId, phone: profilePhone, address: profileAddress, shopName, avatarUrl })
      });
      if (res.ok) {
        toast('Cập nhật thông tin thành công!');
        fetchData();
      } else {
        toast('Lỗi cập nhật');
      }
    } catch (e) {
      toast('Lỗi hệ thống');
    }
    setSavingProfile(false);
  };

  useEffect(() => {
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
    setShopName(currentUser.shopName || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setNotificationsEnabled(currentUser.notificationsEnabled !== false);
  }, [currentUser.phone, currentUser.address, currentUser.notificationsEnabled, currentUser.shopName, currentUser.avatarUrl]);

  return (
    <motion.div 
      key="account"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-red-600">
        <div className="relative w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100 overflow-hidden group">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12" />
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight mb-1">{shopName || currentUser.tiktokId}</h2>
        <p className="text-xs font-bold text-gray-400 mb-4">{currentUser.tiktokId}</p>
        <div className="bg-red-50 inline-block px-4 py-2 rounded-full mb-4 border border-red-100">
          <span className="text-gray-500 font-bold text-sm uppercase">Số dư: </span>
          <span className="text-red-700 font-black text-lg">{currentUser.balance.toLocaleString()}đ</span>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button onClick={() => setView('recharge')} className="bg-gradient-to-tr from-yellow-400 to-yellow-500 text-red-900 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(250,204,21,0.4)] active:scale-95 transition-transform">
             Nạp Tiền
          </button>
          <button onClick={() => setShowWithdraw(true)} className="bg-white border-2 border-red-100 text-red-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-transform">
             Rút Tiền
          </button>
        </div>

        {/* Missions Center */}
        <div className="mb-6 bg-red-50 p-4 rounded-3xl border border-red-100 text-left">
           <h3 className="font-black text-red-700 italic uppercase mb-3 text-sm tracking-tighter flex items-center gap-1">
             <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Trung Tâm Nhiệm Vụ
           </h3>
           <div className="space-y-3">
             <div className="bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 blur-xl rounded-full" />
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center border border-yellow-200 shadow-inner">
                   <Calendar className="w-5 h-5 text-yellow-600" />
                 </div>
                 <div>
                   <p className="font-black text-xs text-gray-800 uppercase tracking-tighter">Điểm Danh Hằng Ngày</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Chuỗi {user?.checkinStreak || 0} ngày liên tiếp</p>
                 </div>
               </div>
               <button 
                  onClick={async () => {
                    const res = await fetch('/api/daily-checkin', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tiktokId: currentUser.tiktokId })
                    });
                    const d = await res.json();
                    if (d.success) {
                      toast(d.message);
                      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      fetchData();
                    } else {
                      toast(d.error);
                    }
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-red-900 font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl active:scale-95 transition-all outline-none border border-yellow-500 z-10 shadow-[0_2px_10px_rgba(250,204,21,0.3)]"
               >NHẬN</button>
             </div>

             <div className={cn("bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm", user?.claimedMissions?.includes('first_recharge') ? 'opacity-50' : '')}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                   <CreditCard className="w-5 h-5 text-blue-500" />
                 </div>
                 <div>
                   <p className="font-black text-xs text-gray-800 uppercase tracking-tighter">Nạp Lần Đầu</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Thưởng nóng 50.000đ</p>
                 </div>
               </div>
               <button 
                  onClick={async () => {
                    const res = await fetch('/api/mission/claim', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tiktokId: currentUser.tiktokId, missionId: 'first_recharge' })
                    });
                    const d = await res.json();
                    if (d.success) {
                      toast(d.message);
                      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      fetchData();
                    } else {
                      toast(d.error);
                    }
                  }}
                  disabled={user?.claimedMissions?.includes('first_recharge')}
                  className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl active:scale-95 transition-all outline-none", user?.claimedMissions?.includes('first_recharge') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)] border border-blue-600")}
               >
                 {user?.claimedMissions?.includes('first_recharge') ? 'ĐÃ NHẬN' : 'NHẬN'}
               </button>
             </div>

             <div className={cn("bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm", user?.claimedMissions?.includes('share_friend') ? 'opacity-50' : '')}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                   <Share2 className="w-5 h-5 text-green-500" />
                 </div>
                 <div>
                   <p className="font-black text-xs text-gray-800 uppercase tracking-tighter">Chia Sẻ & Mời Bạn</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Đã mời: {user?.referrals || 0}/1 người | Mã: {user?.referralCode || user?.tiktokId}</p>
                 </div>
               </div>
               <button 
                  onClick={async () => {
                    if ((user?.referrals || 0) < 1) {
                      const link = `${window.location.origin}/?ref=${encodeURIComponent(user?.referralCode || user?.tiktokId || '')}`;
                      try {
                        await navigator.clipboard.writeText(link);
                        toast(`Đã copy link mời! Gửi cho bạn bè ngay nhé:\n${link}`);
                      } catch(e) {
                         toast(`Link mời của bạn:\n${link}`);
                      }
                      return;
                    }
                    const res = await fetch('/api/mission/claim', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tiktokId: currentUser.tiktokId, missionId: 'share_friend' })
                    });
                    const d = await res.json();
                    if (d.success) {
                      toast(d.message);
                      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      fetchData();
                    } else {
                      toast(d.error);
                    }
                  }}
                  disabled={user?.claimedMissions?.includes('share_friend')}
                  className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl active:scale-95 transition-all outline-none", user?.claimedMissions?.includes('share_friend') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ((user?.referrals || 0) >= 1 ? "bg-green-500 hover:bg-green-600 text-white shadow-[0_2px_10px_rgba(34,197,94,0.3)] border border-green-600" : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"))}
               >
                 {user?.claimedMissions?.includes('share_friend') ? 'ĐÃ NHẬN' : ((user?.referrals || 0) >= 1 ? 'NHẬN' : 'COPY MÃ')}
               </button>
             </div>
           </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-gray-50 text-gray-500 font-black py-4 rounded-xl border border-gray-200 uppercase text-xs tracking-widest active:scale-95 transition-transform"
        >
          Đăng xuất tài khoản
        </button>
      </div>

      {/* Delivery Address Section */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-800 uppercase italic flex items-center gap-2">
            <Package className="w-5 h-5" />
            Hồ Sơ Của Bạn
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
             <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Tên Tài Khoản / Shop</label>
             <input 
               type="text"
               placeholder="Nhập tên hiển thị..."
               value={shopName}
               onChange={(e) => setShopName(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-red-400"
             />
          </div>
          <div>
             <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Đường Link Ảnh Đại Diện (Avatar)</label>
             <input 
               type="text"
               placeholder="URL ảnh (https://...)"
               value={avatarUrl}
               onChange={(e) => setAvatarUrl(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-red-400"
             />
          </div>
          <div className="pt-4 border-t border-gray-100">
             <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Số Điện Thoại</label>
             <input 
               type="tel"
               placeholder="Nhập số điện thoại..."
               value={profilePhone}
               onChange={(e) => setProfilePhone(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-red-400"
             />
          </div>
          <div>
             <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Địa Chỉ Chi Tiết</label>
             <textarea 
               placeholder="Nhập địa chỉ nhận hàng (Bao gồm phường/xã, quận/huyện...)"
               value={profileAddress}
               onChange={(e) => setProfileAddress(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-red-400 h-24 resize-none"
             />
          </div>

          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
            <div>
              <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Thông báo hệ thống</p>
              <p className="text-[10px] text-gray-500 font-bold max-w-[200px] mt-1">Nhận tin báo số dư thấp & khuyến mãi</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <button 
             onClick={handleSaveProfile}
             disabled={savingProfile}
             className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
          >
             {savingProfile ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-black text-gray-800 uppercase italic mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Lịch sử nạp thẻ
        </h3>
        <div className="space-y-3">
          {recharges.map((r) => (
            <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-black text-gray-800 uppercase text-xs">{r.type} - {r.amount.toLocaleString()}đ</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className={cn(
                  "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                  r.status === 'waiting' && "bg-yellow-100 text-yellow-700",
                  r.status === 'success' && "bg-green-100 text-green-700",
                  r.status === 'error' && "bg-red-100 text-red-700"
                )}>
                  {r.status === 'waiting' ? 'Chờ duyệt' : r.status === 'success' ? 'Thành công' : 'Bị từ chối'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                {r.serial !== 'Manual Transfer' ? (
                  <>
                    <p className="text-[9px] text-gray-400 font-black uppercase">Seri: <span className="text-gray-800">{r.serial}</span></p>
                    <p className="text-[9px] text-gray-400 font-black uppercase">Mã: <span className="text-gray-800">{r.code}</span></p>
                  </>
                ) : (
                  <p className="text-[9px] text-blue-500 font-black uppercase">Nội dung CK: <span className="text-blue-700">{r.code}</span></p>
                )}
                {r.status === 'success' && (
                  <button 
                    onClick={() => onRechargeAgain(r)}
                    className="mt-3 w-full bg-blue-500/10 text-blue-600 text-[9px] font-black py-2 rounded-lg uppercase tracking-widest active:scale-95 transition-transform border border-blue-500/20"
                  >
                    Nạp lại mã này
                  </button>
                )}
                {r.status === 'error' && (
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => onRechargeAgain(r)}
                      className="flex-1 bg-yellow-500 text-red-900 text-[10px] font-black py-2 rounded-lg uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      Nạp lại
                    </button>
                    <button 
                      onClick={() => {
                        setEditingRecharge(r);
                        setEditFormData({ serial: r.serial, code: r.code });
                      }}
                      className="flex-1 bg-red-600 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      Sửa & Gửi
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {recharges.length === 0 && (
            <div className="text-center py-6 text-gray-300 font-bold uppercase text-xs italic">
              Bạn chưa nạp thẻ nào...
            </div>
          )}
        </div>
      </div>

      {showWithdraw && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm space-y-6">
             <h4 className="text-center font-black uppercase italic tracking-tighter text-xl text-gray-800 flex items-center justify-center gap-2">
               <Wallet className="w-6 h-6 text-red-600" />
               Yêu Cầu Rút Tiền
             </h4>
             <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                 <span className="text-xs uppercase font-bold text-gray-500 tracking-widest">Khả dụng</span>
                 <span className="font-black text-red-600 text-lg">{currentUser.balance.toLocaleString()}đ</span>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Số Tiền Muốn Rút</label>
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    placeholder="Tối thiểu 100,000đ"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ngân Hàng Trực Tuyến</label>
                  <input 
                    type="text" 
                    value={withdrawBank} 
                    onChange={e => setWithdrawBank(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-red-600 focus:bg-white transition-colors uppercase"
                    placeholder="VD: MB BANK, VCB..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Số Tài Khoản</label>
                  <input 
                    type="text" 
                    value={withdrawAccount} 
                    onChange={e => setWithdrawAccount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    placeholder="Nhập số tài khoản..."
                  />
                </div>
             </div>
             <div className="flex gap-2 pt-2">
                <button onClick={() => setShowWithdraw(false)} className="flex-1 bg-gray-100 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-200 transition-colors">Hủy</button>
                <button onClick={handleWithdraw} className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-2xl shadow-[0_5px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_10px_25px_rgba(220,38,38,0.5)] active:scale-95 transition-all text-[10px] uppercase tracking-widest relative overflow-hidden group">
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                   <span className="relative z-10 font-bold tracking-widest">RÚT NGAY</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {editingRecharge && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm space-y-6">
             <h4 className="text-center font-black uppercase italic tracking-tighter text-xl text-gray-800">Sửa thông tin nạp</h4>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Số Seri mới</label>
                  <input 
                    type="text" 
                    value={editFormData.serial} 
                    onChange={e => setEditFormData({...editFormData, serial: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-red-600"
                    placeholder="Nhập seri..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Mã thẻ mới</label>
                  <input 
                    type="text" 
                    value={editFormData.code} 
                    onChange={e => setEditFormData({...editFormData, code: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-red-600"
                    placeholder="Nhập mã thẻ..."
                  />
                </div>
             </div>
             <div className="flex gap-2">
                <button onClick={() => setEditingRecharge(null)} className="flex-1 bg-gray-100 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-200 transition-colors">Hủy</button>
                <button onClick={handleUpdate} className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-2xl shadow-[0_5px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_10px_25px_rgba(220,38,38,0.5)] active:scale-95 transition-all text-xs uppercase tracking-widest relative overflow-hidden group">
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                   <span className="relative z-10 font-bold tracking-widest">CẬP NHẬT</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Leaderboard View ---
const LeaderboardView = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setTopUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="pb-32"
    >
      <div className="bg-gradient-to-b from-yellow-500/20 to-transparent p-6 rounded-b-[3rem] mb-6 border-b border-white/5 relative overflow-hidden">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 uppercase tracking-tighter text-center">Đại Gia Trong Tháng</h2>
        <p className="text-center text-xs text-yellow-500/70 font-bold uppercase tracking-widest mt-2 block">Top nạp & tiêu phí</p>
      </div>

      <div className="px-4">
        <div className="bg-bento-card rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          {loading ? (
             <div className="text-center py-10 text-white/50 text-sm font-bold animate-pulse">Đang tải bảng xếp hạng...</div>
          ) : topUsers.length === 0 ? (
             <div className="text-center py-10 text-white/50 text-sm font-bold">Chưa có ai trong danh sách</div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
               {topUsers.map((u, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                       "flex gap-4 items-center p-4 rounded-3xl border relative overflow-hidden group hover:scale-[1.02] transition-transform",
                       i === 0 ? "bg-gradient-to-r from-yellow-500/20 to-black/40 border-yellow-500/30" : 
                       i === 1 ? "bg-gradient-to-r from-slate-300/10 to-black/40 border-slate-400/20" :
                       i === 2 ? "bg-gradient-to-r from-orange-400/10 to-black/40 border-orange-500/20" :
                       "bg-black/40 border-white/5 hover:bg-white/5"
                    )}
                  >
                      {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 translate-x-[-100%] animate-[sweep_2.5s_infinite] pointer-events-none" />}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black border-2 shrink-0 relative z-10 overflow-hidden",
                        i === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-red-900 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110" :
                        i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 border-slate-200 shadow-[0_0_15px_rgba(148,163,184,0.5)]" :
                        i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-700 text-amber-950 border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.5)]" :
                        "bg-white/10 text-slate-300 border-white/20"
                      )}>
                         {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0 relative z-10 w-full pl-2">
                         <div className="text-sm font-black text-white/90 truncate flex items-center gap-2">
                             {u.shopName || u.tiktokId} {i === 0 && <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-bounce-subtle drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                         </div>
                         <div className="text-[10px] text-yellow-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                           {u.iphonesWon > 0 && <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">📱 {u.iphonesWon} Siêu Phẩm </span>} 
                           <span>💎 Đã tiêu: {u.totalSpent.toLocaleString()}đ</span>
                         </div>
                      </div>
                  </motion.div>
               ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AdminPanelView = () => {
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // USER STATE
  const [chats, setChats] = useState<any>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any>({});
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherAmount, setNewVoucherAmount] = useState('');
  const [newVoucherQty, setNewVoucherQty] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'chats' | 'cards' | 'withdrawals' | 'winners' | 'users' | 'vouchers' | 'settings'>('dashboard');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chats, activeChat]);

  const [config, setConfig] = useState<Config>({
    winRate: 0.01,
    upgradeRate: 0.40,
    spinRates: {
      none: 0.45,
      coin10k: 0.25,
      coin20k: 0.15,
      coin50k: 0.10,
      item: 0.04,
      jackpot: 0.01
    },
    prices: [],
    paymentInfo: {
      bank: { bankName: '', account: '', name: '', qrUrl: '', isMaintenance: false }
    }
  });

  const fetchData = useCallback(() => {
    fetch('/api/admin/recharges').then(res => res.json()).then(setRecharges);
    fetch('/api/admin/withdrawals').then(res => res.json()).then(setWithdrawals);
    fetch('/api/admin/stats').then(res => res.json()).then(setAdminStats);
    fetch('/api/admin/users').then(res => res.json()).then(setUsers); // FETCH USERS
    fetch('/api/admin/chats').then(res => res.json()).then(setChats);
    fetch('/api/admin/config').then(res => res.json()).then(data => {
      // Ensure paymentInfo exists
      if (!data.paymentInfo || !data.paymentInfo.bank) {
        data.paymentInfo = {
          bank: { bankName: '', account: '', name: '', bankBin: '', qrUrl: '', isMaintenance: false }
        };
      }
      setConfig(data);
    });
    fetch('/api/admin/winners').then(res => res.json()).then(setWinners);
    fetch('/api/admin/vouchers').then(res => res.json()).then(setVouchers);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Đã copy: ' + text);
  };

  const approveWithdraw = async (id: string, status: 'success' | 'rejected') => {
    await fetch(`/api/admin/withdraw/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const approve = async (id: string, status: 'success' | 'error') => {
    await fetch(`/api/admin/recharge/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'bank') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const newPaymentInfo = { ...config.paymentInfo };
      newPaymentInfo.bank = { ...newPaymentInfo.bank, qrUrl: base64String };
      const input = document.getElementById('bank-qr') as HTMLInputElement;
      if (input) input.value = 'Ảnh đã tải lên';
      await updateConfig({ paymentInfo: newPaymentInfo });
    };
    reader.readAsDataURL(file);
  };

  const totalUnreadAdmin = Object.values(chats).reduce((sum: number, c: any) => sum + (c.unreadAdmin || 0), 0) as number;

  const ADMIN_TABS = [
    { id: 'dashboard', label: 'Tổng Quan', icon: Activity },
    { id: 'chats', label: 'Tin Nhắn' + (totalUnreadAdmin > 0 ? ` (${totalUnreadAdmin})` : ''), icon: MessageCircle },
    { id: 'cards', label: 'Duyệt Thẻ', icon: CreditCard },
    { id: 'withdrawals', label: 'Duyệt Rút', icon: Banknote },
    { id: 'winners', label: 'Trúng Giải', icon: Trophy },
    { id: 'users', label: 'Người Dùng', icon: User }, // NEW TAB
    { id: 'vouchers', label: 'Mã Voucher', icon: Ticket },
    { id: 'settings', label: 'Cấu Hình', icon: Settings },
  ] as const;

  return (
    <motion.div 
      key="admin"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Bento Admin Header */}
      <div className="bg-[#1e293b] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full" />
        <div className="flex justify-center mb-4 relative z-10 w-full">
           <div className="bg-yellow-500/20 p-4 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
             <Shield className="w-10 h-10 text-yellow-400" />
           </div>
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white relative z-10">Quản Trị Viên</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10 mb-6">Bento Control Panel • v2.5</p>

        <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 flex items-center justify-between text-left mx-auto max-w-xs relative z-10 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[9px] uppercase text-slate-400 font-black mb-1">Tỉ lệ trúng hiện tại</p>
              <p className="text-2xl font-black text-red-500 tabular-nums drop-shadow-md">{(config.winRate * 100).toFixed(1)}%</p>
            </div>
            <div className="relative z-10 bg-black/40 p-3 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
               <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {ADMIN_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border",
                tab === t.id
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  : "bg-black/40 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 admin-scroll">
        {tab === 'dashboard' && adminStats && (
          <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Thành viên</p>
              <p className="text-2xl font-black text-white italic">{adminStats.totalUsers}</p>
            </div>
            
            <div className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="bg-green-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Doanh thu</p>
              <p className="text-2xl font-black text-white italic">{adminStats.totalRevenue.toLocaleString()}đ</p>
            </div>

            <div className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="bg-yellow-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Ticket className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tổng số dư</p>
              <p className="text-2xl font-black text-white italic">{adminStats.totalBalance.toLocaleString()}đ</p>
            </div>

            <div className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="bg-red-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Đã trúng siêu phẩm</p>
              <p className="text-2xl font-black text-white italic">{adminStats.totalWinners}</p>
            </div>

            <div className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <div className="bg-purple-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Lệnh đang chờ</p>
              <p className="text-2xl font-black text-white italic">{adminStats.pendingRecharges}</p>
            </div>
          </div>
          
          <div className="bg-bento-card p-6 mt-4 rounded-[2rem] border border-white/5 shadow-xl">
             <h3 className="font-black text-xl italic text-yellow-400 mb-4 tracking-tighter">SỰ KIỆN & LÌ XÌ</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="font-black text-white mb-2 text-sm uppercase">🧧 Lì Xì Tổng</h4>
                  <input id="lixi-amount" className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-2 focus:border-red-500 outline-none transition-colors font-bold" placeholder="Tổng tiền (VD: 100000)" type="number" />
                  <input id="lixi-users" className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-3 focus:border-red-500 outline-none transition-colors font-bold" placeholder="Số người nhận (VD: 10)" type="number" />
                  <button onClick={() => { 
                     const a = (document.getElementById('lixi-amount') as HTMLInputElement).value;
                     const b = (document.getElementById('lixi-users') as HTMLInputElement).value;
                     if(a && b) { fetch('/api/admin/envelope', { method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount:a, maxUsers:b}) }); toast('Đã phát Lì xì!'); }
                  }} className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl py-3 font-black shadow-[0_5px_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all">PHÁT LÌ XÌ TRÊN WEB</button>
               </div>
               <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-white mb-1 text-sm uppercase">📱 Lắc Xu Nhận Quà</h4>
                    <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest leading-tight">Bật để toàn bộ user đang online lắc màn hình nhận tiền ngẫu nhiên.</p>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => { fetch('/api/admin/shake-event', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({active:true})}); toast('Đã BẬT Giờ vàng!'); }} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 rounded-xl py-3 font-black shadow-[0_5px_15px_rgba(234,179,8,0.3)] active:scale-95 transition-all">BẬT GIỜ VÀNG</button>
                    <button onClick={() => { fetch('/api/admin/shake-event', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({active:false})}); toast('Đã TẮT sự kiện!'); }} className="w-full bg-slate-800 text-white rounded-xl py-3 font-black border border-slate-600 active:scale-95 transition-all">Tắt Sự Kiện</button>
                  </div>
               </div>
             </div>
          </div>
          </>
        )}

        {tab === 'chats' && (
           <div className="bg-bento-card rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex h-[600px] max-h-[70vh]">
             <div className="w-1/3 border-r border-white/5 flex flex-col">
                <div className="p-4 bg-black/20 border-b border-white/5">
                   <h3 className="font-black text-white italic tracking-tighter">TIN NHẮN</h3>
                </div>
                <div className="flex-1 overflow-y-auto admin-scroll">
                   {Object.entries(chats).sort((a: any, b: any) => (b[1].unreadAdmin || 0) - (a[1].unreadAdmin || 0)).map(([id, chat]: [string, any]) => (
                      <button 
                         key={id} 
                         onClick={() => {
                            setActiveChat(id);
                            fetch(`/api/chat/read/${encodeURIComponent(id)}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ role: 'admin' }) });
                            setChats((prev: any) => ({...prev, [id]: {...prev[id], unreadAdmin: 0}}));
                         }}
                         className={cn("w-full p-4 text-left border-b border-white/5 flex justify-between items-center transition-colors", activeChat === id ? "bg-white/10" : "hover:bg-white/5")}
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                               <User className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="min-w-0 pr-2">
                               <p className="font-black text-white truncate text-sm">{id}</p>
                               <p className="text-xs text-slate-400 truncate">{chat.messages[chat.messages.length - 1]?.text || "Chưa có tin nhắn"}</p>
                            </div>
                         </div>
                         {(chat.unreadAdmin > 0) && (
                            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{chat.unreadAdmin}</span>
                         )}
                      </button>
                   ))}
                </div>
             </div>
             <div className="flex-1 flex flex-col bg-black/20">
                {activeChat ? (
                   <>
                      <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                         <h3 className="font-black text-white">Người dùng: <span className="text-yellow-400">{activeChat}</span></h3>
                         <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 admin-scroll flex flex-col" ref={chatScrollRef}>
                         {chats[activeChat].messages.map((m: any, i: number) => (
                            <div key={i} className={`flex items-start gap-2 ${m.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'admin' ? 'bg-yellow-500' : 'bg-indigo-600'}`}>
                                  {m.role === 'admin' ? <Bot className="w-4 h-4 text-red-900" /> : <User className="w-4 h-4 text-white" />}
                               </div>
                               <div className={`p-3 rounded-2xl max-w-[80%] text-sm font-bold flex flex-col gap-1 ${m.role === 'admin' ? 'bg-yellow-500 text-red-900 rounded-tr-none' : 'bg-white/10 text-slate-300 rounded-tl-none'}`}>
                                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                                  {m.timestamp && <span className={`text-[9px] font-black tracking-widest uppercase opacity-60 ${m.role === 'admin' ? 'text-right' : 'text-left'}`}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                               </div>
                            </div>
                         ))}
                      </div>
                      <div className="bg-black/40 border-t border-white/5 p-3 flex gap-2 overflow-x-auto hide-scrollbar">
                         {["Dạ chào bạn", "Bạn đợi mình chút nhé", "Đã nạp tiền thành công", "Vui lòng gửi mã giao dịch"].map((qr, idx) => (
                             <button 
                               key={idx} 
                               onClick={() => setChatInput(prev => prev + (prev ? ' ' : '') + qr)} 
                               className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black text-slate-300 transition-colors uppercase tracking-widest border border-white/10"
                             >
                               {qr}
                             </button>
                         ))}
                      </div>
                      <div className="p-4 border-t border-white/5 flex gap-2">
                         <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                  if (!chatInput.trim()) return;
                                  fetch(`/api/chat/${encodeURIComponent(activeChat)}`, {
                                     method: 'POST',
                                     headers: { 'Content-Type': 'application/json' },
                                     body: JSON.stringify({ role: 'admin', text: chatInput })
                                  }).then(res => res.json()).then(data => {
                                     setChats((prev: any) => ({...prev, [activeChat]: data}));
                                  });
                                  setChatInput('');
                               }
                            }}
                            placeholder="Nhập trả lời..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-yellow-500 outline-none"
                         />
                         <button 
                            onClick={async () => {
                               if (!chatInput.trim()) return;
                               const res = await fetch(`/api/chat/${encodeURIComponent(activeChat)}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ role: 'admin', text: chatInput })
                               });
                               const data = await res.json();
                               setChats((prev: any) => ({...prev, [activeChat]: data}));
                               setChatInput('');
                            }}
                            className="bg-yellow-500 text-red-900 p-2.5 rounded-xl disabled:opacity-50"
                         >
                            <Send className="w-5 h-5" />
                         </button>
                      </div>
                   </>
                ) : (
                   <div className="flex-1 flex items-center justify-center text-slate-500 font-bold text-sm">
                      Chọn một cuộc trò chuyện để bắt đầu.
                   </div>
                )}
             </div>
           </div>
        )}

        {tab === 'users' && (
           <div className="bg-bento-card rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="overflow-x-auto admin-scroll">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-5 py-4">TikTok ID</th>
                      <th className="px-5 py-4">Số dư</th>
                      <th className="px-5 py-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u: any) => (
                      <tr key={u.tiktokId} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-black text-white">{u.tiktokId}</td>
                        <td className="px-5 py-4 font-bold text-yellow-400">{u.balance.toLocaleString()}đ</td>
                        <td className="px-5 py-4 text-center">
                           <button onClick={async () => {
                              const newBalance = prompt('Nhập số dư mới:', u.balance);
                              if (newBalance) {
                                await fetch('/api/admin/users/balance', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tiktokId: u.tiktokId, balance: parseInt(newBalance)}) });
                                fetchData();
                              }
                           }} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black mr-2">Sửa số dư</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
         )}
         
         {tab === 'cards' && (
          <div className="bg-bento-card rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="overflow-x-auto admin-scroll">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-4">TikTok ID</th>
                    <th className="px-5 py-4 text-center">Loại / Tiền</th>
                    <th className="px-5 py-4">Thẻ / Seri</th>
                    <th className="px-5 py-4 text-center">Thời gian</th>
                    <th className="px-5 py-4 text-center">Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {recharges.filter(r => r.status === 'waiting').map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-black text-yellow-400 whitespace-nowrap">{r.tiktokId}</td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <p className="font-black text-white">{r.amount.toLocaleString()}đ</p>
                      <span className={cn(
                        "text-[8px] px-2 py-0.5 rounded font-black inline-block mt-1",
                        r.type === 'BANK' ? "bg-blue-500/20 text-blue-400" : 
                        r.type === 'VIETTEL' ? "bg-red-500/20 text-red-500" :
                        r.type === 'MOBIFONE' ? "bg-blue-600/20 text-blue-500" :
                        r.type === 'VINAPHONE' ? "bg-cyan-500/20 text-cyan-500" :
                        r.type === 'GARENA' ? "bg-red-600/20 text-red-600" :
                        "bg-yellow-500/20 text-yellow-500"
                      )}>{r.type}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[9px] text-slate-500 whitespace-nowrap">
                       {r.serial !== 'Manual Transfer' && r.serial !== 'Chuyển khoản' ? (
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <span className="opacity-50">S:</span> <span>{r.serial}</span>
                             <button onClick={() => copy(r.serial)} className="text-blue-500 hover:text-blue-400 p-0.5 active:scale-90 transition-transform">
                               <Copy className="w-3 h-3" />
                             </button>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="opacity-50">C:</span> <span className="text-white font-black">{r.code}</span>
                             <button onClick={() => copy(r.code)} className="text-yellow-500 hover:text-yellow-400 p-0.5 active:scale-90 transition-transform">
                               <Copy className="w-3 h-3" />
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span className="text-blue-400 font-black uppercase tracking-widest">CK: {r.code}</span>
                           <button onClick={() => copy(r.code)} className="text-blue-500 hover:text-blue-400 p-0.5 active:scale-90 transition-transform">
                             <Copy className="w-3 h-3" />
                           </button>
                         </div>
                       )}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                       <p className="text-[10px] text-slate-500 font-bold leading-tight">{new Date(r.createdAt).toLocaleDateString()}<br/>{new Date(r.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => approve(r.id, 'success')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-3 py-2 rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center gap-1 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                          <CheckCircle2 className="w-3 h-3 relative z-10" />
                          <span className="text-[9px] font-black uppercase relative z-10">Duyệt</span>
                        </button>
                        <button onClick={() => approve(r.id, 'error')} className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white px-3 py-2 rounded-xl shadow-[0_5px_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center gap-1 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                          <X className="w-3 h-3 relative z-10" />
                          <span className="text-[9px] font-black uppercase relative z-10">Hủy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recharges.filter(r => r.status === 'waiting').length === 0 && (
            <div className="text-center py-20 text-slate-600 font-black uppercase italic tracking-widest">Hết thẻ ☕</div>
          )}
        </div>
      )}
      {tab === 'withdrawals' && (
        <div className="bg-bento-card rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-4">TikTok ID</th>
                  <th className="px-5 py-4 text-center">Tiền / Ngân hàng</th>
                  <th className="px-5 py-4">Số TK</th>
                  <th className="px-5 py-4 text-center">Thời gian</th>
                  <th className="px-5 py-4 text-center">Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
              {withdrawals.filter(w => w.status === 'pending').map(w => (
                <tr key={w.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-black text-yellow-400 whitespace-nowrap">{w.tiktokId}</td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <p className="font-black text-white text-sm">{w.amount.toLocaleString()}đ</p>
                    <span className="text-[10px] px-3 py-1 rounded-lg font-black inline-block mt-1 bg-purple-500/20 text-purple-300">{w.bank}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[9px] text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <span className="font-black">{w.account}</span>
                       <button onClick={() => { copy(w.account); toast('Đã copy: ' + w.account); }} className="text-yellow-500 hover:text-yellow-400 p-0.5 active:scale-90 transition-transform">
                         <Copy className="w-3 h-3" />
                       </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                     <p className="text-[10px] text-slate-500 font-bold leading-tight">{new Date(w.createdAt).toLocaleDateString()}<br/>{new Date(w.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => approveWithdraw(w.id, 'success')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-3 py-2 rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center gap-1 group relative overflow-hidden">
                        <CheckCircle2 className="w-3 h-3 relative z-10" />
                        <span className="text-[9px] font-black uppercase relative z-10">Duyệt</span>
                      </button>
                      <button onClick={() => approveWithdraw(w.id, 'rejected')} className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white px-3 py-2 rounded-xl shadow-[0_5px_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center gap-1 group relative overflow-hidden">
                        <X className="w-3 h-3 relative z-10" />
                        <span className="text-[9px] font-black uppercase relative z-10">Hủy</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          {withdrawals.filter(w => w.status === 'pending').length === 0 && (
            <div className="text-center py-20 text-slate-600 font-black uppercase italic tracking-widest">Không có lệnh rút ☕</div>
          )}
        </div>
      )}

        {tab === 'winners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {winners.map((w, i) => (
              <div key={i} className="bg-bento-card p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-white uppercase text-lg tracking-tighter italic">{w.tiktokId}</h4>
                    <div className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-2 py-0.5 rounded border border-yellow-500/20 uppercase">
                      {w.prize}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex gap-2 items-center bg-black/30 p-3 rounded-xl border border-white/5">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-slate-300">{w.phone || 'Đang chờ SĐT...'}</span>
                    </div>
                    <div className="flex gap-2 items-center bg-black/30 p-3 rounded-xl border border-white/5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-slate-300 truncate">{w.address || 'Đang chờ địa chỉ...'}</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-600 font-black uppercase text-right mt-3 tracking-widest">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {winners.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] text-slate-600 font-black uppercase italic border border-dashed border-white/10 tracking-widest col-span-2">
                Chưa có ai may mắn...
              </div>
            )}
          </div>
        )}

        {tab === 'vouchers' && (
          <div className="space-y-6">
            <div className="bg-bento-card p-6 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-2xl">
                  <Ticket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase italic tracking-widest text-lg">Tạo Mã Mới</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nhập mã hoặc tạo ngẫu nhiên</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Mã Voucher</label>
                  <input 
                    value={newVoucherCode}
                    onChange={(e) => setNewVoucherCode(e.target.value)}
                    placeholder="VD: FREE50K" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white font-bold uppercase transition-all focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Số tiền (VNĐ)</label>
                  <input 
                    type="number"
                    value={newVoucherAmount}
                    onChange={(e) => setNewVoucherAmount(e.target.value)}
                    placeholder="VD: 50000" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white font-bold transition-all focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Số lượng</label>
                  <input 
                    type="number"
                    value={newVoucherQty}
                    onChange={(e) => setNewVoucherQty(e.target.value)}
                    placeholder="VD: 100" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white font-bold transition-all focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!newVoucherCode || !newVoucherAmount || !newVoucherQty) return toast('Nhập đủ thông tin');
                  const res = await fetch('/api/admin/vouchers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: newVoucherCode, amount: newVoucherAmount, qty: newVoucherQty })
                  });
                  if (res.ok) {
                    toast('Tạo voucher thành công!');
                    setNewVoucherCode('');
                    setNewVoucherAmount('');
                    setNewVoucherQty('');
                    fetchData();
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg relative z-10 uppercase tracking-widest text-xs transition-transform active:scale-[0.98]"
              >
                Tạo Voucher
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(vouchers).map(([code, v]: [string, any]) => (
                 <div key={code} className="bg-black/40 p-5 rounded-3xl border border-white/5 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10 mb-3">
                      <div>
                        <h4 className="text-xl font-black text-blue-400 uppercase tracking-widest">{code}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Trị giá: <span className="text-yellow-400 text-xs">{(v.amount).toLocaleString()}đ</span></p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (confirm('Xóa voucher này?')) {
                            await fetch(`/api/admin/vouchers/${code}`, { method: 'DELETE' });
                            fetchData();
                          }
                        }}
                        className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-colors"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 p-3 rounded-xl">
                      <span className="flex-1">Còn lại: <span className="text-white">{v.qty}</span> lượt</span>
                      <span className="flex-1 border-l border-white/10 pl-2">Đã dùng: <span className="text-white">{(v.usedBy || []).length}</span></span>
                    </div>
                 </div>
              ))}
              {Object.keys(vouchers).length === 0 && (
                 <div className="col-span-2 text-center py-20 text-slate-500 uppercase tracking-widest text-[10px] font-black">
                   Chưa có mã Voucher nào
                 </div>
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6">
            {/* Global Notification Broadcast Tool */}
            <div className="bg-purple-600/10 p-6 rounded-[2.5rem] border border-purple-600/20 shadow-xl space-y-4">
               <div>
                  <h3 className="font-black text-purple-400 uppercase italic tracking-widest text-sm mb-1 flex items-center gap-2"><Bell className="w-4 h-4" /> Gửi Thông Báo Toàn Sàn</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase italic">Báo số dư/Khuyến mãi tới TẤT CẢ người chơi đang hoạt động</p>
               </div>
               <textarea 
                  id="admin-broadcast-msg"
                  placeholder="Nhập nội dung thông báo (VD: Nạp ngay hôm nay x2 giá trị...)" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
               />
               <button 
                  onClick={async () => {
                    const message = (document.getElementById('admin-broadcast-msg') as HTMLTextAreaElement).value;
                    if (!message) return toast('Nhập nội dung');
                    const res = await fetch('/api/admin/broadcast', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message })
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast(`Đã gửi thông báo tới ${data.sentCount} người chơi!`);
                      (document.getElementById('admin-broadcast-msg') as HTMLTextAreaElement).value = '';
                    } else {
                      toast('Lỗi');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center gap-2">PHÁT SÓNG LÊN TOÀN MÁY CHỦ <Megaphone className="w-4 h-4" /></span>
               </button>
            </div>

            {/* Win Rate */}
            <div className="bg-bento-card rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden relative">
              <h3 className="font-black text-white uppercase italic mb-6 tracking-widest text-sm">Tỉ lệ trúng toàn sàn</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Túi Mù (%)</label>
                  <input 
                    type="number" 
                    defaultValue={config.winRate * 100}
                    onBlur={(e) => updateConfig({ winRate: parseFloat(e.target.value) / 100 })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-6 text-3xl font-black text-yellow-400 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Đập Đồ (Nâng cấp) (%)</label>
                  <input 
                    type="number" 
                    defaultValue={(config.upgradeRate ?? 0.4) * 100}
                    onBlur={(e) => updateConfig({ upgradeRate: parseFloat(e.target.value) / 100 })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-purple-400 text-center"
                  />
                </div>

                {config.spinRates && (
                  <div className="bg-black/30 p-4 rounded-3xl border border-white/10 space-y-3">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Tỉ lệ Vòng Quay</p>
                     <div className="grid grid-cols-2 gap-3">
                        {Object.entries(config.spinRates).map(([key, val]) => (
                           <div key={key}>
                             <label className="text-[9px] uppercase font-bold text-slate-500 ml-2 mb-1 block">
                               {key === 'none' && 'Xịt'}
                               {key === 'coin10k' && '10k'}
                               {key === 'coin20k' && '20k'}
                               {key === 'coin50k' && '50k'}
                               {key === 'item' && 'Gấu BB'}
                               {key === 'jackpot' && 'Nổ Hũ'} (%)
                             </label>
                             <input 
                               type="number" 
                               defaultValue={(val as number) * 100}
                               onBlur={(e) => {
                                 const newRates = { ...config.spinRates, [key]: parseFloat(e.target.value) / 100 } as any;
                                 updateConfig({ spinRates: newRates });
                               }}
                               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white text-center focus:border-yellow-500 focus:outline-none"
                             />
                           </div>
                        ))}
                     </div>
                     <p className="text-[8px] text-slate-500 font-bold text-center italic">* Tổng tỉ lệ vòng quay nên là 100% (hiện tại: {((Object.values(config.spinRates) as number[]).reduce((a, b) => a + b, 0) * 100).toFixed(1)}%)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-bento-card rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative">
              <h3 className="font-black text-white uppercase italic mb-6 tracking-widest text-sm">Thông tin thanh toán</h3>
              <div className="space-y-8">
                {/* Bank Settings */}
                <div className="space-y-4 p-4 bg-black/20 rounded-3xl border border-white/5">
                  <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest">Cấu hình Ngân Hàng</p>

                  {config.paymentInfo?.bank?.qrUrl && (
                    <div className="flex justify-center mb-2">
                       <div className="bg-white p-1 rounded-xl">
                         <img src={config.paymentInfo.bank.qrUrl} alt="Bank Preview" className="w-20 h-20 object-contain rounded-lg" />
                       </div>
                    </div>
                  )}

                  <input 
                    placeholder="Tên Ngân Hàng (MB, VCB...)"
                    defaultValue={config.paymentInfo?.bank?.bankName}
                    id="bank-name-field"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                  <input 
                    placeholder="Tên chủ tài khoản"
                    defaultValue={config.paymentInfo?.bank?.name}
                    id="bank-holder-name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm uppercase"
                  />
                  <input 
                    placeholder="Số tài khoản"
                    defaultValue={config.paymentInfo?.bank?.account}
                    id="bank-account"
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                  <input 
                    placeholder="Mã Ngân Hàng (BIN) - Ví dụ: 970422"
                    defaultValue={config.paymentInfo?.bank?.bankBin}
                    id="bank-bin"
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[9px] text-blue-400 font-bold uppercase leading-tight italic">
                      * Nhập mã BIN để hệ thống tự động tạo mã VietQR động cho người dùng. 
                      MB Bank: 970422, VCB: 970436...
                    </p>
                  </div>
                  <textarea 
                    placeholder="Lưu ý quan trọng cho người chuyển khoản..."
                    defaultValue={config.paymentInfo?.bank?.bankNote}
                    id="bank-note"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs h-24 whitespace-pre-wrap"
                  />
                  <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Bảo trì Nạp Ngân Hàng</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 max-w-[200px]">Ẩn cổng nạp Ngân hàng ở phía người dùng.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={config.paymentInfo?.bank?.isMaintenance}
                        id="bank-maintenance-check"
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-black/40 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 border border-white/10"></div>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Link QR Ngân Hàng"
                      id="bank-qr"
                      defaultValue={config.paymentInfo?.bank?.qrUrl?.startsWith('data:') ? 'Ảnh đã tải lên' : config.paymentInfo?.bank?.qrUrl}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                    />
                    <label className="bg-yellow-500 text-red-900 px-4 py-2 rounded-xl flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bank')} />
                    </label>
                  </div>
                  <button 
                    onClick={() => {
                      const bankName = (document.getElementById('bank-name-field') as HTMLInputElement).value;
                      const name = (document.getElementById('bank-holder-name') as HTMLInputElement).value;
                      const account = (document.getElementById('bank-account') as HTMLInputElement).value;
                      const bankBin = (document.getElementById('bank-bin') as HTMLInputElement).value;
                      const bankNote = (document.getElementById('bank-note') as HTMLTextAreaElement).value;
                      const qrUrlStr = (document.getElementById('bank-qr') as HTMLInputElement).value;
                      const isMaintenance = (document.getElementById('bank-maintenance-check') as HTMLInputElement).checked;
                      const qrUrl = qrUrlStr === 'Ảnh đã tải lên' ? config.paymentInfo.bank.qrUrl : qrUrlStr;
                      updateConfig({ paymentInfo: { ...config.paymentInfo, bank: { ...config.paymentInfo.bank, bankName, name, account, bankBin, bankNote, qrUrl, isMaintenance } } });
                      toast('Đã lưu cấu hình Ngân Hàng!');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-sweep pointer-events-none" />
                    <span className="relative z-10 flex items-center justify-center gap-2">LƯU CẤU HÌNH NGÂN HÀNG <Save className="w-4 h-4" /></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Shattered Box Effect ---
const ShatteredBox = () => {
  return (
    <div className="w-20 h-20 sm:w-28 sm:h-28 relative flex items-center justify-center">
       {/* Background Flash */}
       <motion.div 
         initial={{ opacity: 1, scale: 0.5 }}
         animate={{ opacity: 0, scale: 2 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="absolute inset-0 bg-white rounded-full blur-xl z-0"
       />

       {/* Shattering Pieces */}
       {[
         { x: -80, y: -80, r: -45, path: 'polygon(0 0, 100% 0, 50% 100%)' },
         { x: 80, y: -80, r: 45, path: 'polygon(0 0, 100% 0, 50% 100%)' },
         { x: -80, y: 80, r: -45, path: 'polygon(0 100%, 100% 100%, 50% 0)' },
         { x: 80, y: 80, r: 45, path: 'polygon(0 100%, 100% 100%, 50% 0)' },
         { x: -120, y: 0, r: -120, path: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)' },
         { x: 120, y: 0, r: 120, path: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)' },
       ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: [1, 1.2, 0], rotate: p.r }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 border border-white/50 backdrop-blur-md shadow-2xl z-10"
            style={{ clipPath: p.path }}
          />
       ))}

       {/* X Mark Fade Out */}
       <motion.div 
         initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
         animate={{ scale: [1.5, 2, 2.5], opacity: [1, 0.8, 0], rotate: 0 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         className="absolute inset-0 flex items-center justify-center text-slate-300 drop-shadow-xl z-20"
       >
          <X className="w-16 h-16 opacity-50 text-red-500" />
       </motion.div>
    </div>
  )
};

// --- Loading Spinner ---
const LoadingSpinner = ({ text = "ĐANG TẢI..." }: { text?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, -5, 5, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-[0_0_100px_rgba(234,179,8,0.5)] flex items-center justify-center relative border-4 border-white/20"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-ring pointer-events-none" />
        <Gift className="w-24 h-24 text-white relative z-10 drop-shadow-2xl animate-bounce-subtle" />
      </motion.div>
      <motion.h2 
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="mt-12 text-2xl font-black text-yellow-400 uppercase italic tracking-[0.3em] drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] relative z-10"
      >
        {text}
      </motion.h2>
    </motion.div>
  );
};