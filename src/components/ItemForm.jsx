import React from "react";
import { FaTimes, FaPlus, FaCheck, FaSpinner } from "react-icons/fa";

export default function ItemForm({
  menu,
  selectedCatId,
  setSelectedCatId,
  itemNameHy,
  setItemNameHy,
  itemNameEn,
  setItemNameEn,
  itemNameRu,
  setItemNameRu,
  itemPrice,
  setItemPrice,
  imageUrl,
  setImageUrl,
  addItem,
  editingItem,
  editItem,
  cancelItemEdit, // ✅ Նոր prop
  handleFileUpload,
  isUploading,
}) {
  const content = (
    <>
      <h3>{editingItem ? "Խմբագրել կետը" : "Ավելացնել նոր կետ"}</h3>
      <select
        value={selectedCatId}
        onChange={(e) => setSelectedCatId(e.target.value)}
      >
        <option value="">Ընտրել բաժինը</option>
        {menu.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.category}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Name (English)"
        value={itemNameEn}
        onChange={(e) => setItemNameEn(e.target.value)}
      />
      <input
        type="text"
        placeholder="Անուն (Հայերեն)"
        value={itemNameHy}
        onChange={(e) => setItemNameHy(e.target.value)}
      />
      <input
        type="text"
        placeholder="Имя (Русский)"
        value={itemNameRu}
        onChange={(e) => setItemNameRu(e.target.value)}
      />
      <input
        type="number"
        placeholder="Գին (AMD)"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
      />
      <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px", marginTop: "10px" }}>
        <strong>🍔 Ապրանքի Նկար:</strong> Փոքր նկար ապրանքի անվան կողքին (1:1)
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Նկար URL (կամ վերբեռնեք աջից 👉)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ flex: 1, margin: 0 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, setImageUrl, "items", 1)} // 1:1 Item
          disabled={isUploading}
        />
        {imageUrl && (
          <div style={{ position: "relative", display: "flex" }}>
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "white",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                boxShadow: "0 0 3px rgba(0,0,0,0.5)",
                padding: "2px",
                fontSize: "10px",
              }}
              title="Ջնջել նկարը"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {editingItem ? (
        <>
          <button
            onClick={editItem}
            disabled={isUploading}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            {isUploading ? <FaSpinner /> : <FaCheck />} Պահպանել
          </button>
          <button
            onClick={cancelItemEdit}
            style={{
              marginLeft: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaTimes /> Չեղարկել
          </button>
        </>
      ) : (
        <button
          onClick={addItem}
          disabled={isUploading}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
        >
          {isUploading ? (
            <>
              <FaSpinner /> Վերբեռնվում է...
            </>
          ) : (
            <>
              <FaPlus /> Ավելացնել
            </>
          )}
        </button>
      )}
    </>
  );

  if (editingItem) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return <div style={{ marginBottom: 20 }}>{content}</div>;
}
