import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';

interface AdSliderProps {
  slides: Slide[];
  onBannerClick: (slide: Slide) => void;
}

export const AdSlider: React.FC<AdSliderProps> = ({ slides, onBannerClick }) => {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const didSwipe = useRef(false);

  useEffect(() => {
    if (isDragging.current) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [index, slides.length]);

  const goTo = (newIndex: number) => {
    setIndex(((newIndex % slides.length) + slides.length) % slides.length);
  };

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    didSwipe.current = false;
    startX.current = clientX;
    setDragX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - startX.current;
    if (Math.abs(delta) > 8) didSwipe.current = true;
    setDragX(delta);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 60;
    if (dragX > threshold) goTo(index - 1);
    else if (dragX < -threshold) goTo(index + 1);
    setDragX(0);
  };

  const handleSlideClick = (slide: Slide) => {
    // Surish (swipe) tugagandan keyingi tasodifiy "click" hodisasini bosish sifatida hisoblamaymiz
    if (didSwipe.current) { didSwipe.current = false; return; }
    onBannerClick(slide);
  };

  return (
    <div
      className="relative h-80 md:h-96 lg:h-[440px] m-4 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] group cursor-grab active:cursor-grabbing select-none touch-pan-y"
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => isDragging.current && handleEnd()}
    >
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-sm"></div>

      {slides.map((slide, i) => {
        const offset = i - index;
        const translate = offset * 100 + (isDragging.current ? (dragX / 3) : 0);
        return (
          <div
            key={slide.id}
            onClick={() => handleSlideClick(slide)}
            style={{ transform: `translateX(${translate}%)` }}
            className={`absolute inset-0 ${isDragging.current ? '' : 'transition-transform duration-700 ease-in-out'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10"></div>
            <img
              src={slide.img}
              alt="Promotion"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
            {slide.videoUrl && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                  <i className="fas fa-play text-white text-xl ml-1"></i>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(index - 1); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(index + 1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-3 py-1.5 rounded-full glass-effect">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i); }}
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${i === index ? 'w-6 bg-[#d4af37]' : 'w-1 bg-white/30'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};
