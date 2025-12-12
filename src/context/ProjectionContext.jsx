import React, { createContext, useState, useEffect, useContext } from 'react';

const ProjectionContext = createContext();

export const ProjectionProvider = ({ children }) => {
  // 1. Load Saved Data
  const [liveScripture, setLiveScripture] = useState(() => {
    try { return JSON.parse(localStorage.getItem('current_scripture')); } catch (e) { return null; }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('projection_font_size')) || 60; } catch (e) { return 60; }
  });
  const [layoutMode, setLayoutMode] = useState(() => {
    try { return localStorage.getItem('projection_layout_mode') || 'LOWER_THIRD'; } catch (e) { return 'LOWER_THIRD'; }
  });
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem('projection_theme')) || { backgroundColor: '#00b140', textColor: '#ffffff' }; } catch (e) { return { backgroundColor: '#00b140', textColor: '#ffffff' }; }
  });
  const [textAlign, setTextAlign] = useState(() => {
    try { return localStorage.getItem('projection_text_align') || 'center'; } catch (e) { return 'center'; }
  });
  const [aspectRatio, setAspectRatio] = useState(() => {
    try { return localStorage.getItem('projection_aspect_ratio') || '16:9'; } catch (e) { return '16:9'; }
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const channelName = 'scripture_copilot';

  const createSlides = (scripture) => {
    if (!scripture.verseList) {
        let ref = scripture.reference;
        if (scripture.version && !ref.includes(`(${scripture.version})`)) {
            ref += ` (${scripture.version})`;
        }
        return [{ ...scripture, reference: ref }];
    }
    const VERSES_PER_SLIDE = 2;
    const chunks = [];
    const baseRef = scripture.reference.split(':')[0];
    const version = scripture.version;

    for (let i = 0; i < scripture.verseList.length; i += VERSES_PER_SLIDE) {
        const chunk = scripture.verseList.slice(i, i + VERSES_PER_SLIDE);
        const slideText = chunk.map(v => `${v.verse} ${v.text}`).join(' ');
        const startV = chunk[0].verse;
        const endV = chunk[chunk.length - 1].verse;
        let ref = `${baseRef}:${startV}${startV !== endV ? '-' + endV : ''}`;
        if (version) ref += ` (${version})`;

        chunks.push({
            reference: ref, text: slideText, version: version,
            totalSlides: Math.ceil(scripture.verseList.length / VERSES_PER_SLIDE),
            slideIndex: chunks.length + 1
        });
    }
    return chunks;
  };

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      try {
        if (type === 'UPDATE_SLIDE') {
          setLiveScripture(payload);
          localStorage.setItem('current_scripture', JSON.stringify(payload));
        } else if (type === 'CLEAR_SCREEN') {
          setLiveScripture(null);
          localStorage.removeItem('current_scripture');
        } else if (type === 'UPDATE_STYLE') {
          setFontSize(payload.fontSize);
          localStorage.setItem('projection_font_size', payload.fontSize);
        } else if (type === 'UPDATE_THEME') {
          setTheme(payload.theme);
          localStorage.setItem('projection_theme', JSON.stringify(payload.theme));
        } else if (type === 'UPDATE_LAYOUT') {
          setLayoutMode(payload.layoutMode);
          localStorage.setItem('projection_layout_mode', payload.layoutMode);
        } else if (type === 'UPDATE_ALIGN') {
          setTextAlign(payload.textAlign);
          localStorage.setItem('projection_text_align', payload.textAlign);
        } else if (type === 'UPDATE_ASPECT') {
          setAspectRatio(payload.aspectRatio);
          localStorage.setItem('projection_aspect_ratio', payload.aspectRatio);
        }
      } catch (e) { console.warn("Storage error", e); }
    };
    return () => channel.close();
  }, []);

  // --- ACTIONS ---
  const broadcast = (type, payload) => {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type, payload });
    channel.close();
  };

  const projectScripture = (scripture) => {
    const s = createSlides(scripture);
    setSlides(s); setCurrentSlideIndex(0);
    setLiveScripture(s[0]);
    try { localStorage.setItem('current_scripture', JSON.stringify(s[0])); } catch(e){}
    broadcast('UPDATE_SLIDE', s[0]);
  };
  const nextSlide = () => { if (currentSlideIndex < slides.length - 1) { const i = currentSlideIndex + 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const prevSlide = () => { if (currentSlideIndex > 0) { const i = currentSlideIndex - 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const updateProjection = (s) => { setLiveScripture(s); try { localStorage.setItem('current_scripture', JSON.stringify(s)); } catch(e){} broadcast('UPDATE_SLIDE', s); };
  const clearProjection = () => { setLiveScripture(null); setSlides([]); try { localStorage.removeItem('current_scripture'); } catch(e){} broadcast('CLEAR_SCREEN'); };
  const updateFontSize = (s) => { setFontSize(s); try { localStorage.setItem('projection_font_size', s); } catch(e){} broadcast('UPDATE_STYLE', { fontSize: s }); };
  const updateTheme = (k, v) => { const t = { ...theme, [k]: v }; setTheme(t); try { localStorage.setItem('projection_theme', JSON.stringify(t)); } catch(e){} broadcast('UPDATE_THEME', { theme: t }); };
  const updateLayoutMode = (m) => { setLayoutMode(m); try { localStorage.setItem('projection_layout_mode', m); } catch(e){} broadcast('UPDATE_LAYOUT', { layoutMode: m }); };
  const updateTextAlign = (a) => { setTextAlign(a); try { localStorage.setItem('projection_text_align', a); } catch(e){} broadcast('UPDATE_ALIGN', { textAlign: a }); };
  const updateAspectRatio = (r) => { setAspectRatio(r); try { localStorage.setItem('projection_aspect_ratio', r); } catch(e){} broadcast('UPDATE_ASPECT', { aspectRatio: r }); };

  // NEW: Factory Reset Action
  const resetSettings = () => {
    // 1. Reset Values
    updateFontSize(60);
    updateLayoutMode('LOWER_THIRD');
    updateTextAlign('center');
    updateAspectRatio('16:9');

    // 2. Reset Theme manually since updateTheme takes key/value
    const defaultTheme = { backgroundColor: '#00b140', textColor: '#ffffff' };
    setTheme(defaultTheme);
    try { localStorage.setItem('projection_theme', JSON.stringify(defaultTheme)); } catch(e){}
    broadcast('UPDATE_THEME', { theme: defaultTheme });
  };

  return (
    <ProjectionContext.Provider value={{
        liveScripture, projectScripture, clearProjection, nextSlide, prevSlide, currentSlideIndex,
        totalSlides: slides.length, fontSize, updateFontSize, theme, updateTheme,
        layoutMode, updateLayoutMode, textAlign, updateTextAlign,
        aspectRatio, updateAspectRatio,
        resetSettings // Export Reset
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};
export const useProjection = () => useContext(ProjectionContext);