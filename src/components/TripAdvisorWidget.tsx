import React, { useEffect, useRef, useState } from "react";
import "./TripAdvisorWidget.css";

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
  reviewsApiEndpoint?: string;
}

const TripAdvisorWidget: React.FC<TripWidgetProps> = ({
  images = [],
  title = "Roatán Paradise Tour",
  location = "Roatán, Honduras",
  rating = 4.8,
  ratingCount = 123,
  views = "1.2k",
  ctaText = "TripAdvisor",
  ctaHref = "https://www.tripadvisor.com/Attraction_Review-g292019-d19846218-Reviews-Roatan_Robert_Tour-Roatan_Bay_Islands.html",
  autoPlay = true,
  autoPlayInterval = 4000,
  reviewsApiEndpoint = "/reviews",
}) => {
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const length = Math.max(1, images.length || 1);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Elfsight platform script once for the embedded reviews widget
  useEffect(() => {
    const src = "https://elfsightcdn.com/platform.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
    return () => {
      // keep the script (other pages/components may reuse it)
    };
  }, []);

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
        timer.current = window.setInterval(
          () => setIndex((i) => (i + 1) % length),
          autoPlayInterval
        );
      }
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, autoPlayInterval, length]);

  // Fetch reviews count on mount (light request)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = `${reviewsApiEndpoint}?url=${encodeURIComponent(
          ctaHref
        )}&max=1`;
        const res = await fetch(url);
        if (!mounted) return;
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (json && typeof json.count === "number") {
          setReviewsCount(json.count);
        } else if (Array.isArray(json.reviews)) {
          setReviewsCount(json.reviews.length);
        }
      } catch (err) {
        // ignore, leave views as fallback
        // console.warn('Error fetching reviews count', err);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaHref, reviewsApiEndpoint]);

  return (
    <div className="trip-widget" role="region" aria-label="TripAdvisor widget">
      <div className="carousel-container" ref={containerRef}>
        <div
          className="carousel"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {(images.length > 0
            ? images.filter((_, i) => i === 0 || i === 2)
            : ["/logo.webp"]
          ).map((src, i) => (
            <div key={i} className="carousel-slide">
              <img src={src} alt={`${title} ${i + 1}`} />
            </div>
          ))}
        </div>

        {length > 1 && (
          <>
            <button
              aria-label="Previous"
              className="carousel-btn prev-btn"
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              aria-label="Next"
              className="carousel-btn next-btn"
              onClick={goNext}
            >
              ›
            </button>

            <div className="carousel-indicators" aria-hidden>
              {Array.from({ length }).map((_, i) => (
                <div
                  key={i}
                  className={`indicator ${i === index ? "active" : ""}`}
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
            {Array.from({ length: Math.round(rating) }).map((_, i) => "★")}
          </div>
          <div className="rating-count">
            {rating.toFixed(1)} · {ratingCount}
          </div>
        </div>

        {/* Title, location, views and CTA removed — Elfsight plugin used below */}

        {/* Elfsight Reviews plugin */}
        {/* <!-- Elfsight Reviews from Tripadvisor | Untitled Reviews from Tripadvisor --> */}
        <div
          className="elfsight-app-dc958993-071e-4065-a102-962b1d4c9869 mt-4"
          data-elfsight-app-lazy
        />
      </div>
      {/* Reviews Modal */}
      {modalOpen && (
        <div className="ta-modal" role="dialog" aria-modal="true">
          <div
            className="ta-modal-backdrop"
            onClick={() => setModalOpen(false)}
          />
          <div className="ta-modal-content">
            <div className="ta-modal-header">
              <h3>TripAdvisor Reviews</h3>
              <button
                className="ta-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="ta-modal-body">
              {reviewsLoading && <div>Loading reviews…</div>}
              {!reviewsLoading && !reviews && (
                <div className="text-muted">No reviews available.</div>
              )}
              {!reviewsLoading && reviews && reviews.length > 0 && (
                <ul className="ta-reviews-list">
                  {reviews.map((r, i) => (
                    <li key={i} className="ta-review">
                      <div className="ta-review-head">
                        <strong>{r.title || r.author || "Review"}</strong>
                        <span className="ta-review-meta">
                          {r.rating ? `${r.rating} ★` : ""}{" "}
                          {r.date ? `• ${r.date}` : ""}
                        </span>
                      </div>
                      {r.text && <p className="ta-review-text">{r.text}</p>}
                      <div className="ta-review-author">{r.author}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripAdvisorWidget;
