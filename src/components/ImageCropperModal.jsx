import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropperModal({ src, aspect, onCropConfirm, onCancel }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const getCroppedImg = async () => {
    const image = imgRef.current;
    let finalCrop = completedCrop;

    // Եթե ոչ մի շարժում չի արվել
    if (!finalCrop) {
      if (!aspect) {
        finalCrop = { x: 0, y: 0, width: image.width, height: image.height };
      } else {
        alert("Խնդրում ենք մի փոքր շարժել կտրվող հատվածը ճշգրիտ չափն ընտրելու համար։");
        return null;
      }
    }

    if (!finalCrop || finalCrop.width <= 0 || finalCrop.height <= 0) return null;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = finalCrop.width;
    canvas.height = finalCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      finalCrop.x * scaleX,
      finalCrop.y * scaleY,
      finalCrop.width * scaleX,
      finalCrop.height * scaleY,
      0,
      0,
      finalCrop.width,
      finalCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleConfirm = async () => {
    const blob = await getCroppedImg();
    if (blob) {
      onCropConfirm(blob);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "95vw", maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
        <h3 style={{ marginTop: 0 }}>✂️ Կտրել նկարը մինչև վերբեռնելը</h3>
        <div style={{ overflow: "auto", flex: 1, minHeight: "300px", minWidth: "300px", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" }}>
          <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
            <img ref={imgRef} src={src} alt="Crop me" onLoad={onImageLoad} style={{ maxHeight: "60vh", maxWidth: "100%" }} />
          </ReactCrop>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", cursor: "pointer", background: "#ccc", border: "none", borderRadius: "4px" }}>Չեղարկել</button>
          <button onClick={handleConfirm} style={{ padding: "8px 16px", background: "#4CAF50", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}>
            ✔ Հաստատել և Վերբեռնել
          </button>
        </div>
      </div>
    </div>
  );
}