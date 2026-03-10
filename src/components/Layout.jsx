import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Home, Type, FileImage, Merge, Scissors, Minimize2,
  PenTool, BookOpen, Timer, GraduationCap, Quote, LayoutTemplate,
  Menu, X, ChevronDown
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: Home, label: 'Home' },
      { to: '/editor', icon: FileText, label: 'Editor' },
    ],
  },
  {
    label: 'Convert',
    items: [
      { to: '/text-to-pdf', icon: Type, label: 'Text to PDF' },
      { to: '/image-to-pdf', icon: FileImage, label: 'Image to PDF' },
      { to: '/word-to-pdf', icon: FileText, label: 'Word to PDF' },
    ],
  },
  {
    label: 'PDF Tools',
    items: [
      { to: '/pdf-merge', icon: Merge, label: 'Merge PDF' },
      { to: '/pdf-split', icon: Scissors, label: 'Split PDF' },
      { to: '/compress-pdf', icon: Minimize2, label: 'Compress PDF' },
      { to: '/edit-pdf', icon: PenTool, label: 'Edit PDF' },
    ],
  },
  {
    label: 'Study Tools',
    items: [
      { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
      { to: '/assignment-helper', icon: GraduationCap, label: 'Assignment' },
      { to: '/citations', icon: Quote, label: 'Citations' },
      { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
    ],
  },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DocHub
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navGroups.map((group) => (
                <div key={group.label} className="relative group">
                  {group.items.length === 1 ? (
                    <Link
                      to={group.items[0].to}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(group.items[0].to)
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {group.items[0].label}
                    </Link>
                  ) : (
                    <>
                      <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {group.label}
                        <ChevronDown size={14} />
                      </button>
                      <div className="absolute top-full left-0 pt-1 hidden group-hover:block">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-[180px]">
                          {group.items.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                isActive(item.to)
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <item.icon size={16} />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <button
                      onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                    >
                      {group.label}
                      <ChevronDown size={14} className={`transition-transform ${openGroup === group.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openGroup === group.label && group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive(item.to)
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
