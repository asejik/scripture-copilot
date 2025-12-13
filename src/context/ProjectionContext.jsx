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

  // UPDATED: Theme now has 4 colors (Header vs Body)
  const [theme, setTheme] = useState(() => {
    try {
        return JSON.parse(localStorage.getItem('projection_theme')) || {
            backgroundColor: '#0f172a', // Slate 900
            textColor: '#ffffff',
            headerBackgroundColor: '#581c87', // Purple 900
            headerTextColor: '#ffffff'
        };
    } catch (e) {
        return {
            backgroundColor: '#0f172a',
            textColor: '#ffffff',
            headerBackgroundColor: '#581c87',
            headerTextColor: '#ffffff'
        };
    }
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
        type: 'song',
        reference: song.title,
        subHeader: song.author,
        text: text,
        totalSlides: rawSlides.length,
        slideIndex: index + 1
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
          setFontSize(payload.fontSize);
          localStorage.setItem('projection_font_size', payload.fontSize);
          if(payload.textTransform) { setTextTransform(payload.textTransform); localStorage.setItem('projection_text_transform', payload.textTransform); }
          if(payload.fontFamily) { setFontFamily(payload.fontFamily); localStorage.setItem('projection_font_family', payload.fontFamily); }
        } else if (type === 'UPDATE_LAYOUT') {
          setLayoutMode(payload.layoutMode);
          localStorage.setItem('projection_layout_mode', payload.layoutMode);
        } else if (type === 'UPDATE_ALIGN') {
          setTextAlign(payload.textAlign);
          localStorage.setItem('projection_text_align', payload.textAlign);
        } else if (type === 'UPDATE_ASPECT') {
          setAspectRatio(payload.aspectRatio);
          localStorage.setItem('projection_aspect_ratio', payload.aspectRatio);
        } else if (type === 'UPDATE_THEME') {
          setTheme(payload.theme);
          localStorage.setItem('projection_theme', JSON.stringify(payload.theme));
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
    setSlides(s);
    setCurrentSlideIndex(startIndex);
    updateProjection(s[startIndex]);
  };

  const nextSlide = () => { if (currentSlideIndex < slides.length - 1) { const i = currentSlideIndex + 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const prevSlide = () => { if (currentSlideIndex > 0) { const i = currentSlideIndex - 1; setCurrentSlideIndex(i); updateProjection(slides[i]); }};
  const jumpToSlide = (index) => { if (index >= 0 && index < slides.length) { setCurrentSlideIndex(index); updateProjection(slides[index]); }};

  const updateProjection = (s) => { setLiveScripture(s); try { localStorage.setItem('current_scripture', JSON.stringify(s)); } catch(e){} broadcast('UPDATE_SLIDE', s); };
  const clearProjection = () => { setLiveScripture(null); setSlides([]); try { localStorage.removeItem('current_scripture'); } catch(e){} broadcast('CLEAR_SCREEN'); };
  const updateLayoutMode = (m) => { setLayoutMode(m); try { localStorage.setItem('projection_layout_mode', m); } catch(e){} broadcast('UPDATE_LAYOUT', { layoutMode: m }); };
  const updateTextAlign = (a) => { setTextAlign(a); try { localStorage.setItem('projection_text_align', a); } catch(e){} broadcast('UPDATE_ALIGN', { textAlign: a }); };
  const updateAspectRatio = (r) => { setAspectRatio(r); try { localStorage.setItem('projection_aspect_ratio', r); } catch(e){} broadcast('UPDATE_ASPECT', { aspectRatio: r }); };

  // Update Theme now handles 4 values
  const updateTheme = (newThemePartial) => {
      const t = { ...theme, ...newThemePartial };
      setTheme(t);
      try { localStorage.setItem('projection_theme', JSON.stringify(t)); } catch(e){}
      broadcast('UPDATE_THEME', { theme: t });
  };

  const updateStyle = (newStyle) => {
      if(newStyle.fontSize) { setFontSize(newStyle.fontSize); try { localStorage.setItem('projection_font_size', newStyle.fontSize); } catch(e){} }
      if(newStyle.textTransform) { setTextTransform(newStyle.textTransform); try { localStorage.setItem('projection_text_transform', newStyle.textTransform); } catch(e){} }
      if(newStyle.fontFamily) { setFontFamily(newStyle.fontFamily); try { localStorage.setItem('projection_font_family', newStyle.fontFamily); } catch(e){} }

      broadcast('UPDATE_STYLE', {
          fontSize: newStyle.fontSize || fontSize,
          textTransform: newStyle.textTransform || textTransform,
          fontFamily: newStyle.fontFamily || fontFamily
      });
  };

  const resetSettings = () => {
    updateStyle({ fontSize: 60, textTransform: 'none', fontFamily: 'sans-serif' });
    updateLayoutMode('LOWER_THIRD');
    updateTextAlign('center');
    updateAspectRatio('16:9');
    const defaultTheme = { backgroundColor: '#0f172a', textColor: '#ffffff', headerBackgroundColor: '#581c87', headerTextColor: '#ffffff' };
    setTheme(defaultTheme); try { localStorage.setItem('projection_theme', JSON.stringify(defaultTheme)); } catch(e){} broadcast('UPDATE_THEME', { theme: defaultTheme });
  };

  return (
    <ProjectionContext.Provider value={{
        liveScripture, projectScripture, projectSong, clearProjection, nextSlide, prevSlide, currentSlideIndex,
        totalSlides: slides.length, slides, jumpToSlide,
        fontSize, textTransform, fontFamily, updateStyle,
        theme, updateTheme,
        layoutMode, updateLayoutMode, textAlign, updateTextAlign,
        aspectRatio, updateAspectRatio, resetSettings
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};
export const useProjection = () => useContext(ProjectionContext);