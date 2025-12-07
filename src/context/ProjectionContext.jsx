import React, { createContext, useState, useEffect, useContext } from 'react';

const ProjectionContext = createContext();

export const ProjectionProvider = ({ children }) => {
  // 1. Load Saved State
  const [liveScripture, setLiveScripture] = useState(() => {
    const saved = localStorage.getItem('current_scripture');
    return saved ? JSON.parse(saved) : null;
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('projection_font_size');
    return saved ? parseInt(saved) : 60;
  });

  // NEW: Theme State (Background & Text Color)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('projection_theme');
    return saved ? JSON.parse(saved) : { backgroundColor: '#00b140', textColor: '#ffffff' };
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const channelName = 'scripture_copilot';

  // Helper: Chunk verses
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
        // NEW: Handle Theme Updates
        setTheme(payload.theme);
        localStorage.setItem('projection_theme', JSON.stringify(payload.theme));
      }
    };
    return () => channel.close();
  }, []);

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
    localStorage.setItem('current_scripture', JSON.stringify(slideData));
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_SLIDE', payload: slideData });
    channel.close();
  };

  const clearProjection = () => {
    setLiveScripture(null);
    setSlides([]);
    setCurrentSlideIndex(0);
    localStorage.removeItem('current_scripture');
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'CLEAR_SCREEN' });
    channel.close();
  };

  const updateFontSize = (newSize) => {
    setFontSize(newSize);
    localStorage.setItem('projection_font_size', newSize);
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_STYLE', payload: { fontSize: newSize } });
    channel.close();
  };

  // NEW: Update Theme Action
  const updateTheme = (key, value) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    localStorage.setItem('projection_theme', JSON.stringify(newTheme));
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: 'UPDATE_THEME', payload: { theme: newTheme } });
    channel.close();
  };

  return (
    <ProjectionContext.Provider value={{
        liveScripture,
        projectScripture,
        clearProjection,
        nextSlide,
        prevSlide,
        currentSlideIndex,
        totalSlides: slides.length,
        fontSize,
        updateFontSize,
        theme,          // Export Theme
        updateTheme     // Export Action
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjection = () => useContext(ProjectionContext);