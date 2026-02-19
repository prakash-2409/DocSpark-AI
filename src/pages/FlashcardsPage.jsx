import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Check, X, FlipHorizontal,
  ChevronLeft, ChevronRight, Shuffle, RotateCcw,
  Layers, GraduationCap, Sparkles, BookOpen
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Local storage helpers                                              */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = 'dochub-flashcards';

const loadDecks = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

const saveDecks = (decks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
};

/* ------------------------------------------------------------------ */
/*  FlashcardsPage                                                     */
/* ------------------------------------------------------------------ */
const FlashcardsPage = () => {
  const [decks, setDecks] = useState(loadDecks);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [studyMode, setStudyMode] = useState(false);

  // Persist on change
  useEffect(() => { saveDecks(decks); }, [decks]);

  const activeDeck = useMemo(() => decks.find(d => d.id === activeDeckId), [decks, activeDeckId]);

  /* CRUD ops */
  const createDeck = (name) => {
    const deck = { id: Date.now(), name, cards: [], createdAt: new Date().toISOString() };
    setDecks(prev => [...prev, deck]);
    setActiveDeckId(deck.id);
  };

  const deleteDeck = (id) => {
    setDecks(prev => prev.filter(d => d.id !== id));
    if (activeDeckId === id) setActiveDeckId(null);
  };

  const addCard = (front, back) => {
    setDecks(prev => prev.map(d => d.id === activeDeckId
      ? { ...d, cards: [...d.cards, { id: Date.now(), front, back }] }
      : d
    ));
  };

  const removeCard = (cardId) => {
    setDecks(prev => prev.map(d => d.id === activeDeckId
      ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
      : d
    ));
  };

  const updateCard = (cardId, front, back) => {
    setDecks(prev => prev.map(d => d.id === activeDeckId
      ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, front, back } : c) }
      : d
    ));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>Flashcards — DocHub</title></Helmet>

      {studyMode && activeDeck ? (
        <StudyView
          deck={activeDeck}
          onExit={() => setStudyMode(false)}
        />
      ) : activeDeck ? (
        <DeckView
          deck={activeDeck}
          onBack={() => setActiveDeckId(null)}
          onStudy={() => setStudyMode(true)}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          onUpdateCard={updateCard}
        />
      ) : (
        <DeckList
          decks={decks}
          onSelect={setActiveDeckId}
          onCreate={createDeck}
          onDelete={deleteDeck}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Deck List View                                                     */
/* ------------------------------------------------------------------ */
const DeckList = ({ decks, onSelect, onCreate, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="text-purple-500" size={24} />
            Flashcards
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create decks and study with flip cards</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} /> New Deck
        </button>
      </div>

      {/* Create deck modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Create New Deck</p>
            <div className="flex items-center gap-3">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Deck name, e.g. Biology Chapter 5"
                className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button onClick={handleCreate} className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"><Check size={16} /></button>
              <button onClick={() => { setShowCreate(false); setNewName(''); }} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {decks.length === 0 && !showCreate ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Layers size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No decks yet</p>
          <p className="text-sm mt-1">Create your first flashcard deck to start studying</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => (
            <motion.div
              key={deck.id}
              whileHover={{ y: -2 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onSelect(deck.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{deck.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{deck.cards.length} cards</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <BookOpen size={13} />
                {new Date(deck.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Single Deck View                                                   */
/* ------------------------------------------------------------------ */
const DeckView = ({ deck, onBack, onStudy, onAddCard, onRemoveCard, onUpdateCard }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [editId, setEditId] = useState(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  const handleAdd = () => {
    if (!front.trim() || !back.trim()) return;
    onAddCard(front.trim(), back.trim());
    setFront('');
    setBack('');
  };

  const startEdit = (card) => {
    setEditId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const saveEdit = () => {
    onUpdateCard(editId, editFront, editBack);
    setEditId(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{deck.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{deck.cards.length} cards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Plus size={15} /> Add Card
          </button>
          {deck.cards.length > 0 && (
            <button onClick={onStudy} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">
              <GraduationCap size={16} /> Study
            </button>
          )}
        </div>
      </div>

      {/* Add card form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Front (Question)</label>
                <textarea
                  value={front}
                  onChange={e => setFront(e.target.value)}
                  placeholder="What is photosynthesis?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Back (Answer)</label>
                <textarea
                  value={back}
                  onChange={e => setBack(e.target.value)}
                  placeholder="The process by which plants convert light energy..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>
            </div>
            <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">
              Add Card
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card list */}
      {deck.cards.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Sparkles size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No cards yet</p>
          <p className="text-sm mt-1">Add cards to start building this deck</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deck.cards.map((card, idx) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-4">
              <span className="text-xs text-gray-400 font-mono mt-1 w-5 shrink-0">{idx + 1}</span>
              {editId === card.id ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={editFront} onChange={e => setEditFront(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
                  <div className="flex items-center gap-2">
                    <input value={editBack} onChange={e => setEditBack(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
                    <button onClick={saveEdit} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"><Check size={15} /></button>
                    <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={15} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{card.front}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(card)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => onRemoveCard(card.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Study Mode                                                         */
/* ------------------------------------------------------------------ */
const StudyView = ({ deck, onExit }) => {
  const [cards, setCards] = useState([...deck.cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[index];

  const shuffle = useCallback(() => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
    setCorrect(0);
    setIncorrect(0);
    setDone(false);
  }, [deck.cards]);

  const next = (isCorrect) => {
    if (isCorrect) setCorrect(c => c + 1);
    else setIncorrect(c => c + 1);

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  if (done) {
    const total = correct + incorrect;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={36} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{deck.name}</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <span className="text-green-600 dark:text-green-400 font-semibold">{correct} correct</span>
            <span className="text-red-500 font-semibold">{incorrect} incorrect</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">{pct}% accuracy</span>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <button onClick={shuffle} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">
              <RotateCcw size={16} /> Study Again
            </button>
            <button onClick={onExit} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
              Back to Deck
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{deck.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Card {index + 1} of {cards.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={shuffle} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Shuffle">
            <Shuffle size={16} />
          </button>
          <button onClick={onExit} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${((index) / cards.length) * 100}%` }} />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center mb-8">
        <div
          onClick={() => setFlipped(!flipped)}
          className="relative w-full max-w-lg h-72 cursor-pointer perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-xs font-medium text-purple-500 mb-3">QUESTION</span>
              <p className="text-xl text-center text-gray-900 dark:text-white font-medium leading-relaxed">{card.front}</p>
              <span className="absolute bottom-4 text-xs text-gray-400 flex items-center gap-1">
                <FlipHorizontal size={13} /> Tap to flip
              </span>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20 shadow-xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="text-xs font-medium text-purple-500 mb-3">ANSWER</span>
              <p className="text-xl text-center text-gray-900 dark:text-white font-medium leading-relaxed">{card.back}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Answer buttons */}
      {flipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-4">
          <button onClick={() => next(false)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
            <X size={18} /> Incorrect
          </button>
          <button onClick={() => next(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-sm hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
            <Check size={18} /> Correct
          </button>
        </motion.div>
      )}

      {/* Stats footer */}
      <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400 dark:text-gray-500">
        <span><span className="text-green-500 font-semibold">{correct}</span> correct</span>
        <span><span className="text-red-500 font-semibold">{incorrect}</span> incorrect</span>
      </div>
    </>
  );
};

export default FlashcardsPage;
