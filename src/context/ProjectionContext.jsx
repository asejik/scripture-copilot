import React, { createContext, useState, useEffect, useContext } from 'react';

const ProjectionContext = createContext();

export const ProjectionProvider = ({ children }) => {
  const [liveScripture, setLiveScripture] = useState(() => {
    const saved = localStorage.getItem('current_scripture');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const channelName = 'scripture_copilot';

  // Helper: Chunk verses into groups of 2
  const createSlides = (scripture) => {
    if (!scripture.verseList) {
        // Single verse case: Ensure reference has version
        let ref = scripture.reference;
        if (scripture.version && !ref.includes(`(${scripture.version})`)) {
            ref += ` (${scripture.version})`;
        }
        return [{ ...scripture, reference: ref }];
    }

    const VERSES_PER_SLIDE = 2;
    const chunks = [];

    // Get base reference (e.g. "John 3") and version
    const baseRef = scripture.reference.split(':')[0];
    const version = scripture.version;

    for (let i = 0; i < scripture.verseList.length; i += VERSES_PER_SLIDE) {
        const chunk = scripture.verseList.slice(i, i + VERSES_PER_SLIDE);

        const slideText = chunk.map(v => `${v.verse} ${v.text}`).join(' ');

        const startV = chunk[0].verse;
        const endV = chunk[chunk.length - 1].verse;

        // Rebuild reference and append version
        let ref = `${baseRef}:${startV}${startV !== endV ? '-' + endV : ''}`;
        if (version) {
            ref += ` (${version})`;
        }

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
      if (event.data.type === 'UPDATE_SLIDE') {
        setLiveScripture(event.data.payload);
        localStorage.setItem('current_scripture', JSON.stringify(event.data.payload));
      } else if (event.data.type === 'CLEAR_SCREEN') {
        setLiveScripture(null);
        localStorage.removeItem('current_scripture');
      }
    };
    return () => channel.close();
  }, []);

  const projectScripture = (scripture) => {
    const generatedSlides = createSlides(scripture);
    setSlides(generatedSlides);
    setCurrentSlideIndex(0);
    const firstSlide = generatedSlides[0];
    updateProjection(firstSlide);
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

  return (
    <ProjectionContext.Provider value={{
        liveScripture,
        projectScripture,
        clearProjection,
        nextSlide,
        prevSlide,
        currentSlideIndex,
        totalSlides: slides.length
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjection = () => useContext(ProjectionContext);