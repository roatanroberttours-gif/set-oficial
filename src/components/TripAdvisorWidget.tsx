import React, { useEffect, useRef, useState } from 'react';
import './TripAdvisorWidget.css';

interface TripWidgetProps {
  images?: string[];
  title?: string;
  location?: string;
  rating?: number; // 0-5
  ratingCount?: number;
  views?: number | string;
  ctaText?: string;
  ctaHref?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const TripAdvisorWidget: React.FC<TripWidgetProps> = ({
  images = [],
  title = 'Roatán Paradise Tour',
  location = 'Roatán, Honduras',
  rating = 4.8,
  ratingCount = 123,
  views = '1.2k',
  ctaText = 'Book now',
  ctaHref = '#',
  autoPlay = true,
  autoPlayInterval = 4000,
}) => {
  const [index, setIndex] = useState(0);
  const length = Math.max(1, images.length || 1);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    stopTimer();
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, autoPlayInterval);
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, autoPlay, autoPlayInterval]);

  const stopTimer = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };

  const goPrev = () => setIndex((i) => (i - 1 + length) % length);
  const goNext = () => setIndex((i) => (i + 1) % length);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => stopTimer();
    const onLeave = () => {
      if (autoPlay) {
        timer.current = window.setInterval(() => setIndex((i) => (i + 1) % length), autoPlayInterval);
      }
    };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, autoPlayInterval, length]);

  return (
    <div className="trip-widget" role="region" aria-label="TripAdvisor widget">
      <div className="carousel-container" ref={containerRef}>
        <div className="carousel" style={{ transform: `translateX(-${index * 100}%)` }}>
          {(images.length > 0 ? images : ['/logo.webp']).map((src, i) => (
            <div key={i} className="carousel-slide">
              <img src={src} alt={`${title} ${i + 1}`} />
            </div>
          ))}
        </div>

        {length > 1 && (
          <>
            <button aria-label="Previous" className="carousel-btn prev-btn" onClick={goPrev}>‹</button>
            <button aria-label="Next" className="carousel-btn next-btn" onClick={goNext}>›</button>

            <div className="carousel-indicators" aria-hidden>
              {Array.from({ length }).map((_, i) => (
                <div
                  key={i}
                  className={`indicator ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="content">
        <div className="header">
          <div className="stars" aria-hidden>
            {Array.from({ length: Math.round(rating) }).map((_, i) => '★')}
          </div>
          <div className="rating-count">{rating.toFixed(1)} · {ratingCount}</div>
        </div>

        <h4 className="title">{title}</h4>
        <div className="location">📍 {location}</div>
        <div className="views">👁️ {views} views</div>

        <a className="cta-btn" href={ctaHref}>{ctaText}</a>
      </div>
    </div>
  );
};

export default TripAdvisorWidget;
