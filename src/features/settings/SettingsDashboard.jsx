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

const SettingsDashboard = () => {
  const {
    fontSize, headerFontSize, updateStyle, textTransform, fontFamily,
    layoutMode, updateLayoutMode,
    textAlign, updateTextAlign,
    aspectRatio, updateAspectRatio,
    theme, updateTheme, resetSettings,
    headerPosition, updateHeaderPosition,
    backgroundTransparent, toggleBackgroundTransparent, // NEW
    headerBackgroundEnabled, toggleHeaderBackground // NEW
  } = useProjection();

  const renderPosBtn = (pos, label) => (
      <button
        onClick={() => updateHeaderPosition(pos)}
        className={`h-10 rounded border transition-all text-[10px] font-bold uppercase
            ${headerPosition === pos ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
        `}
      >
        {label}
      </button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto h-full overflow-y-auto pb-20 custom-scrollbar">

      {/* --- COLUMN 1: LAYOUT & COLORS --- */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">📺 Display Layout</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Projection Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateLayoutMode('LOWER_THIRD')} className={`p-3 rounded border text-sm font-bold transition-all ${layoutMode === 'LOWER_THIRD' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>Lower Third</button>
                <button onClick={() => updateLayoutMode('CENTER')} className={`p-3 rounded border text-sm font-bold transition-all ${layoutMode === 'CENTER' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>Center Stage</button>
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title / Reference Position</label>
                <div className="grid grid-cols-3 gap-2">
                    {renderPosBtn('TOP_LEFT', 'Top L')}
                    {renderPosBtn('TOP_CENTER', 'Top C')}
                    {renderPosBtn('TOP_RIGHT', 'Top R')}
                    {renderPosBtn('BOTTOM_LEFT', 'Bot L')}
                    {renderPosBtn('BOTTOM_CENTER', 'Bot C')}
                    {renderPosBtn('BOTTOM_RIGHT', 'Bot R')}
                </div>
            </div>

            {layoutMode !== 'LOWER_THIRD' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Screen Ratio</label>
                <select value={aspectRatio} onChange={(e) => updateAspectRatio(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none">
                    <option value="16:9">16:9 (Standard TV/Projector)</option>
                    <option value="12:5">12:5 (Ultra-Wide LED Wall)</option>
                </select>
                </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🎨 Custom Colors</h2>
          <div className="space-y-6">

            {/* TITLE / HEADER BOX COLOR SETTINGS */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Title / Header Box</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-500">Background</span>
                            {/* SHOW BOX TOGGLE */}
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={headerBackgroundEnabled}
                                    onChange={(e) => toggleHeaderBackground(e.target.checked)}
                                    className="w-3 h-3 accent-purple-500 rounded cursor-pointer"
                                />
                                <span className={`text-[9px] font-bold ${headerBackgroundEnabled ? 'text-green-400' : 'text-slate-600'}`}>
                                    {headerBackgroundEnabled ? 'ON' : 'OFF'}
                                </span>
                            </label>
                        </div>
                        <div className={`flex items-center gap-2 bg-slate-950 p-2 rounded border ${headerBackgroundEnabled ? 'border-slate-700' : 'border-slate-800 opacity-50'}`}>
                            <input
                                type="color"
                                value={theme.headerBackgroundColor || '#581c87'}
                                onChange={(e) => updateTheme({ headerBackgroundColor: e.target.value })}
                                disabled={!headerBackgroundEnabled}
                                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-xs font-mono">{theme.headerBackgroundColor}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 mb-1 block">Text Color</span>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-700">
                            <input type="color" value={theme.headerTextColor || '#ffffff'} onChange={(e) => updateTheme({ headerTextColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                            <span className="text-xs font-mono">{theme.headerTextColor}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY / SCRIPTURE COLOR SETTINGS */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Lyrics / Scripture Body</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-500">Background</span>
                            {/* TRANSPARENT TOGGLE */}
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={backgroundTransparent}
                                    onChange={(e) => toggleBackgroundTransparent(e.target.checked)}
                                    className="w-3 h-3 accent-purple-500 rounded cursor-pointer"
                                />
                                <span className={`text-[9px] font-bold ${backgroundTransparent ? 'text-green-400' : 'text-slate-600'}`}>
                                    Transparent
                                </span>
                            </label>
                        </div>
                        <div className={`flex items-center gap-2 bg-slate-950 p-2 rounded border ${backgroundTransparent ? 'border-slate-800 opacity-50' : 'border-slate-700'}`}>
                            <input
                                type="color"
                                value={theme.backgroundColor || '#0f172a'}
                                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                                disabled={backgroundTransparent}
                                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-xs font-mono">{backgroundTransparent ? 'None' : theme.backgroundColor}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 mb-1 block">Text Color</span>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-700">
                            <input type="color" value={theme.textColor || '#ffffff'} onChange={(e) => updateTheme({ textColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                            <span className="text-xs font-mono">{theme.textColor}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
                <button onClick={() => { if(confirm('Reset ALL settings to factory defaults?')) resetSettings(); }} className="w-full bg-red-900/20 hover:bg-red-900/50 text-red-400 border border-red-900/50 py-3 rounded font-bold transition-colors">⟳ Factory Reset All</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- COLUMN 2: TYPOGRAPHY --- */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Aa Typography</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Font Family</label>
              <select value={fontFamily} onChange={(e) => updateStyle({ fontFamily: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none font-sans">
                {SYSTEM_FONTS.map(font => ( <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option> ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Text Casing</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => updateStyle({ textTransform: 'none' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'none' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Normal</button>
                <button onClick={() => updateStyle({ textTransform: 'uppercase' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'uppercase' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>UPPER</button>
                <button onClick={() => updateStyle({ textTransform: 'lowercase' })} className={`py-2 rounded border text-xs font-bold ${textTransform === 'lowercase' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>lower</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alignment</label>
              <select value={textAlign} onChange={(e) => updateTextAlign(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 outline-none">
                <option value="left">Left Align</option><option value="center">Center Align</option><option value="right">Right Align</option><option value="justify">Justify Full</option>
              </select>
            </div>

            {/* HEADER FONT SIZE SLIDER */}
            <div>
               <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Header Font Size</label>
                    <span className="text-xs font-mono text-purple-400">{headerFontSize}px</span>
               </div>
               <input type="range" min="20" max="100" step="2" value={headerFontSize} onChange={(e) => updateStyle({ headerFontSize: parseInt(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>

            {/* BODY FONT SIZE SLIDER */}
            <div>
               <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Body Font Size</label>
                    <span className="text-xs font-mono text-purple-400">{fontSize}px</span>
               </div>
               <input type="range" min="30" max="120" step="2" value={fontSize} onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
               <p className="text-[10px] text-slate-500 mt-2">Note: Text will auto-shrink if it exceeds the screen bounds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;