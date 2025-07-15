// components/Nav.jsx

import React, { useState } from "react";
import "../styles/Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(null);

  const handleScroll = (slug) => {
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSlug(slug); // Set active when clicked
    }
  };

  return (
    <nav className="qr-nav">
      <div className="qr-nav-buttons">
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
    </nav>
  );
}
