
import React, { useState, useEffect } from 'react';
import { Slide } from '../types';

interface AdSliderProps {
  slides: Slide[];
  onBannerClick: (target: { type: 'category' | 'store'; value: string }) => void;
}

export const AdSlider: React.FC<AdSliderProps> = ({ slides, onBannerClick }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-80 m-4 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] group cursor-pointer transition-all active:scale-95">
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-sm"></div>

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          onClick={() => onBannerClick(slide.target)}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10"></div>
          <img 
            src={slide.img} 
            alt="Promotion" 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-3 py-1.5 rounded-full glass-effect">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-[#d4af37]' : 'w-1 bg-white/30'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};
