'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface HeaderProps {
  activeUser: UserPerformance;
  onOpenExport: () => void;
  currentGoalFilter: string;
  onChangeGoalFilter: (filter: string) => void;
}

export default function Header({
  activeUser,
  onOpenExport,
  currentGoalFilter,
  onChangeGoalFilter,
}: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    if (openDropdown === menu) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menu);
    }
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const goalFilters = [
    { value: 'all', label: 'Show All WIGs' },
    { value: 'revenue', label: 'Show Revenue Goal' },
    { value: 'pipeline', label: 'Show Pipeline Goal' },
    { value: 'seats', label: 'Show Seat Goal' },
  ];

  const optionsMenu = [
    { label: 'Dashboard Preferences' },
    { label: 'Manage Metrics' },
    { label: 'Refresh Data Source' },
  ];

  const printMenu = [
    { label: 'Save Report as PDF' },
    { label: 'Export Current View' },
  ];

  return (
    <header className="flex justify-between items-center w-full px-margin-desktop py-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 z-10 flex-shrink-0 relative font-body-md">
      <div className="flex items-center space-x-8">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          Sales Performance
        </h1>
        <nav className="flex space-x-6 items-center">
          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('options')}
              className={`font-medium hover:text-primary transition-all duration-200 flex items-center group py-1 ${
                openDropdown === 'options' ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="font-body-md text-body-md">Options</span>
              <span className={`material-symbols-outlined ml-1 text-[18px] transition-transform duration-200 ${
                openDropdown === 'options' ? 'rotate-180 text-primary' : 'text-outline group-hover:translate-y-0.5'
              }`}>
                expand_more
              </span>
            </button>
            <AnimatePresence>
              {openDropdown === 'options' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-20 overflow-hidden py-1.5"
                  >
                    {optionsMenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={closeDropdowns}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-on-surface text-body-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Print Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('print')}
              className={`font-medium hover:text-primary transition-all duration-200 flex items-center group py-1 ${
                openDropdown === 'print' ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="font-body-md text-body-md">Print</span>
              <span className={`material-symbols-outlined ml-1 text-[18px] transition-transform duration-200 ${
                openDropdown === 'print' ? 'rotate-180 text-primary' : 'text-outline group-hover:translate-y-0.5'
              }`}>
                expand_more
              </span>
            </button>
            <AnimatePresence>
              {openDropdown === 'print' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-20 overflow-hidden py-1.5"
                  >
                    {printMenu.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          closeDropdowns();
                          if (idx === 0) window.print();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-on-surface text-body-sm transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Goal Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('goalFilters')}
              className="text-primary border-b-2 border-primary font-semibold py-1 flex items-center group"
            >
              <span className="font-body-md text-body-md">Goal Views</span>
              <span className={`material-symbols-outlined ml-1 text-[18px] transition-transform duration-200 ${
                openDropdown === 'goalFilters' ? 'rotate-180' : ''
              }`}>
                expand_more
              </span>
            </button>
            <AnimatePresence>
              {openDropdown === 'goalFilters' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-20 overflow-hidden py-1.5"
                  >
                    {goalFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          onChangeGoalFilter(filter.value);
                          closeDropdowns();
                        }}
                        className={`w-full text-left px-4 py-2 text-body-sm transition-colors flex items-center justify-between ${
                          currentGoalFilter === filter.value
                            ? 'bg-surface-container-low text-primary font-semibold'
                            : 'hover:bg-surface-container-low text-on-surface'
                        }`}
                      >
                        {filter.label}
                        {currentGoalFilter === filter.value && (
                          <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-3 text-on-surface-variant">
          <button className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border border-surface-container-lowest"></span>
          </button>
          <button className="hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>
        </div>
        <div className="w-px h-6 bg-outline-variant/50"></div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenExport}
          className="border border-outline-variant/60 text-on-surface font-body-md font-medium px-4 py-2 rounded-lg hover:bg-surface-container-low hover:border-primary transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Data
        </motion.button>
        <img
          className="w-9 h-9 rounded-full object-cover border-2 border-surface shadow-sm ring-1 ring-outline-variant/20 ml-2"
          alt={activeUser.name}
          src={activeUser.avatarUrl}
        />
      </div>
    </header>
  );
}
