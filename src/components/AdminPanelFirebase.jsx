import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminPanelFirebase.css";

const menuRef = collection(db, "menu");

// ActionButton with click listener for both left and right click
const ActionButton = ({ onAction, children, ...props }) => {
  const btnRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handler = (e) => {
      e.preventDefault();
      onAction();
    };

    btn.addEventListener("click", handler);
    btn.addEventListener("contextmenu", handler);

    return () => {
      btn.removeEventListener("click", handler);
      btn.removeEventListener("contextmenu", handler);
    };
  }, [onAction]);

  return (
    <button ref={btnRef} {...props}>
      {children}
    </button>
  );
};

export default function AdminPanelFirebase() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState(""); // ✅ Նոր
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const loadMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setMenu(data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const addCategory = async () => {
    if (!category) return;
    const highestOrder = menu.reduce(
      (max, sec) => Math.max(max, sec.order ?? 0),
      0
    );
    await addDoc(menuRef, {
      category,
      imageUrl: categoryImageUrl, // ✅ Պահիր նկարը
      items: [],
      order: highestOrder + 1,
    });
    setCategory("");
    setCategoryImageUrl(""); // ✅ Մաքրի input-ը
    loadMenu();
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.category);
  };

  const editCategory = async () => {
    if (!editingCategory || !editingCategoryName) return;
    const ref = doc(db, "menu", editingCategory.id);
    await updateDoc(ref, { category: editingCategoryName });
    setEditingCategory(null);
    setEditingCategoryName("");
    loadMenu();
  };

  const deleteCategory = async (id) => {
    await deleteDoc(doc(db, "menu", id));
    loadMenu();
  };

  const moveCategoryUp = async (index) => {
    if (index === 0) return;
    const current = menu[index];
    const prev = menu[index - 1];
    const currentRef = doc(db, "menu", current.id);
    const prevRef = doc(db, "menu", prev.id);
    await Promise.all([
      updateDoc(currentRef, { order: prev.order }),
      updateDoc(prevRef, { order: current.order }),
    ]);
    loadMenu();
  };

  const moveCategoryDown = async (index) => {
    if (index === menu.length - 1) return;
    const current = menu[index];
    const next = menu[index + 1];
    const currentRef = doc(db, "menu", current.id);
    const nextRef = doc(db, "menu", next.id);
    await Promise.all([
      updateDoc(currentRef, { order: next.order }),
      updateDoc(nextRef, { order: current.order }),
    ]);
    loadMenu();
  };

  const addItem = async () => {
    if (!itemName || !itemPrice || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    await updateDoc(ref, {
      items: arrayUnion({
        name: itemName,
        price: itemPrice,
        imageUrl: imageUrl,
      }),
    });
    setItemName("");
    setItemPrice("");
    setImageUrl("");
    loadMenu();
  };

  const startEditingItem = (catId, item) => {
    setSelectedCatId(catId);
    setItemName(item.name);
    setItemPrice(item.price);
    setImageUrl(item.imageUrl || "");
    setEditingItem({ original: item });
  };

  const editItem = async () => {
    if (!editingItem || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    const updatedItems = menu
      .find((cat) => cat.id === selectedCatId)
      .items.map((item) =>
        item === editingItem.original
          ? {
              name: itemName,
              price: itemPrice,
              imageUrl: imageUrl,
            }
          : item
      );
    await updateDoc(ref, { items: updatedItems });
    setEditingItem(null);
    setItemName("");
    setItemPrice("");
    setImageUrl("");
    loadMenu();
  };

  const deleteItem = async (catId, item) => {
    const ref = doc(db, "menu", catId);
    await updateDoc(ref, {
      items: arrayRemove(item),
    });
    loadMenu();
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <input
        placeholder="Նոր բաժին (օր. Սուրճ)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        placeholder="Բաժնի նկարի հղում (օր. Imgur)"
        value={categoryImageUrl}
        onChange={(e) => setCategoryImageUrl(e.target.value)}
      />

      <ActionButton onAction={addCategory}>➕ Ավելացնել Բաժին</ActionButton>

      {editingCategory && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ color: "red" }}>
            Խմբագրում ես բաժինը: <strong>{editingCategory.category}</strong>
          </p>
          <input
            placeholder="Նոր անուն բաժնի համար"
            value={editingCategoryName}
            onChange={(e) => setEditingCategoryName(e.target.value)}
          />
          <ActionButton onAction={editCategory}>✔ Թարմացնել բաժինը</ActionButton>
          <ActionButton
            onAction={() => {
              setEditingCategory(null);
              setEditingCategoryName("");
            }}
          >
            ❌ Չեղարկել
          </ActionButton>
        </div>
      )}

      <hr />

      {editingItem && (
        <div>
          <p style={{ color: "red" }}>Խմբագրման ռեժիմում ես!</p>
          <ActionButton
            onAction={() => {
              setEditingItem(null);
              setItemName("");
              setItemPrice("");
              setImageUrl("");
            }}
          >
            ❌ Չեղարկել խմբագրումը
          </ActionButton>
        </div>
      )}

      <select
        value={selectedCatId}
        onChange={(e) => setSelectedCatId(e.target.value)}
      >
        <option value="">Ընտրիր բաժինը</option>
        {menu.map((sec) => (
          <option key={sec.id} value={sec.id}>
            {sec.category}
          </option>
        ))}
      </select>

      <input
        placeholder="Անուն"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <input
        placeholder="Գին"
        type="number"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
      />
      <input
        placeholder="Կետի նկարի հղում (Imgur URL)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {editingItem ? (
        <ActionButton onAction={editItem}>✔ Թարմացնել Կետը</ActionButton>
      ) : (
        <ActionButton onAction={addItem}>➕ Ավելացնել Կետ</ActionButton>
      )}

      <hr />

      {menu.map((sec, index) => (
        <div key={sec.id}>
          {sec.imageUrl && (
            <img
              src={sec.imageUrl}
              alt={sec.category}
              style={{
                width: "150px",
                height: "auto",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            />
          )}
          <h3>
            {sec.category}{" "}
            <span className="reorder-buttons">
              <ActionButton
                onAction={() => moveCategoryUp(index)}
                disabled={index === 0}
                title="Վեր բարձրացնել"
              >
                ⬆
              </ActionButton>
              <ActionButton
                onAction={() => moveCategoryDown(index)}
                disabled={index === menu.length - 1}
                title="Նստեցնել ներքև"
              >
                ⬇
              </ActionButton>
            </span>
            <ActionButton
              onAction={() => startEditingCategory(sec)}
              title="Խմբագրել բաժինը"
            >
              ✏️
            </ActionButton>
            <ActionButton
              onAction={() => deleteCategory(sec.id)}
              title="Ջնջել"
            >
              ❌
            </ActionButton>
          </h3>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {sec.items?.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                )}
                <span>
                  {item.name} - {item.price} ֏
                </span>
                <ActionButton
                  onAction={() => startEditingItem(sec.id, item)}
                  title="Խմբագրել կետը"
                >
                  ✏️
                </ActionButton>
                <ActionButton
                  onAction={() => deleteItem(sec.id, item)}
                  title="Ջնջել կետը"
                >
                  🗑
                </ActionButton>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
