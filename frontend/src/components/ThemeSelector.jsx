import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = ({ compact = false }) => {
  const { theme, setTheme, THEMES, currentThemeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-all text-xs font-semibold shadow-xs"
        title="Change Color Theme"
        aria-label="Change Color Theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs shrink-0"
          style={{ backgroundColor: currentThemeConfig.primaryHex }}
        />
        <Palette className="w-3.5 h-3.5 text-gray-500" />
        {!compact && (
          <span className="hidden lg:inline text-[11px] font-medium text-gray-600">
            {currentThemeConfig.name.split(' ')[0]}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-150 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span>Color Themes</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Live Preview
            </span>
          </div>

          {/* Theme list */}
          <div className="space-y-1.5">
            {THEMES.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-gray-50 border border-gray-250 shadow-xs'
                      : 'hover:bg-gray-50/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className="w-7 h-7 rounded-lg shadow-xs flex items-center justify-center transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${item.primaryHex}, ${item.accentHex})`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800">{item.name}</span>
                        {item.id === 'emerald' && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded">
                            Original
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-none mt-0.5">{item.tagline}</p>
                    </div>
                  </div>

                  {/* Visual Color Pill preview */}
                  <div className="flex gap-1 items-center shrink-0">
                    <span
                      className="w-2.5 h-5 rounded-full"
                      style={{ backgroundColor: item.primaryHex }}
                    />
                    <span
                      className="w-2.5 h-3 rounded-full opacity-70"
                      style={{ backgroundColor: item.accentHex }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">
              Theme automatically persists across page refreshes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
