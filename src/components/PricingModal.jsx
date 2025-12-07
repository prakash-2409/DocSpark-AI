import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Check,
    Crown,
    Sparkles,
    Zap,
    Shield,
    Infinity,
    Star
} from 'lucide-react';

const PricingModal = ({ isOpen, onClose, onSelectPlan }) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect for getting started',
            features: [
                'Basic text editing',
                'Export to PDF, DOCX, TXT',
                'Rich text formatting',
                'Up to 5 documents/month',
                'Community support'
            ],
            limitations: [
                'No AI features',
                'Limited exports',
                'Watermark on PDFs'
            ],
            color: 'from-gray-500 to-gray-600',
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$9.99',
            period: 'per month',
            description: 'For professionals who need AI power',
            features: [
                'Everything in Free',
                '✨ AI Auto Enhance',
                '✨ AI Simplify Text',
                '✨ AI Make Better Points',
                '✨ AI Summarize',
                '✨ AI Change Tone (6 styles)',
                '✨ AI Translate (100+ languages)',
                '✨ AI Fix Grammar & Spelling',
                '✨ AI Continue Writing',
                'Unlimited documents',
                'Unlimited exports',
                'No watermarks',
                'Priority support',
                'Advanced formatting',
                'Custom templates'
            ],
            limitations: [],
            color: 'from-purple-600 to-pink-600',
            popular: true,
            badge: 'Most Popular'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact us',
            description: 'For teams and organizations',
            features: [
                'Everything in Pro',
                'Custom AI models',
                'Team collaboration',
                'Admin dashboard',
                'SSO & SAML',
                'Dedicated support',
                'Custom integrations',
                'API access',
                'White-label options',
                'SLA guarantee'
            ],
            limitations: [],
            color: 'from-indigo-600 to-purple-600',
            popular: false
        }
    ];

    const comparisonFeatures = [
        {
            category: 'AI Features',
            items: [
                { name: 'Auto Enhance Writing', free: false, pro: true, enterprise: true },
                { name: 'Simplify Complex Text', free: false, pro: true, enterprise: true },
                { name: 'Convert to Better Points', free: false, pro: true, enterprise: true },
                { name: 'Smart Summarization', free: false, pro: true, enterprise: true },
                { name: 'Tone Adjustment (6 styles)', free: false, pro: true, enterprise: true },
                { name: 'Multi-language Translation', free: false, pro: true, enterprise: true },
                { name: 'Grammar & Spell Check', free: false, pro: true, enterprise: true },
                { name: 'AI Continue Writing', free: false, pro: true, enterprise: true },
                { name: 'Custom AI Models', free: false, pro: false, enterprise: true },
            ]
        },
        {
            category: 'Export & Documents',
            items: [
                { name: 'Documents per month', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
                { name: 'PDF Export', free: 'With watermark', pro: 'No watermark', enterprise: 'No watermark' },
                { name: 'DOCX Export', free: true, pro: true, enterprise: true },
                { name: 'TXT Export', free: true, pro: true, enterprise: true },
                { name: 'Custom Templates', free: false, pro: true, enterprise: true },
            ]
        },
        {
            category: 'Support & Collaboration',
            items: [
                { name: 'Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated' },
                { name: 'Team Collaboration', free: false, pro: false, enterprise: true },
                { name: 'API Access', free: false, pro: false, enterprise: true },
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-8 py-12 rounded-t-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6"
                                >
                                    <Crown className="text-yellow-300" size={40} />
                                </motion.div>
                                <h2 className="text-4xl font-bold text-white mb-3">
                                    Unlock AI Superpowers
                                </h2>
                                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                    Choose the perfect plan to supercharge your writing with advanced AI
                                </p>
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="px-8 py-12 bg-gray-50">
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`
                                            relative bg-white rounded-2xl shadow-lg overflow-hidden
                                            ${plan.popular ? 'ring-4 ring-purple-600 scale-105 md:scale-110 z-10' : 'hover:shadow-xl'}
                                            transition-all duration-300
                                        `}
                                    >
                                        {plan.popular && (
                                            <div className={`bg-gradient-to-r ${plan.color} px-4 py-2 text-center`}>
                                                <span className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                                                    <Star size={16} fill="currentColor" />
                                                    {plan.badge}
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                                                <div className="flex items-baseline justify-center gap-2">
                                                    <span className={`text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                                                        {plan.price}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onSelectPlan(plan.id);
                                                    onClose();
                                                }}
                                                className={`
                                                    w-full py-3 px-6 rounded-xl font-semibold transition-all mb-6
                                                    ${plan.popular
                                                        ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl`
                                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                    }
                                                `}
                                            >
                                                {plan.id === 'free' ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                                            </button>

                                            <div className="space-y-3">
                                                {plan.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-start gap-3">
                                                        <Check className={`flex-shrink-0 mt-0.5 ${feature.includes('✨') ? 'text-purple-600' : 'text-green-600'}`} size={18} />
                                                        <span className="text-gray-700 text-sm">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Feature Comparison Table */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                                    <h3 className="text-2xl font-bold text-white text-center">Detailed Feature Comparison</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">Pro</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonFeatures.map((category, catIdx) => (
                                                <React.Fragment key={catIdx}>
                                                    <tr className="bg-gray-100">
                                                        <td colSpan="4" className="px-6 py-3 text-sm font-bold text-gray-900">
                                                            {category.category}
                                                        </td>
                                                    </tr>
                                                    {category.items.map((item, itemIdx) => (
                                                        <tr key={itemIdx} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                {typeof item.free === 'boolean' ? (
                                                                    item.free ? <Check className="inline text-green-600" size={18} /> : <X className="inline text-gray-300" size={18} />
                                                                ) : (
                                                                    <span className="text-sm text-gray-600">{item.free}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center bg-purple-50">
                                                                {typeof item.pro === 'boolean' ? (
                                                                    item.pro ? <Check className="inline text-purple-600" size={18} /> : <X className="inline text-gray-300" size={18} />
                                                                ) : (
                                                                    <span className="text-sm font-semibold text-purple-600">{item.pro}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {typeof item.enterprise === 'boolean' ? (
                                                                    item.enterprise ? <Check className="inline text-green-600" size={18} /> : <X className="inline text-gray-300" size={18} />
                                                                ) : (
                                                                    <span className="text-sm text-gray-600">{item.enterprise}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { icon: Shield, label: 'Secure & Private', desc: 'Bank-level encryption' },
                                    { icon: Zap, label: 'Lightning Fast', desc: 'AI in milliseconds' },
                                    { icon: Infinity, label: 'Unlimited Usage', desc: 'No hidden limits' },
                                    { icon: Sparkles, label: 'Always Improving', desc: 'Regular AI updates' }
                                ].map((badge, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                                            <badge.icon size={24} />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.label}</h4>
                                        <p className="text-xs text-gray-600">{badge.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PricingModal;
