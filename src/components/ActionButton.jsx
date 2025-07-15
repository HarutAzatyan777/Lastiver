import React from "react";

export default function ActionButton({ onAction, disabled, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onAction}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        margin: "0 3px",
      }}
    >
      {children}
    </button>
  );
}
