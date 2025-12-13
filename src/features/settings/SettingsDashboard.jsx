import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const SYSTEM_FONTS = [
  { name: 'Default Sans', value: 'sans-serif' },
  { name: 'Default Serif', value: 'serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Segoe UI (Windows)', value: '"Segoe UI", sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

const THEMES = {
  'Green Screen': { backgroundColor: '#00b140', textColor: '#ffffff' },
  'Blue Stream': { backgroundColor: '#0047b1', textColor: '#ffffff' },
  'Stage Black': { backgroundColor: '#000000', textColor: '#ffffff' },
  'Paper White': { backgroundColor: '#ffffff', textColor: '#000000' },
};

const SettingsDashboard = () => {
  const {
    fontSize, updateStyle, textTransform, fontFamily,
    layoutMode, updateLayoutMode,
    textAlign, updateTextAlign,
    aspectRatio, updateAspectRatio,
    updateTheme, resetSettings
  } = useProjection();

  const applyPreset = (presetName) => {
    const p = THEMES[presetName];
    if (p) { updateTheme('backgroundColor', p.backgroundColor); updateTheme('textColor', p.textColor); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

      {/* --- COLUMN 1: LAYOUT & DISPLAY --- */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">📺 Display Layout</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Projection Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateLayoutMode('LOWER_THIRD')}
                  className={`p-3 rounded border text-sm font-bold transition-all ${layoutMode === 'LOWER_THIRD' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  Lower Third
                </button>
                <button
                  onClick={() => updateLayoutMode('CENTER')}
                  className={`p-3 rounded border text-sm font-bold transition-all ${layoutMode === 'CENTER' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  Center Stage
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Screen Ratio</label>
              <select value={aspectRatio} onChange={(e) => updateAspectRatio(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none">
                <option value="16:9">16:9 (Standard TV/Projector)</option>
                <option value="12:5">12:5 (Ultra-Wide LED Wall)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🎨 Colors & Themes</h2>

          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys(THEMES).map(t => (
                        <button key={t} onClick={() => applyPreset(t)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded border border-slate-700 transition-colors">
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
                <button onClick={() => { if(confirm('Reset ALL settings to factory defaults?')) resetSettings(); }} className="w-full bg-red-900/20 hover:bg-red-900/50 text-red-400 border border-red-900/50 py-3 rounded font-bold transition-colors">
                    ⟳ Factory Reset All
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- COLUMN 2: TYPOGRAPHY --- */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Aa Typography</h2>

          <div className="space-y-6">

            {/* Font Family */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Font Family (System)</label>
              <select value={fontFamily} onChange={(e) => updateStyle({ fontFamily: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none font-sans">
                {SYSTEM_FONTS.map(font => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name} (Preview)
                    </option>
                ))}
              </select>
            </div>

            {/* Text Case */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Text Casing</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => updateStyle({ textTransform: 'none' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'none' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Normal</button>
                <button onClick={() => updateStyle({ textTransform: 'uppercase' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'uppercase' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>UPPER</button>
                <button onClick={() => updateStyle({ textTransform: 'lowercase' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'lowercase' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>lower</button>
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alignment</label>
              <select value={textAlign} onChange={(e) => updateTextAlign(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none">
                <option value="left">Left Align</option>
                <option value="center">Center Align</option>
                <option value="right">Right Align</option>
                <option value="justify">Justify Full</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
               <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Base Font Size</label>
                    <span className="text-xs font-mono text-purple-400">{fontSize}px</span>
               </div>
               <input
                 type="range" min="30" max="120" step="2"
                 value={fontSize}
                 onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                 className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
               />
               <p className="text-[10px] text-slate-500 mt-2">Note: Text will auto-shrink if it exceeds the screen bounds.</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsDashboard;