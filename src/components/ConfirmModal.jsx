import React from "react";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <p>{message}</p>
        <button onClick={onConfirm} style={{ marginRight: 10 }}>
          Այո
        </button>
        <button onClick={onCancel}>Ոչ</button>
      </div>
    </div>
  );
}
