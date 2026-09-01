import React, { useState, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import { Flame, Play, ExternalLink, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { BannerSlide, MatchCategoryKey } from '../types';
import { formatTelegramUrl, openExternalUrl } from '../utils/urlHelper';

interface HeroBannerSliderProps {
  banners: BannerSlide[];
  telegramLink?: string;
  onSelectCategory: (categoryId: MatchCategoryKey) => void;
  onOpenShop: () => void;
  onOpenWallet?: () => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  banners = [],
  telegramLink,
  onSelectCategory,
  onOpenShop,
  onOpenWallet,
}) => {
  // Only display active banners
  const activeBanners = banners.filter((b) => b.active !== false);
  const displayList = activeBanners.length > 0 ? activeBanners : banners;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  // Touch / Drag swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto slide timer
  useEffect(() => {
    if (displayList.length <= 1 || isPaused || isDragging) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [displayList.length, isPaused, isDragging]);

  // Handle slide index bounds
  useEffect(() => {
    if (currentIndex >= displayList.length) {
      setCurrentIndex(0);
    }
  }, [displayList.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
    setDragOffset(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEndX(currentX);
    setDragOffset(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      const minSwipeDistance = 45;

      if (distance > minSwipeDistance) {
        // Swiped Left -> Next
        handleNext();
      } else if (distance < -minSwipeDistance) {
        // Swiped Right -> Prev
        handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setDragOffset(0);
  };

  // Mouse drag handlers for desktop / Chrome
  const handleMouseDown = (e: MouseEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    setTouchStartX(e.clientX);
    setTouchEndX(null);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const currentX = e.clientX;
    setTouchEndX(currentX);
    setDragOffset(currentX - touchStartX);
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      const minSwipeDistance = 45;

      if (distance > minSwipeDistance) {
        handleNext();
      } else if (distance < -minSwipeDistance) {
        handlePrev();
      }
    }
    setIsDragging(false);
    setIsPaused(false);
    setTouchStartX(null);
    setTouchEndX(null);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPaused(false);
      setTouchStartX(null);
      setTouchEndX(null);
      setDragOffset(0);
    }
  };

  // Banner action click handler
  const handleSlideClick = (slide: BannerSlide) => {
    // If it was a swipe/drag, don't trigger click action
    if (Math.abs(dragOffset) > 10) return;

    if (slide.type === 'video') {
      if (slide.videoEmbedUrl || (slide.mediaUrl && slide.mediaUrl.includes('youtu'))) {
        const embedUrl = getEmbedUrl(slide.videoEmbedUrl || slide.mediaUrl || '');
        if (embedUrl) {
          setActiveVideoModal(embedUrl);
          return;
        }
      }
    }

    switch (slide.actionType) {
      case 'telegram': {
        const url = formatTelegramUrl(slide.actionUrl || telegramLink || localStorage.getItem('admin_telegram_link'));
        openExternalUrl(url);
        break;
      }
      case 'shop':
        onOpenShop();
        break;
      case 'category':
        if (slide.actionCategory) {
          onSelectCategory(slide.actionCategory);
        } else {
          onSelectCategory('clash_squad');
        }
        break;
      case 'wallet':
        if (onOpenWallet) onOpenWallet();
        break;
      case 'external_link':
        if (slide.actionUrl) {
          openExternalUrl(slide.actionUrl);
        }
        break;
      default:
        // Default action based on title keywords
        if (slide.title.toLowerCase().includes('top-up') || slide.title.toLowerCase().includes('diamond')) {
          onOpenShop();
        } else if (slide.title.toLowerCase().includes('telegram') || slide.title.toLowerCase().includes('giveaway')) {
          const url = formatTelegramUrl(telegramLink || localStorage.getItem('admin_telegram_link'));
          openExternalUrl(url);
        } else {
          onSelectCategory('clash_squad');
        }
        break;
    }
  };

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    
    // YouTube watch URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  if (displayList.length === 0) return null;

  return (
    <div className="relative w-full select-none" id="hero-banner-slider">
      {/* Slider Viewport Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-amber-500/30 bg-slate-950 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {/* Slides Track */}
        <div
          className={`flex w-full transition-transform ease-out ${
            isDragging ? 'duration-75' : 'duration-500'
          }`}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {displayList.map((slide, idx) => {
            const isVideo = slide.type === 'video';
            const isImage = slide.type === 'image' && slide.mediaUrl;

            return (
              <div
                key={slide.id || idx}
                onClick={() => handleSlideClick(slide)}
                className={`w-full shrink-0 min-h-[140px] sm:min-h-[155px] relative flex flex-col justify-between p-3.5 text-white ${
                  slide.bgGradient
                    ? `bg-gradient-to-r ${slide.bgGradient}`
                    : 'bg-gradient-to-r from-[#1e0a00] via-[#2a1205] to-[#0d0400]'
                }`}
              >
                {/* Background Image / Poster if type === 'image' */}
                {isImage && (
                  <>
                    <img
                      src={slide.mediaUrl}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/40 z-0 pointer-events-none" />
                  </>
                )}

                {/* Subtle radial lighting overlay for styled banners */}
                {!isImage && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black pointer-events-none z-0" />
                )}

                {/* Slide Content Header */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-sm font-orbitron font-black text-[10px] tracking-wider transform -rotate-1 shadow-sm shrink-0">
                    <Flame className="w-3 h-3 text-red-700 fill-red-700 animate-pulse" />
                    <span>{slide.tag || slide.title || 'BD ESPORTS'}</span>
                  </div>

                  {/* Payment & Social Badges or Video Indicator */}
                  {isVideo ? (
                    <div className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm backdrop-blur-xs">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>VIDEO</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/10 shrink-0">
                      <span className="w-4 h-4 rounded-full bg-[#e2136e] text-white text-[8px] font-bold flex items-center justify-center" title="bKash">
                        b
                      </span>
                      <span className="w-4 h-4 rounded-full bg-[#8c3494] text-white text-[8px] font-bold flex items-center justify-center" title="Rocket">
                        R
                      </span>
                      <span className="w-4 h-4 rounded-full bg-[#f7941d] text-white text-[8px] font-bold flex items-center justify-center" title="Nagad">
                        N
                      </span>
                      <span className="w-4 h-4 rounded-full bg-[#229ed9] text-white text-[8px] font-bold flex items-center justify-center" title="Telegram">
                        ✈️
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle Content */}
                <div className="relative z-10 my-1.5 flex items-center gap-3">
                  {/* Team Logo Badge or Video Play Button */}
                  {isVideo ? (
                    <div className="w-12 h-12 shrink-0 rounded-full bg-red-600/30 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center group-hover:scale-105 transition">
                      <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border border-amber-300/40">
                        <img
                          src="/team_logo.png"
                          alt="BD ESPORTS MS"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-orbitron font-extrabold text-xs sm:text-sm text-white tracking-wide truncate drop-shadow-sm">
                      {slide.title}
                    </h4>
                    <p className="font-bengali text-xs sm:text-sm font-bold text-yellow-300 leading-snug line-clamp-2 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Row Action Tag */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-300 font-bold font-rajdhani flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Swipe or tap to explore</span>
                  </span>
                  {slide.actionText && (
                    <div className="flex items-center gap-1 bg-amber-400/90 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-orbitron shadow-xs transition">
                      <span>{slide.actionText}</span>
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Left & Right Navigation Tap Arrows */}
        {displayList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 opacity-60 hover:opacity-100 transition z-20 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 opacity-60 hover:opacity-100 transition z-20 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Dot Indicators */}
      {displayList.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {displayList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="font-orbitron font-bold text-xs text-white">
                  BD ESPORTS VIDEO PLAYER
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={activeVideoModal}
                title="Tournament Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
