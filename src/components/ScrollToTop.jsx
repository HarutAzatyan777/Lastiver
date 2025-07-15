// components/ScrollToTop.jsx

import { useState, useEffect } from "react";
import "../styles/ScrollToTop.css";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  // Հետևում ենք scroll-ին
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      className="scroll-to-top"
      onClick={scrollToTop}
      aria-label="Վերադառնալ վերև"
    >
      ↑
    </button>
  );
}
