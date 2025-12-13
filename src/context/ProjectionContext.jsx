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

  const [headerFontSize, setHeaderFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('projection_header_font_size')) || 40; } catch (e) { return 40; }
  });

  const [backgroundTransparent, setBackgroundTransparent] = useState(() => {
    try { return localStorage.getItem('projection_bg_transparent') === 'true'; } catch (e) { return false; }
  });

  const [headerBackgroundEnabled, setHeaderBackgroundEnabled] = useState(() => {
    try { return localStorage.getItem('projection_header_bg_enabled') !== 'false'; } catch (e) { return true; }
  });

  const [layoutMode, setLayoutMode] = useState(() => {
    try { return localStorage.getItem('projection_layout_mode') || 'LOWER_THIRD'; } catch (e) { return 'LOWER_THIRD'; }
  });

  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem('projection_theme')) || { backgroundColor: '#00b140', textColor: '#ffffff', headerBackgroundColor: '#581c87', headerTextColor: '#ffffff' }; } catch (e) { return { backgroundColor: '#00b140', textColor: '#ffffff', headerBackgroundColor: '#581c87', headerTextColor: '#ffffff' }; }
  });

  const [textAlign, setTextAlign] = useState(() => {
    try { return localStorage.getItem('projection_text_align') || 'center'; } catch (e) { return 'center'; }
  });

  const [aspectRatio, setAspectRatio] = useState(() => {
    try { return localStorage.getItem('projection_aspect_ratio') || '16:9'; } catch (e) { return '16:9'; }
  });

  const [textTransform, setTextTransform] = useState(() => {
    try { return localStorage.getItem('projection_text_transform') || 'none'; } catch (e) { return 'none'; }
  });

  const [fontFamily, setFontFamily] = useState(() => {
    try { return localStorage.getItem('projection_font_family') || 'sans-serif'; } catch (e) { return 'sans-serif'; }
  });

  // CHANGED: Header Position is now Coordinates { x: %, y: % }
  // Default: Top Center (x: 50%, y: 6%)
  const [headerPosition, setHeaderPosition] = useState(() => {
    try {
        const saved = JSON.parse(localStorage.getItem('projection_header_position'));
        return saved || { x: 50, y: 6 };
    } catch (e) {
        return { x: 50, y: 6 };
    }
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const channelName = 'scripture_copilot';

  const createScriptureSlides = (scripture) => {
    if (!scripture.verseList) {
        let ref = scripture.reference;
        if (scripture.version && !ref.includes(`(${scripture.version})`)) ref += ` (${scripture.version})`;
        return [{ ...scripture, type: 'scripture', reference: ref }];
    }
    const VERSES_PER_SLIDE = 1;
    const chunks = [];
    const baseRef = scripture.reference.split(':')[0];
    const version = scripture.version;
    const secondaryVersion = scripture.secondaryVersion;

    for (let i = 0; i < scripture.verseList.length; i += VERSES_PER_SLIDE) {
        const primaryV = scripture.verseList[i];
        const secondaryV = scripture.secondaryVerseList ? scripture.secondaryVerseList[i] : null;
        const slideText = `${primaryV.verse} ${primaryV.text}`;
        let ref = `${baseRef}:${primaryV.verse}`;
        if (version) ref += ` (${version})`;
        if (secondaryV && secondaryVersion) ref += ` / (${secondaryVersion})`;

        chunks.push({
            type: 'scripture',
            reference: ref,
            text: slideText,
            version: version,
            secondaryText: secondaryV ? `${secondaryV.verse} ${secondaryV.text}` : null,
            secondaryVersion: secondaryVersion,
            totalSlides: Math.ceil(scripture.verseList.length / VERSES_PER_SLIDE),
            slideIndex: chunks.length + 1
        });
    }
    return chunks;
  };

  const createSongSlides = (song) => {
    const rawSlides = song.lyrics.split(/\n\n+/).filter(s => s.trim() !== '');
    return rawSlides.map((text, index) => ({
        type: 'song', reference: song.title, subHeader: song.author, text: text, totalSlides: rawSlides.length, slideIndex: index + 1
    }));
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
          if(payload.fontSize) { setFontSize(payload.fontSize); localStorage.setItem('projection_font_size', payload.fontSize); }
          if(payload.headerFontSize) { setHeaderFontSize(payload.headerFontSize); localStorage.setItem('projection_header_font_size', payload.headerFontSize); }
          if(payload.textTransform) { setTextTransform(payload.textTransform); localStorage.setItem('projection_text_transform', payload.textTransform); }
          if(payload.fontFamily) { setFontFamily(payload.fontFamily); localStorage.setItem('projection_font_family', payload.fontFamily); }
        } else if (type === 'UPDATE_LAYOUT') {
          setLayoutMode(payload.layoutMode);
          localStorage.setItem('projection_layout_mode', payload.layoutMode);
          if (payload.headerPosition) { setHeaderPosition(payload.headerPosition); localStorage.setItem('projection_header_position', JSON.stringify(payload.headerPosition)); }
        } else if (type === 'UPDATE_ALIGN') {
          setTextAlign(payload.textAlign);
          localStorage.setItem('projection_text_align', payload.textAlign);
        } else if (type === 'UPDATE_ASPECT') {
          setAspectRatio(payload.aspectRatio);
          localStorage.setItem('projection_aspect_ratio', payload.aspectRatio);
        } else if (type === 'UPDATE_THEME') {
          setTheme(payload.theme);
          localStorage.setItem('projection_theme', JSON.stringify(payload.theme));
          if (payload.backgroundTransparent !== undefined) { setBackgroundTransparent(payload.backgroundTransparent); localStorage.setItem('projection_bg_transparent', payload.backgroundTransparent); }
          if (payload.headerBackgroundEnabled !== undefined) { setHeaderBackgroundEnabled(payload.headerBackgroundEnabled); localStorage.setItem('projection_header_bg_enabled', payload.headerBackgroundEnabled); }
        }
      } catch (e) { console.warn("Storage error", e); }
    };
    return () => channel.close();
  }, []);

  const broadcast = (type, payload) => {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type, payload });
    channel.close();
  };

  const projectScripture = (scripture) => {
    const s = createScriptureSlides(scripture);
    setSlides(s); setCurrentSlideIndex(0);
    updateProjection(s[0]);
  };

  const projectSong = (song, startIndex = 0) => {
    const s = createSongSlides(song);
    setSlides(s); setCurrentSlideIndex(startIndex);
    updateProjection(s[startIndex]);
  };

  const nextSlide = () => { if (currentSlideIndex < slides.length - 1) { const i = currentSlideIndex + 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const prevSlide = () => { if (currentSlideIndex > 0) { const i = currentSlideIndex - 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const jumpToSlide = (index) => { if (index >= 0 && index < slides.length) { setCurrentSlideIndex(index); updateProjection(slides[index]); }};

  const updateProjection = (s) => { setLiveScripture(s); try { localStorage.setItem('current_scripture', JSON.stringify(s)); } catch(e){} broadcast('UPDATE_SLIDE', s); };
  const clearProjection = () => { setLiveScripture(null); setSlides([]); try { localStorage.removeItem('current_scripture'); } catch(e){} broadcast('CLEAR_SCREEN'); };
  const updateLayoutMode = (m) => { setLayoutMode(m); try { localStorage.setItem('projection_layout_mode', m); } catch(e){} broadcast('UPDATE_LAYOUT', { layoutMode: m, headerPosition }); };
  const updateTextAlign = (a) => { setTextAlign(a); try { localStorage.setItem('projection_text_align', a); } catch(e){} broadcast('UPDATE_ALIGN', { textAlign: a }); };
  const updateAspectRatio = (r) => { setAspectRatio(r); try { localStorage.setItem('projection_aspect_ratio', r); } catch(e){} broadcast('UPDATE_ASPECT', { aspectRatio: r }); };

  const updateTheme = (newThemePartial) => {
      const t = { ...theme, ...newThemePartial };
      setTheme(t);
      try { localStorage.setItem('projection_theme', JSON.stringify(t)); } catch(e){}
      broadcast('UPDATE_THEME', { theme: t, backgroundTransparent, headerBackgroundEnabled });
  };

  const toggleBackgroundTransparent = (val) => {
      setBackgroundTransparent(val);
      localStorage.setItem('projection_bg_transparent', val);
      broadcast('UPDATE_THEME', { theme, backgroundTransparent: val, headerBackgroundEnabled });
  };

  const toggleHeaderBackground = (val) => {
      setHeaderBackgroundEnabled(val);
      localStorage.setItem('projection_header_bg_enabled', val);
      broadcast('UPDATE_THEME', { theme, backgroundTransparent, headerBackgroundEnabled: val });
  };

  const updateStyle = (newStyle) => {
      if(newStyle.fontSize) { setFontSize(newStyle.fontSize); try { localStorage.setItem('projection_font_size', newStyle.fontSize); } catch(e){} }
      if(newStyle.headerFontSize) { setHeaderFontSize(newStyle.headerFontSize); try { localStorage.setItem('projection_header_font_size', newStyle.headerFontSize); } catch(e){} }
      if(newStyle.textTransform) { setTextTransform(newStyle.textTransform); try { localStorage.setItem('projection_text_transform', newStyle.textTransform); } catch(e){} }
      if(newStyle.fontFamily) { setFontFamily(newStyle.fontFamily); try { localStorage.setItem('projection_font_family', newStyle.fontFamily); } catch(e){} }
      broadcast('UPDATE_STYLE', { fontSize: newStyle.fontSize || fontSize, headerFontSize: newStyle.headerFontSize || headerFontSize, textTransform: newStyle.textTransform || textTransform, fontFamily: newStyle.fontFamily || fontFamily });
  };

  const updateHeaderPosition = (pos) => {
      setHeaderPosition(pos);
      try { localStorage.setItem('projection_header_position', JSON.stringify(pos)); } catch(e){}
      broadcast('UPDATE_LAYOUT', { layoutMode, headerPosition: pos });
  };

  const resetSettings = () => {
    updateStyle({ fontSize: 60, headerFontSize: 40, textTransform: 'none', fontFamily: 'sans-serif' });
    updateLayoutMode('LOWER_THIRD'); updateTextAlign('center'); updateAspectRatio('16:9'); updateHeaderPosition({ x: 50, y: 6 });
    toggleBackgroundTransparent(false); toggleHeaderBackground(true);
    const defaultTheme = { backgroundColor: '#00b140', textColor: '#ffffff', headerBackgroundColor: '#581c87', headerTextColor: '#ffffff' };
    setTheme(defaultTheme); try { localStorage.setItem('projection_theme', JSON.stringify(defaultTheme)); } catch(e){} broadcast('UPDATE_THEME', { theme: defaultTheme });
  };

  return (
    <ProjectionContext.Provider value={{
        liveScripture, projectScripture, projectSong, clearProjection, nextSlide, prevSlide, currentSlideIndex,
        totalSlides: slides.length, slides, jumpToSlide,
        fontSize, headerFontSize, textTransform, fontFamily, updateStyle,
        theme, updateTheme,
        layoutMode, updateLayoutMode, textAlign, updateTextAlign,
        aspectRatio, updateAspectRatio, resetSettings,
        headerPosition, updateHeaderPosition,
        backgroundTransparent, toggleBackgroundTransparent,
        headerBackgroundEnabled, toggleHeaderBackground
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};
export const useProjection = () => useContext(ProjectionContext);