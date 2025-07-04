import { useState } from "react";

export default function ImageUrlFinder() {
  const [url, setUrl] = useState("");
  const [valid, setValid] = useState(null);

  const checkImage = () => {
    const img = new Image();
    img.onload = () => setValid(true);
    img.onerror = () => setValid(false);
    img.src = url;
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>🖼️ Image URL Finder</h3>
      <input
        type="text"
        placeholder="Ներմուծիր նկարի հղումը"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          border: "1px solid #aaa",
          borderRadius: "4px",
        }}
      />
      <button onClick={checkImage} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        Ստուգել
      </button>

      {valid === true && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ color: "green" }}>✔️ Նկարը բեռնվում է</p>
          <img src={url} alt="Preview" style={{ width: "200px", borderRadius: "6px" }} />
        </div>
      )}
      {valid === false && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ Չհաջողվեց բեռնել նկարը</p>
      )}
    </div>
  );
}
