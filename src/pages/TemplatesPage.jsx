import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { LayoutTemplate, Search, ArrowRight, Sparkles } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/templates';
import { saveFile } from '../lib/storage';

/**
 * TemplatesPage — browse and use pre-built document templates.
 * Organised by category: School, College, Professional, Professor.
 * Clicking a template creates a new document and opens it in the editor.
 */
const TemplatesPage = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(null); // templateId being created

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUseTemplate = async (template) => {
    setLoading(template.id);
    try {
      const doc = await saveFile({
        name: template.title,
        type: 'template',
        htmlContent: template.htmlContent.trim(),
        rawData: new Uint8Array(),
        size: new Blob([template.htmlContent]).size,
      });
      onNavigate('editor', doc.id);
    } catch (err) {
      console.error('Failed to create from template:', err);
    } finally {
      setLoading(null);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'school': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'college': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'professional': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'professor': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Templates — DocHub</title>
        <meta name="description" content="Ready-made document templates for students, teachers, and professionals. Assignments, resumes, lab reports, and more." />
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <LayoutTemplate className="text-white" size={22} />
          </div>
          Templates
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Start with a professionally structured template — just fill in the blanks.
        </p>
      </div>

      {/* Search + Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <LayoutTemplate size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No templates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
              onClick={() => handleUseTemplate(template)}
            >
              {/* Icon + Category */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{template.icon}</span>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {template.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Use button */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                {loading === template.id ? (
                  <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Use template</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Every template is editable</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400/80">
              Templates create a new document that you can fully customise. Change headings, add sections, use the formatting toolbar — it's your document. Everything stays local on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
