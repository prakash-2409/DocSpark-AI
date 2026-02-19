import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Settings, Volume2, VolumeX,
  Maximize, Minimize, Edit3, Palette, X
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animated gradient themes — Flocus / aurora style                   */
/* ------------------------------------------------------------------ */
const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#7c3aed', '#db2777', '#f43f5e', '#3b82f6', '#a855f7'],
    cssGradient: `
      radial-gradient(ellipse 80% 60% at 10% 30%, rgba(124, 58, 237, 0.8) 0%, transparent 70%),
      radial-gradient(ellipse 70% 50% at 80% 20%, rgba(219, 39, 119, 0.7) 0%, transparent 65%),
      radial-gradient(ellipse 90% 70% at 50% 80%, rgba(244, 63, 94, 0.6) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 90% 70%, rgba(168, 85, 247, 0.5) 0%, transparent 55%),
      linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #581c87 60%, #831843 100%)
    `,
  },
  {
    id: 'sunset-dream',
    name: 'Sunset Dream',
    colors: ['#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#f59e0b'],
    cssGradient: `
      radial-gradient(ellipse 70% 60% at 20% 40%, rgba(249, 115, 22, 0.8) 0%, transparent 65%),
      radial-gradient(ellipse 80% 50% at 70% 30%, rgba(236, 72, 153, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 50% 90%, rgba(139, 92, 246, 0.6) 0%, transparent 55%),
      radial-gradient(ellipse 90% 40% at 90% 60%, rgba(245, 158, 11, 0.5) 0%, transparent 50%),
      linear-gradient(160deg, #7c2d12 0%, #991b1b 30%, #86198f 60%, #4c1d95 100%)
    `,
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    colors: ['#0ea5e9', '#06b6d4', '#3b82f6', '#6366f1', '#14b8a6'],
    cssGradient: `
      radial-gradient(ellipse 70% 60% at 15% 35%, rgba(14, 165, 233, 0.8) 0%, transparent 65%),
      radial-gradient(ellipse 80% 55% at 75% 25%, rgba(6, 182, 212, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 65% 80% at 50% 85%, rgba(99, 102, 241, 0.6) 0%, transparent 55%),
      radial-gradient(ellipse 50% 50% at 85% 65%, rgba(20, 184, 166, 0.5) 0%, transparent 50%),
      linear-gradient(140deg, #0c4a6e 0%, #164e63 30%, #1e3a5f 60%, #312e81 100%)
    `,
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    colors: ['#22d3ee', '#a78bfa', '#34d399', '#818cf8', '#2dd4bf'],
    cssGradient: `
      radial-gradient(ellipse 80% 50% at 25% 30%, rgba(34, 211, 238, 0.7) 0%, transparent 65%),
      radial-gradient(ellipse 60% 70% at 70% 50%, rgba(167, 139, 250, 0.6) 0%, transparent 60%),
      radial-gradient(ellipse 70% 60% at 40% 80%, rgba(52, 211, 153, 0.6) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 85% 20%, rgba(45, 212, 191, 0.5) 0%, transparent 50%),
      linear-gradient(150deg, #042f2e 0%, #0f172a 40%, #1e1b4b 70%, #064e3b 100%)
    `,
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    colors: ['#f472b6', '#fb7185', '#e879f9', '#c084fc', '#fda4af'],
    cssGradient: `
      radial-gradient(ellipse 75% 55% at 20% 40%, rgba(244, 114, 182, 0.8) 0%, transparent 65%),
      radial-gradient(ellipse 65% 60% at 75% 30%, rgba(232, 121, 249, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 80% 50% at 50% 85%, rgba(251, 113, 133, 0.6) 0%, transparent 55%),
      radial-gradient(ellipse 55% 45% at 90% 60%, rgba(253, 164, 175, 0.5) 0%, transparent 50%),
      linear-gradient(135deg, #500724 0%, #701a75 30%, #4c1d95 60%, #831843 100%)
    `,
  },
  {
    id: 'midnight-fire',
    name: 'Midnight Fire',
    colors: ['#f97316', '#ef4444', '#a855f7', '#6366f1', '#fbbf24'],
    cssGradient: `
      radial-gradient(ellipse 60% 50% at 15% 50%, rgba(249, 115, 22, 0.8) 0%, transparent 60%),
      radial-gradient(ellipse 70% 60% at 80% 35%, rgba(239, 68, 68, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 80% 45% at 50% 80%, rgba(168, 85, 247, 0.6) 0%, transparent 55%),
      radial-gradient(ellipse 50% 55% at 90% 70%, rgba(251, 191, 36, 0.4) 0%, transparent 50%),
      linear-gradient(160deg, #0f172a 0%, #1e1b4b 30%, #450a0a 60%, #0f172a 100%)
    `,
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    colors: ['#818cf8', '#c084fc', '#e879f9', '#38bdf8', '#a78bfa'],
    cssGradient: `
      radial-gradient(ellipse 70% 60% at 30% 25%, rgba(129, 140, 248, 0.8) 0%, transparent 65%),
      radial-gradient(ellipse 80% 50% at 70% 60%, rgba(192, 132, 252, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 20% 80%, rgba(56, 189, 248, 0.5) 0%, transparent 55%),
      radial-gradient(ellipse 55% 50% at 85% 15%, rgba(232, 121, 249, 0.6) 0%, transparent 50%),
      linear-gradient(145deg, #020617 0%, #0f172a 30%, #1e1b4b 60%, #0c0a09 100%)
    `,
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    colors: ['#10b981', '#059669', '#14b8a6', '#0ea5e9', '#34d399'],
    cssGradient: `
      radial-gradient(ellipse 70% 55% at 25% 35%, rgba(16, 185, 129, 0.8) 0%, transparent 65%),
      radial-gradient(ellipse 80% 60% at 75% 40%, rgba(5, 150, 105, 0.7) 0%, transparent 60%),
      radial-gradient(ellipse 65% 70% at 40% 85%, rgba(14, 165, 233, 0.5) 0%, transparent 55%),
      radial-gradient(ellipse 50% 45% at 90% 25%, rgba(52, 211, 153, 0.6) 0%, transparent 50%),
      linear-gradient(140deg, #022c22 0%, #064e3b 30%, #0c4a6e 60%, #042f2e 100%)
    `,
  },
];

/* ------------------------------------------------------------------ */
/*  Motivational quotes                                                */
/* ------------------------------------------------------------------ */
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "History doesn't talk about quitters.", author: "" },
  { text: "You get what you work for, not what you wish for.", author: "" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "Hardest worker in the room.", author: "" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return "Burning the midnight oil?";
  if (h < 12) return "Good morning! Let's get focused.";
  if (h < 17) return "Good afternoon! Keep the momentum.";
  if (h < 21) return "Good evening! Finish strong.";
  return "Late night study session? You got this!";
};

const formatCurrentTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    playNote(523.25, 0, 0.6);
    playNote(659.25, 0.2, 0.8);
    playNote(783.99, 0.5, 1.0);
  } catch (e) { /* fail silently */ }
};

/* ------------------------------------------------------------------ */
/*  PomodoroPage Component                                             */
/* ------------------------------------------------------------------ */
const PomodoroPage = () => {
  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  // UI state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [editingTask, setEditingTask] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatCurrentTime());
  const [quote, setQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // Load saved state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pomodoro-stats') || '{}');
      const today = new Date().toDateString();
      if (saved.date === today) {
        setSessionsCompleted(saved.sessions || 0);
        setTotalFocusTime(saved.focusTime || 0);
      }
      const savedTheme = localStorage.getItem('pomodoro-theme');
      if (savedTheme) {
        const t = THEMES.find(th => th.id === savedTheme);
        if (t) setActiveTheme(t);
      }
      const savedTask = localStorage.getItem('pomodoro-task');
      if (savedTask) setFocusTask(savedTask);
    } catch (e) {}
  }, []);

  // Real-time clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(formatCurrentTime()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Rotate quotes every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const saveStats = useCallback((sessions, focusTime) => {
    localStorage.setItem('pomodoro-stats', JSON.stringify({
      date: new Date().toDateString(),
      sessions,
      focusTime,
    }));
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (mode === 'work') {
            setTotalFocusTime(ft => {
              const newFt = ft + 1;
              saveStats(sessionsCompleted, newFt);
              return newFt;
            });
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode, sessionsCompleted, saveStats]);

  // Timer completed
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) playChime();

      if (mode === 'work') {
        const newSessions = sessionsCompleted + 1;
        setSessionsCompleted(newSessions);
        saveStats(newSessions, totalFocusTime);
        if (newSessions % longBreakInterval === 0) {
          setMode('long-break');
          setTimeLeft(longBreak * 60);
        } else {
          setMode('short-break');
          setTimeLeft(shortBreak * 60);
        }
      } else {
        setMode('work');
        setTimeLeft(workDuration * 60);
      }
    }
  }, [timeLeft, isRunning]);

  // Fullscreen handling
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    switch (newMode) {
      case 'work': setTimeLeft(workDuration * 60); break;
      case 'short-break': setTimeLeft(shortBreak * 60); break;
      case 'long-break': setTimeLeft(longBreak * 60); break;
    }
  };

  const selectTheme = (theme) => {
    setActiveTheme(theme);
    localStorage.setItem('pomodoro-theme', theme.id);
    setShowThemePicker(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {}
  };

  const saveTask = () => {
    setEditingTask(false);
    localStorage.setItem('pomodoro-task', focusTask);
  };

  const modeLabel = mode === 'work' ? 'Focus' : mode === 'short-break' ? 'Short Break' : 'Long Break';
  const focusMinutes = Math.floor(totalFocusTime / 60);

  // Session dots
  const sessionDots = useMemo(() => {
    const dotsInCurrentCycle = sessionsCompleted % longBreakInterval;
    return Array.from({ length: longBreakInterval }, (_, i) => i < dotsInCurrentCycle);
  }, [sessionsCompleted, longBreakInterval]);

  return (
    <div
      ref={containerRef}
      className="pomodoro-container relative overflow-hidden select-none"
      style={{
        minHeight: isFullscreen ? '100vh' : 'calc(100vh - 6rem)',
        margin: isFullscreen ? 0 : '-1.5rem -1rem -1.5rem -1rem',
      }}
    >
      <Helmet>
        <title>{isRunning ? `${formatTime(timeLeft)} — ${modeLabel}` : 'Pomodoro Timer — DocHub'}</title>
      </Helmet>

      {/* ---- Animated gradient background ---- */}
      <div
        className="absolute inset-0 pomodoro-bg-animate"
        style={{ background: activeTheme.cssGradient, backgroundSize: '200% 200%' }}
      />

      {/* Floating light orbs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pomodoro-orb pomodoro-orb-1" />
        <div className="pomodoro-orb pomodoro-orb-2" />
        <div className="pomodoro-orb pomodoro-orb-3" />
      </div>

      {/* ---- Content ---- */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[inherit] px-4 sm:px-8 py-8">

        {/* Top bar */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between">
          {/* Current time */}
          <div className="text-white/50 text-sm font-medium tracking-wide">
            {currentTime}
          </div>

          {/* Quote */}
          <AnimatePresence mode="wait">
            <motion.p
              key={quote.text}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block text-right text-white/60 text-sm italic max-w-xs leading-relaxed font-medium"
            >
              &ldquo;{quote.text}&rdquo;
              {quote.author && <span className="block text-white/30 text-xs mt-0.5 not-italic">— {quote.author}</span>}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
            <span><span className="text-white/70 font-bold">{sessionsCompleted}</span> sessions</span>
            <span><span className="text-white/70 font-bold">{focusMinutes}</span> min focused</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all" title={soundEnabled ? 'Mute' : 'Unmute'}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={() => { setShowThemePicker(!showThemePicker); setShowSettings(false); }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all" title="Theme">
              <Palette size={16} />
            </button>
            <button onClick={() => { setShowSettings(!showSettings); setShowThemePicker(false); }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all" title="Settings">
              <Settings size={16} />
            </button>
            <button onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all" title="Fullscreen">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* Theme picker popup */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 right-4 sm:right-8 bg-black/50 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 z-30 w-60"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Theme</p>
                <button onClick={() => setShowThemePicker(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => selectTheme(theme)}
                    className={`relative text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTheme.id === theme.id
                        ? 'bg-white/20 text-white ring-1 ring-white/30'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1">
                      {theme.colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    {theme.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings popup */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 right-4 sm:right-8 bg-black/50 backdrop-blur-2xl rounded-2xl p-5 border border-white/10 z-30 w-60"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Timer Settings</p>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
              </div>
              {[
                { label: 'Focus', value: workDuration, set: setWorkDuration },
                { label: 'Short Break', value: shortBreak, set: setShortBreak },
                { label: 'Long Break', value: longBreak, set: setLongBreak },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between mb-2.5">
                  <span className="text-white/70 text-xs">{label}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => set(Math.max(1, value - 5))} className="w-6 h-6 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-xs font-bold">−</button>
                    <span className="text-white font-bold text-xs tabular-nums w-5 text-center">{value}</span>
                    <button onClick={() => set(Math.min(90, value + 5))} className="w-6 h-6 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-xs font-bold">+</button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { resetTimer(); setShowSettings(false); }}
                className="w-full mt-2 py-2 rounded-xl bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/20 transition-all"
              >
                Apply & Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Main center content ---- */}
        <div className="flex flex-col items-center gap-2">

          {/* Greeting */}
          <p className="text-white/50 text-sm font-medium tracking-wide mb-2">{getGreeting()}</p>

          {/* Focus task */}
          <div className="flex items-center gap-2 mb-4">
            {editingTask ? (
              <input
                autoFocus
                value={focusTask}
                onChange={e => setFocusTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveTask()}
                onBlur={saveTask}
                placeholder="What are you focusing on?"
                className="bg-transparent border-b-2 border-white/30 text-white text-lg sm:text-xl font-medium text-center placeholder-white/30 focus:outline-none focus:border-white/60 transition-colors min-w-[280px] pb-1"
              />
            ) : (
              <button
                onClick={() => setEditingTask(true)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
              >
                <span className="text-lg sm:text-xl font-medium">
                  {focusTask || 'What do you want to focus on?'}
                </span>
                <Edit3 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Mode tabs */}
          <div className="flex items-center gap-1 mb-2">
            {[
              { id: 'work', label: 'Focus' },
              { id: 'short-break', label: 'Short Break' },
              { id: 'long-break', label: 'Long Break' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchMode(id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === id
                    ? 'bg-white/20 text-white backdrop-blur-sm border border-white/20 shadow-lg'
                    : 'text-white/50 hover:text-white/80 border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Session dots */}
          <div className="flex items-center gap-2 mb-4">
            {sessionDots.map((filled, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  filled ? 'bg-white shadow-lg shadow-white/30 scale-110' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* ---- HUGE TIMER ---- */}
          <motion.div
            key={mode}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative"
          >
            <h1 className="pomodoro-time text-white font-extralight leading-none tracking-tighter">
              {formatTime(timeLeft)}
            </h1>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all shadow-2xl ${
                isRunning
                  ? 'bg-white/15 backdrop-blur-md text-white hover:bg-white/25 border border-white/20'
                  : 'bg-white text-gray-900 hover:bg-gray-100 shadow-white/20'
              }`}
            >
              {isRunning ? <Pause size={22} /> : <Play size={22} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Quote — mobile */}
        <div className="md:hidden mt-10">
          <p className="text-center text-white/50 text-sm italic max-w-xs mx-auto leading-relaxed">
            &ldquo;{quote.text}&rdquo;
            {quote.author && <span className="block text-white/30 text-xs mt-0.5 not-italic">— {quote.author}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
