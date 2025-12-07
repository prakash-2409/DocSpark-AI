import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIService from '../services/aiService';
import {
    Sparkles,
    Wand2,
    ListChecks,
    FileText,
    RefreshCw,
    Languages,
    CheckCircle2,
    PenLine,
    Palette,
    Zap,
    Crown,
    X,
    Loader2
} from 'lucide-react';

const AIToolbar = ({ editor, isPaidUser, onUpgradeClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showToneMenu, setShowToneMenu] = useState(false);
    const [selectedText, setSelectedText] = useState('');

    // Check if text is selected
    const hasSelection = editor && !editor.state.selection.empty;

    const aiActions = [
        {
            id: 'enhance',
            label: 'Auto Enhance',
            icon: Sparkles,
            color: 'from-purple-500 to-pink-500',
            description: 'Improve writing quality & clarity',
            premium: true
        },
        {
            id: 'simplify',
            label: 'Simplify',
            icon: Wand2,
            color: 'from-blue-500 to-cyan-500',
            description: 'Make text easier to understand',
            premium: true
        },
        {
            id: 'points',
            label: 'Make Better Points',
            icon: ListChecks,
            color: 'from-green-500 to-emerald-500',
            description: 'Convert to clear bullet points',
            premium: true
        },
        {
            id: 'summarize',
            label: 'Summarize',
            icon: FileText,
            color: 'from-orange-500 to-red-500',
            description: 'Create concise summary',
            premium: true
        },
        {
            id: 'rewrite',
            label: 'Change Tone',
            icon: Palette,
            color: 'from-indigo-500 to-purple-500',
            description: 'Professional, casual, academic...',
            premium: true,
            hasSubmenu: true
        },
        {
            id: 'translate',
            label: 'Translate',
            icon: Languages,
            color: 'from-pink-500 to-rose-500',
            description: 'Translate to any language',
            premium: true
        },
        {
            id: 'grammar',
            label: 'Fix Grammar',
            icon: CheckCircle2,
            color: 'from-teal-500 to-green-500',
            description: 'Correct grammar & spelling',
            premium: true
        },
        {
            id: 'continue',
            label: 'Continue Writing',
            icon: PenLine,
            color: 'from-yellow-500 to-orange-500',
            description: 'AI continues your text',
            premium: true
        }
    ];

    const toneOptions = [
        { id: 'professional', label: 'Professional', emoji: '💼' },
        { id: 'casual', label: 'Casual', emoji: '😊' },
        { id: 'academic', label: 'Academic', emoji: '🎓' },
        { id: 'creative', label: 'Creative', emoji: '🎨' },
        { id: 'persuasive', label: 'Persuasive', emoji: '🎯' },
        { id: 'friendly', label: 'Friendly', emoji: '🤝' },
    ];

    const handleAIAction = async (actionId, tone = null) => {
        if (!isPaidUser) {
            onUpgradeClick();
            return;
        }

        if (!editor) return;

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');

        if (!text.trim()) {
            alert('Please select some text first!');
            return;
        }

        setIsProcessing(true);
        setSelectedText(text);

        try {
            let result;

            // Call actual AI service
            switch (actionId) {
                case 'enhance':
                    result = await AIService.enhanceText(text);
                    break;
                case 'simplify':
                    result = await AIService.simplifyText(text);
                    break;
                case 'points':
                    result = await AIService.convertToPoints(text);
                    break;
                case 'summarize':
                    result = await AIService.summarizeText(text);
                    break;
                case 'rewrite':
                    result = await AIService.rewriteWithTone(text, tone);
                    break;
                case 'grammar':
                    result = await AIService.fixGrammar(text);
                    break;
                case 'continue':
                    result = await AIService.continueWriting(text);
                    break;
                case 'translate':
                    // You can add a language selector here
                    const targetLang = prompt('Enter target language (e.g., Spanish, French, German):');
                    if (targetLang) {
                        result = await AIService.translateText(text, targetLang);
                    } else {
                        setIsProcessing(false);
                        return;
                    }
                    break;
                default:
                    result = text;
            }

            // Replace selected text with AI result
            editor.chain().focus().deleteSelection().insertContent(result).run();

            setIsOpen(false);
            setShowToneMenu(false);
        } catch (error) {
            console.error('AI processing failed:', error);
            alert('AI processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative">
            {/* AI Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium
                    bg-gradient-to-r from-purple-600 to-pink-600 text-white
                    shadow-lg shadow-purple-600/30 transition-all
                    ${!hasSelection ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-purple-600/50'}
                `}
                disabled={!hasSelection}
                title={!hasSelection ? 'Select text to use AI features' : 'AI Tools'}
            >
                <Sparkles size={18} className="animate-pulse" />
                <span>AI Tools</span>
                {!isPaidUser && <Crown size={16} className="text-yellow-300" />}
            </motion.button>

            {/* AI Actions Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <Zap size={20} />
                                <span className="font-semibold">AI Magic Tools</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Actions Grid */}
                        <div className="p-2 max-h-96 overflow-y-auto">
                            {aiActions.map((action) => (
                                <div key={action.id}>
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        onClick={() => {
                                            if (action.hasSubmenu) {
                                                setShowToneMenu(!showToneMenu);
                                            } else {
                                                handleAIAction(action.id);
                                            }
                                        }}
                                        className="w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left group relative overflow-hidden"
                                    >
                                        <div className="flex items-start gap-3 relative z-10">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                                                <action.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{action.label}</span>
                                                    {!isPaidUser && (
                                                        <Crown size={14} className="text-yellow-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                                            </div>
                                        </div>
                                        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                    </motion.button>

                                    {/* Tone Submenu */}
                                    {action.hasSubmenu && showToneMenu && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-4 pl-4 border-l-2 border-purple-200 space-y-1 mb-2"
                                        >
                                            {toneOptions.map((tone) => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => handleAIAction('rewrite', tone.label)}
                                                    className="w-full px-3 py-2 rounded-lg hover:bg-purple-50 text-left text-sm transition-colors flex items-center gap-2"
                                                >
                                                    <span>{tone.emoji}</span>
                                                    <span className="text-gray-700">{tone.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Upgrade CTA for Free Users */}
                        {!isPaidUser && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
                                <button
                                    onClick={onUpgradeClick}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Crown size={18} />
                                    Upgrade to Premium
                                </button>
                                <p className="text-xs text-center text-gray-600 mt-2">
                                    Unlock all AI features for $9.99/month
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Loader2 className="animate-spin text-purple-600" size={48} />
                                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-600 animate-pulse" size={24} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI is working its magic...</h3>
                                    <p className="text-gray-600 text-sm">Processing your text with advanced AI</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIToolbar;
