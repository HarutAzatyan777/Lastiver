// components/Nav.jsx

import React, { useState, useRef } from "react";
import "../styles/Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const scrollRef = useRef(null);

  // Mouse Drag տրամաբանության state-եր
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // Որպեսզի drag անելիս click չլինի

  const handleScroll = (slug) => {
    if (isDragging) return; // Եթե քաշում էինք (drag), ապա click-ը արհամարհում ենք
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSlug(slug);
    }
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    setIsDragging(false);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseLeaveOrUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2; // scroll-ի արագությունը (2 անգամ ավելի արագ)
      if (Math.abs(walk) > 5) setIsDragging(true); // Նշում ենք որ քաշել է, ոչ թե ուղղակի click արել
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <nav className="qr-nav">
      <div className="qr-nav-wrapper">
        <div
          className={`qr-nav-buttons ${isDown ? "dragging" : ""}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          {categories.map(({ name, slug }) => (
            <button
              key={slug}
              onClick={() => handleScroll(slug)}
              className={`qr-nav-button ${activeSlug === slug ? "active" : ""}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
