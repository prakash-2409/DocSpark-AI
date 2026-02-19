import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, Gauge } from 'lucide-react';

/**
 * ReadAloud — text-to-speech controls.
 * Uses the browser's SpeechSynthesis API.
 * Reads selected text or full document.
 */
const ReadAloud = ({ editor }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const utteranceRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const getTextToRead = useCallback(() => {
    if (!editor) return '';

    // If text is selected, read selection only
    const { from, to, empty } = editor.state.selection;
    if (!empty) {
      return editor.state.doc.textBetween(from, to, ' ');
    }
    // Otherwise read full document
    return editor.getText();
  }, [editor]);

  const handlePlay = useCallback(() => {
    if (!isSupported) return;

    const text = getTextToRead();
    if (!text.trim()) return;

    // If paused, just resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.lang = navigator.language || 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setShowControls(true);
  }, [isSupported, isPaused, speed, getTextToRead]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setShowControls(false);
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    // If currently playing, restart with new speed
    if (isPlaying || isPaused) {
      handleStop();
    }
  }, [speed, isPlaying, isPaused, handleStop]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-0.5">
      {/* Main play/pause button */}
      {!isPlaying && !isPaused ? (
        <button
          onClick={handlePlay}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Read aloud (selected text or full document)"
        >
          <Volume2 size={16} />
        </button>
      ) : (
        <>
          {/* Play/Pause toggle */}
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            title={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Stop"
          >
            <Square size={14} />
          </button>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors tabular-nums"
            title="Change speed"
          >
            {speed}x
          </button>
        </>
      )}
    </div>
  );
};

export default ReadAloud;
