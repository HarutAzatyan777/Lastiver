// components/Nav.jsx

import React, { useState, useRef, useEffect } from "react";
import "../styles/Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const scrollRef = useRef(null);
  const isClickScrolling = useRef(false); // Սքրոլի ժամանակ (կոճակով) խուսափելու համար ավելորդ ցատկերից

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

  // Հետևում ենք, թե որ բաժնում ենք գտնվում (Scroll Spy)
  useEffect(() => {
    if (categories.length === 0) return;

    const observerOptions = {
      root: null,
      // Թողնում ենք 120px վերևից (որ sticky նավիգացիան չխանգարի) և 60% ներքևից
      rootMargin: "-120px 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      if (isClickScrolling.current) return; // Եթե սեղմել ենք կոճակը, սպասում ենք հասնի տեղ

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentSlug = entry.target.id;
          setActiveSlug(currentSlug);
          scrollToActiveNavButton(currentSlug);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToActiveNavButton = (slug) => {
    if (!scrollRef.current) return;
    const button = scrollRef.current.querySelector(`[data-slug="${slug}"]`);
    if (button) {
      const container = scrollRef.current;
      // Հաշվարկում ենք այնպես, որ կոճակը հայտնվի կենտրոնում
      const scrollLeft =
        button.offsetLeft -
        container.offsetLeft -
        container.clientWidth / 2 +
        button.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  const handleScroll = (slug) => {
    if (isDragging) return; // Եթե քաշում էինք (drag), ապա click-ը արհամարհում ենք
    const section = document.getElementById(slug);
    if (section) {
      isClickScrolling.current = true;
      setActiveSlug(slug);
      scrollToActiveNavButton(slug);
      section.scrollIntoView({ behavior: "smooth" });

      // 1 վայրկյանից հանում ենք բլոկը (երբ smooth scroll-ը ավարտվի)
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 1000);
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
              data-slug={slug}
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
