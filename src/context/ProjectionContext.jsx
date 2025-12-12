import React, { createContext, useState, useEffect, useContext } from 'react';

const ProjectionContext = createContext();

export const ProjectionProvider = ({ children }) => {
  // 1. Load Saved Scriptures
  const [liveScripture, setLiveScripture] = useState(() => {
    try {
      const saved = localStorage.getItem('current_scripture');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  // 2. Load Saved Font Size
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('projection_font_size');
      return saved ? parseInt(saved) : 60;
    } catch (e) { return 60; }
  });

  // 3. Load Saved Layout Mode
  const [layoutMode, setLayoutMode] = useState(() => {
    try {
      return localStorage.getItem('projection_layout_mode') || 'LOWER_THIRD';
    } catch (e) { return 'LOWER_THIRD'; }
  });

  // 4. Load Saved Theme
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('projection_theme');
      return saved ? JSON.parse(saved) : { backgroundColor: '#00b140', textColor: '#ffffff' };
    } catch (e) { return { backgroundColor: '#00b140', textColor: '#ffffff' }; }
  });

  // 5. NEW: Load Saved Alignment
  const [textAlign, setTextAlign] = useState(() => {
    try {
      return localStorage.getItem('projection_text_align') || 'center';
    } catch (e) { return 'center'; }
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
            reference: ref,
            text: slideText,
            version: version,
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
          // NEW: Handle Alignment
          setTextAlign(payload.textAlign);
          localStorage.setItem('projection_text_align', payload.textAlign);
        }
      } catch (e) {
        console.warn("Storage access blocked/failed", e);
      }
    };
    return () => channel.close();
  }, []);

  // --- ACTIONS ---

  const projectScripture = (scripture) => {
    const generatedSlides = createSlides(scripture);
    setSlides(generatedSlides);
    setCurrentSlideIndex(0);
    updateProjection(generatedSlides[0]);
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
        const newIndex = currentSlideIndex + 1;
        setCurrentSlideIndex(newIndex);
        updateProjection(slides[newIndex]);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
        const newIndex = currentSlideIndex - 1;
        setCurrentSlideIndex(newIndex);
        updateProjection(slides[newIndex]);
    }
  };

  const updateProjection = (slideData) => {
    setLiveScripture(slideData);
    try {
      localStorage.setItem('current_scripture', JSON.stringify(slideData));
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_SLIDE', payload: slideData });
    channel.close();
  };

  const clearProjection = () => {
    setLiveScripture(null);
    setSlides([]);
    setCurrentSlideIndex(0);
    try {
      localStorage.removeItem('current_scripture');
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'CLEAR_SCREEN' });
    channel.close();
  };

  const updateFontSize = (newSize) => {
    setFontSize(newSize);
    try {
      localStorage.setItem('projection_font_size', newSize);
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_STYLE', payload: { fontSize: newSize } });
    channel.close();
  };

  const updateTheme = (key, value) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    try {
      localStorage.setItem('projection_theme', JSON.stringify(newTheme));
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_THEME', payload: { theme: newTheme } });
    channel.close();
  };

  const updateLayoutMode = (mode) => {
    setLayoutMode(mode);
    try {
      localStorage.setItem('projection_layout_mode', mode);
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_LAYOUT', payload: { layoutMode: mode } });
    channel.close();
  };

  // NEW: Update Alignment Action
  const updateTextAlign = (align) => {
    setTextAlign(align);
    try {
      localStorage.setItem('projection_text_align', align);
    } catch(e) {}

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_ALIGN', payload: { textAlign: align } });
    channel.close();
  };

  return (
    <ProjectionContext.Provider value={{
        liveScripture, projectScripture, clearProjection, nextSlide, prevSlide, currentSlideIndex,
        totalSlides: slides.length,
        fontSize, updateFontSize,
        theme, updateTheme,
        layoutMode, updateLayoutMode,
        textAlign, updateTextAlign // Export Alignment
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjection = () => useContext(ProjectionContext);