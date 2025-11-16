import React, { useEffect, useRef, useState } from 'react';
import './FacebookWidget.css';

interface FacebookWidgetProps {
  profileImage?: string;
  name?: string;
  followers?: number | string;
  likes?: number | string;
  info?: string;
  link?: string;
  images?: string[];
  autoplayMs?: number;
}

const FacebookWidget = ({
  profileImage = '/logo.webp',
  name = 'Roatan Robert Tours',
  followers = '12.3k',
  likes = '8.4k',
  info = 'Tours, snorkeling, and island adventures in Roatán. Contact us for private tours and group discounts.',
  link = 'https://www.facebook.com/share/17UcBueTar/',
  images = [],
  autoplayMs = 4000,
}: FacebookWidgetProps) => {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  const next = () => setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  const prev = () => setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));

  useEffect(() => {
    if (!images || images.length === 0) return;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoplayMs) as unknown as number;
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [images, autoplayMs]);

  return (
    <div className="fb-widget" role="region" aria-label="Facebook widget">

      {images && images.length > 0 && (
        <div className="fb-carousel">
          <button className="fb-nav prev" aria-label="Previous image" onClick={prev}>&lsaquo;</button>
          <div className="fb-slide">
            <img src={images[index]} alt={`${name} slide ${index + 1}`} />
          </div>
          <button className="fb-nav next" aria-label="Next image" onClick={next}>&rsaquo;</button>
          <div className="fb-indicators">
            {images.map((_, i) => (
              <button
                key={i}
                className={`fb-ind ${i === index ? 'active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="fb-top">
        <div className="fb-avatar">
          <img src={profileImage} alt={`${name} profile`} />
        </div>
        <div className="fb-info">
          <div className="fb-name">{name}</div>
          <div className="fb-meta">Official page · Local business</div>
        </div>
      </div>

      <div className="fb-stats">
        <div className="fb-stat">
          <div className="num">{followers}</div>
          <div className="label">Followers</div>
        </div>
        <div className="fb-stat">
          <div className="num">{likes}</div>
          <div className="label">Likes</div>
        </div>
      </div>

      <div className="fb-body">
        {info}
      </div>

      <div className="fb-cta">
        <a href={link} target="_blank" rel="noopener noreferrer">Share / Visit on Facebook</a>
      </div>
    </div>
  );
};

export default FacebookWidget;
