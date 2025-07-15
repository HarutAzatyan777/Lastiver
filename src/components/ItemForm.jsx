import React from "react";

export default function ItemForm({
  menu,
  selectedCatId,
  setSelectedCatId,
  itemNameHy,
  setItemNameHy,
  itemNameEn,
  setItemNameEn,
  itemPrice,
  setItemPrice,
  imageUrl,
  setImageUrl,
  addItem,
  editingItem,
  editItem,
  cancelItemEdit, // ✅ Նոր prop
}) {
  return (
    <div style={{ marginBottom: 20 }}>
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
        placeholder="Անուն (Հայերեն)"
        value={itemNameHy}
        onChange={(e) => setItemNameHy(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name (English)"
        value={itemNameEn}
        onChange={(e) => setItemNameEn(e.target.value)}
      />
      <input
        type="number"
        placeholder="Գին (AMD)"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Նկար URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {editingItem ? (
        <>
          <button onClick={editItem}>✔ Պահպանել</button>
          <button onClick={cancelItemEdit} style={{ marginLeft: "8px" }}>
            ❌ Չեղարկել
          </button>
        </>
      ) : (
        <button onClick={addItem}>➕ Ավելացնել</button>
      )}
    </div>
  );
}
