import React from "react";
import "./FacebookWidget.css";

interface FacebookWidgetProps {
  profileImage?: string;
  name?: string;
  followers?: number | string;
  likes?: number | string;
  info?: string;
  link?: string;
  image?: string;
  images?: string[];
  profile?: string;
}

const FacebookWidget = ({
  profileImage = "/images/logo.webp",
  name = "Roatan Robert Tours",
  followers = "12.3k",
  likes = "8.4k",
  info = "Tours, snorkeling, and island adventures in Roatán. Contact us for private tours and group discounts.",
  link = "https://www.facebook.com/share/17UcBueTar/",
  image = "/images/fbroa.jpg",
  images = undefined,
  profile = "/images/logo.webp",
}: FacebookWidgetProps) => {
  const displayed = images && images.length > 0 ? images[0] : image;

  return (
    <div className="fb-widget" role="region" aria-label="Facebook widget">
      {/* Imagen única */}
      <div className="fb-image">
        <img src={image} alt={`${name} main`} />
      </div>

      <div className="fb-top">
        <div className="fb-avatar">
          <img src={profile} alt={`${name} profile`} />
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

      <div className="fb-body">{info}</div>

      <div className="fb-cta">
        <a href={link} target="_blank" rel="noopener noreferrer">
          Share / Visit on Facebook
        </a>
      </div>
    </div>
  );
};

export default FacebookWidget;
