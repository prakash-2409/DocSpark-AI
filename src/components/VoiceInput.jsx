import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Circle } from 'lucide-react';

/**
 * VoiceInput — speech-to-text button for the editor.
 * Uses the browser's SpeechRecognition API (Chrome/Edge).
 * Inserts transcribed text at the current cursor position.
 */
const VoiceInput = ({ editor }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!editor) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript.trim() && editor) {
        // Insert at cursor position
        editor.chain().focus().insertContent(transcript + ' ').run();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [editor, isListening]);

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`relative p-2 rounded-lg transition-all ${
        isListening
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-300 dark:ring-red-700'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
      title={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      {/* Pulsing red dot when recording */}
      {isListening && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </button>
  );
};

export default VoiceInput;
