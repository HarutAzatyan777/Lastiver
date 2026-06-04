// components/Nav.jsx

import React, { useState, useRef, useEffect } from "react";
import "../styles/Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const scrollRef = useRef(null);

  // Mouse Drag տրամաբանության state-եր
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // Որպեսզի drag անելիս click չլինի
  const [isSticky, setIsSticky] = useState(false);

  // Հետևում ենք scroll-ին, որպեսզի մենյուն դարձնենք ֆիքսված վերևում
  useEffect(() => {
    const handleScrollEvent = () => {
      setIsSticky(window.scrollY > 200); // 200px-ից հետո դառնում է sticky
    };
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

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
    <nav className={`qr-nav ${isSticky ? "sticky" : ""}`}>
      <div className="qr-nav-wrapper">
        <div
          className={`qr-nav-buttons ${isDown ? "dragging" : ""}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          {categories.map(({ name, slug, iconUrl }) => (
            <button
              key={slug}
              onClick={() => handleScroll(slug)}
              className={`qr-nav-button ${activeSlug === slug ? "active" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={name}
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                    pointerEvents: "none", // Կանխում է նկարը քաշելիս խանգարելը
                  }}
                />
              )}
              <span className="nav-item-text" style={{ pointerEvents: "none" }}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
