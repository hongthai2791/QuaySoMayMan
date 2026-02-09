import React, { useState, useRef, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import { Settings, Play, Square, Trash2, History, Trophy, Music, VolumeX } from 'lucide-react';
import { AppSettings, DrawHistoryItem } from './types';
import { SettingsModal } from './components/SettingsModal';
import { NumberDisplay } from './components/NumberDisplay';
import { soundManager } from './utils/audio';

// Default configuration
const DEFAULT_SETTINGS: AppSettings = {
  min: 1,
  max: 100,
  priorityList: [],
  backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  backgroundMusicUrl: "",
  volume: 0.5
};

const App: React.FC = () => {
  // State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<DrawHistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Refs for animation loop
  const spinIntervalRef = useRef<number | null>(null);
  const windowSize = useRef({ width: window.innerWidth, height: window.innerHeight });

  // Handle Window Resize for Confetti
  useEffect(() => {
    const handleResize = () => {
      windowSize.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync music settings
  useEffect(() => {
    if (settings.backgroundMusicUrl) {
      soundManager.setMusic(settings.backgroundMusicUrl);
      soundManager.setMusicVolume(settings.volume);
      
      if (isMusicPlaying) {
        soundManager.playMusic(settings.volume);
      } else {
        soundManager.pauseMusic();
      }
    } else {
      soundManager.pauseMusic();
    }
  }, [settings.backgroundMusicUrl, settings.volume, isMusicPlaying]);

  // Generate a random number excluding history
  const getRandomNumber = useCallback((min: number, max: number, exclude: number[]) => {
    const pool = [];
    for (let i = min; i <= max; i++) {
      if (!exclude.includes(i)) pool.push(i);
    }
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const startSpin = () => {
    // Check if valid pool exists
    const totalDrawn = history.map(h => h.number);
    const poolSize = (settings.max - settings.min + 1) - totalDrawn.length;
    
    // Check priority availability
    const availablePriority = settings.priorityList.filter(n => !totalDrawn.includes(n));
    const isPriorityAvailable = availablePriority.length > 0;

    if (poolSize <= 0 && !isPriorityAvailable) {
      alert("Đã quay hết số trong khoảng này! (No more numbers available)");
      return;
    }

    setIsSpinning(true);
    setShowConfetti(false);
    
    // Animation Logic
    const speed = 50; // ms
    spinIntervalRef.current = window.setInterval(() => {
      // Just visual noise during spin, doesn't need to respect exclusions perfectly until stop
      const visualNum = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
      setCurrentNumber(visualNum);
      soundManager.playTick(settings.volume);
    }, speed);
  };

  const stopSpin = () => {
    if (!spinIntervalRef.current) return;

    clearInterval(spinIntervalRef.current);
    spinIntervalRef.current = null;
    setIsSpinning(false);

    // Determine Winner Logic
    const totalDrawn = history.map(h => h.number);
    let winner: number | null = null;

    // 1. Check Priority List first
    const availablePriority = settings.priorityList.filter(n => !totalDrawn.includes(n));
    
    if (availablePriority.length > 0) {
      // Take the first one (Queue style) or random from priority? 
      // User prompt said "Priority list", usually implies order or high weight. Let's do Order.
      winner = availablePriority[0];
    } else {
      // 2. Random from remaining range
      winner = getRandomNumber(settings.min, settings.max, totalDrawn);
    }

    if (winner !== null) {
      setCurrentNumber(winner);
      setHistory(prev => [{ number: winner!, timestamp: Date.now() }, ...prev]);
      setShowConfetti(true);
      soundManager.playWin(settings.volume);
      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
       // Should be caught by startSpin check, but safety net
       alert("No numbers left!");
    }
  };

  const toggleSpin = () => {
    if (isSpinning) {
      stopSpin();
    } else {
      startSpin();
    }
  };

  const clearHistory = () => {
    if (confirm("Bạn có chắc muốn xóa lịch sử quay số?")) {
      setHistory([]);
      setCurrentNumber(null);
    }
  };

  const toggleMusic = () => {
    if (!settings.backgroundMusicUrl) {
      alert("Vui lòng cài đặt link nhạc nền trong phần Cài đặt trước!");
      setIsSettingsOpen(true);
      return;
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <div 
      className="min-h-screen w-full text-white transition-all duration-500 bg-cover bg-center bg-no-repeat flex flex-col overflow-hidden"
      style={{ background: settings.backgroundImage.startsWith('url') ? settings.backgroundImage : settings.backgroundImage, backgroundSize: 'cover' }}
    >
      {showConfetti && <Confetti width={windowSize.current.width} height={windowSize.current.height} numberOfPieces={200} recycle={false} />}

      {/* Top Company Banner */}
      <div className="w-full bg-black/40 backdrop-blur-md py-3 text-center border-b border-white/10 z-30 shadow-lg">
        <h2 className="text-white font-black tracking-wider text-lg md:text-2xl uppercase text-shadow-glow">
          CÔNG TY TNHH TM & XD QUYẾT NHÀI
        </h2>
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 md:gap-4 glass-panel px-4 py-2 rounded-full">
           <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
           <h1 className="text-lg md:text-2xl font-bold tracking-wide">VÒNG QUAY MAY MẮN</h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleMusic} 
            className={`p-3 rounded-full glass-panel hover:bg-white/20 transition-all active:scale-95 ${isMusicPlaying ? 'text-green-400' : 'text-white/70'}`}
            title="Bật/Tắt Nhạc"
          >
            {isMusicPlaying ? <Music className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
            className="p-3 rounded-full glass-panel hover:bg-white/20 transition-all active:scale-95"
            title="Lịch sử"
          >
            <History className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="p-3 rounded-full glass-panel hover:bg-white/20 transition-all active:scale-95"
            title="Cài đặt"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-7xl mx-auto">
        
        {/* Number Display */}
        <div className="w-full mb-12">
            <NumberDisplay currentNumber={currentNumber} isSpinning={isSpinning} />
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
            <button
              onClick={toggleSpin}
              className={`group relative flex items-center justify-center gap-3 px-12 py-5 rounded-full text-2xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${isSpinning 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50' 
                : 'bg-white hover:bg-gray-50 text-blue-900 shadow-blue-500/30'}`}
            >
               {isSpinning ? <Square className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
               {isSpinning ? "DỪNG LẠI (STOP)" : "QUAY SỐ (START)"}
            </button>
        </div>
        
        {/* Status Text */}
        <div className="mt-8 text-center opacity-80 font-medium glass-panel px-6 py-2 rounded-full text-sm md:text-base">
           Khoảng số: {settings.min} - {settings.max} | Đã quay: {history.length}
        </div>

      </main>

      {/* History Sidebar/Overlay */}
      {isHistoryOpen && (
        <div className="absolute top-0 right-0 h-full w-80 max-w-full glass-panel border-l border-white/20 z-30 transition-transform duration-300 flex flex-col shadow-2xl backdrop-blur-xl bg-black/20">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5" /> Lịch Sử
            </h2>
            <button onClick={() => setIsHistoryOpen(false)} className="hover:bg-white/10 p-1 rounded-full"><Settings className="w-5 h-5 rotate-45" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {history.length === 0 ? (
              <p className="text-center text-white/50 mt-10 italic">Chưa có số nào được quay</p>
            ) : (
              history.map((item, idx) => (
                <div key={item.timestamp} className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/5">
                  <span className="font-mono text-white/50 text-sm">#{history.length - idx}</span>
                  <span className="text-2xl font-bold text-yellow-300">{item.number}</span>
                  <span className="text-xs text-white/60">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-white/10 bg-white/5">
            <button 
              onClick={clearHistory}
              className="w-full py-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" /> Xóa Lịch Sử
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
            setSettings(newSettings);
            // Optionally reset current number if out of range, but usually fine to keep
        }}
      />
    </div>
  );
};

export default App;