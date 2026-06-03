import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import CategoryForm from "./CategoryForm";
import ItemForm from "./ItemForm";
import ConfirmModal from "./ConfirmModal";
import ActionButton from "./ActionButton";
import ImageCropperModal from "./ImageCropperModal";
import "../styles/AdminPanelFirebase.css";
import {
  FaChevronRight,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaFileImport,
  FaSpinner,
} from "react-icons/fa";

const menuRef = collection(db, "menu");

export default function AdminPanelFirebase() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [categoryIconUrl, setCategoryIconUrl] = useState("");
  const [categoryItemsBgUrl, setCategoryItemsBgUrl] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryNameEn, setEditingCategoryNameEn] = useState("");
  const [editingCategoryIconUrl, setEditingCategoryIconUrl] = useState("");
  const [editingCategoryItemsBgUrl, setEditingCategoryItemsBgUrl] = useState("");

  const [selectedCatId, setSelectedCatId] = useState("");
  const [itemNameHy, setItemNameHy] = useState("");
  const [itemNameEn, setItemNameEn] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    type: null,
    payload: null,
  });

  const [draggedCatIdx, setDraggedCatIdx] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedCats, setExpandedCats] = useState({}); // Պահում է բացված բաժինների վիճակը
  const [cropData, setCropData] = useState(null); // Նկարի կտրման տվյալներ

  const loadMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setMenu(data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (editingCategory || editingItem) {
      document.body.style.overflow = "hidden"; // Սառեցնում է ֆոնի scroll-ը
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [editingCategory, editingItem]);

  // -- Category --
  const addCategory = async () => {
    if (!category) return;
    const highestOrder = menu.reduce(
      (max, sec) => Math.max(max, sec.order ?? 0),
      0,
    );
    await addDoc(menuRef, {
      category,
      categoryEn,
      iconUrl: categoryIconUrl,
      itemsBackgroundUrl: categoryItemsBgUrl,
      items: [],
      order: highestOrder + 1,
    });
    setCategory("");
    setCategoryEn("");
    setCategoryIconUrl("");
    setCategoryItemsBgUrl("");
    loadMenu();
  };

  const startEditingCategory = (cat) => {
    setEditingCategory(cat);
    setEditingCategoryName(cat.category);
    setEditingCategoryNameEn(cat.categoryEn || "");
    setEditingCategoryIconUrl(cat.iconUrl || "");
    setEditingCategoryItemsBgUrl(cat.itemsBackgroundUrl || "");
  };

  const editCategory = async () => {
    if (!editingCategory || !editingCategoryName) return;
    const ref = doc(db, "menu", editingCategory.id);
    await updateDoc(ref, {
      category: editingCategoryName,
      categoryEn: editingCategoryNameEn,
      iconUrl: editingCategoryIconUrl,
      itemsBackgroundUrl: editingCategoryItemsBgUrl,
    });
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryNameEn("");
    setEditingCategoryIconUrl("");
    setEditingCategoryItemsBgUrl("");
    loadMenu();
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryNameEn("");
    setEditingCategoryIconUrl("");
    setEditingCategoryItemsBgUrl("");
  };

  const askDeleteCategory = (id) => {
    setConfirmDelete({ visible: true, type: "category", payload: id });
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

  // -- Item --
  const addItem = async () => {
    if ((!itemNameHy && !itemNameEn) || !itemPrice || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    await updateDoc(ref, {
      items: arrayUnion({
        nameHy: itemNameHy,
        nameEn: itemNameEn,
        price: itemPrice,
        imageUrl: imageUrl,
      }),
    });
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
    loadMenu();
  };

  const startEditingItem = (catId, item, idx) => {
    setSelectedCatId(catId);
    setItemNameHy(item.nameHy || "");
    setItemNameEn(item.nameEn || "");
    setItemPrice(item.price);
    setImageUrl(item.imageUrl || "");
    setEditingItem({ original: item, index: idx });
  };

  const editItem = async () => {
    if (!editingItem || !selectedCatId) return;
    const ref = doc(db, "menu", selectedCatId);
    const updatedItems = menu
      .find((cat) => cat.id === selectedCatId)
      .items.map((item) =>
        item === editingItem.original
          ? {
              nameHy: itemNameHy,
              nameEn: itemNameEn,
              price: itemPrice,
              imageUrl: imageUrl,
            }
          : item,
      );
    await updateDoc(ref, { items: updatedItems });
    setEditingItem(null);
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
    loadMenu();
  };

  const cancelItemEdit = () => {
    setEditingItem(null);
    setItemNameHy("");
    setItemNameEn("");
    setItemPrice("");
    setImageUrl("");
  };

  const moveItemUp = async (catId, index) => {
    if (index === 0) return;
    const category = menu.find((cat) => cat.id === catId);
    if (!category) return;

    const items = [...(category.items || [])];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];

    const ref = doc(db, "menu", catId);
    await updateDoc(ref, { items });
    loadMenu();
  };

  const moveItemDown = async (catId, index) => {
    const category = menu.find((cat) => cat.id === catId);
    if (!category) return;
    if (index === (category.items?.length ?? 0) - 1) return;

    const items = [...(category.items || [])];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];

    const ref = doc(db, "menu", catId);
    await updateDoc(ref, { items });
    loadMenu();
  };

  const askDeleteItem = (catId, item) => {
    setConfirmDelete({ visible: true, type: "item", payload: { catId, item } });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.visible) return;

    if (confirmDelete.type === "category") {
      await deleteDoc(doc(db, "menu", confirmDelete.payload));
    } else if (confirmDelete.type === "item") {
      const { catId, item } = confirmDelete.payload;
      const ref = doc(db, "menu", catId);
      await updateDoc(ref, { items: arrayRemove(item) });
    }

    setConfirmDelete({ visible: false, type: null, payload: null });
    loadMenu();
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ visible: false, type: null, payload: null });
  };

  // -- Drag & Drop Տրամաբանություն --
  const handleDragEnd = () => {
    setDraggedCatIdx(null);
    setDraggedItem(null);
  };

  // Բաժինների (Category) տեղափոխում
  const handleCategoryDragStart = (e, index) => {
    setDraggedCatIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleCategoryDragOver = (e) => {
    e.preventDefault();
  };
  const handleCategoryDrop = async (e, index) => {
    e.preventDefault();
    if (draggedCatIdx === null || draggedCatIdx === index) return;
    
    const newMenu = [...menu];
    const [moved] = newMenu.splice(draggedCatIdx, 1);
    newMenu.splice(index, 0, moved);
    
    setMenu(newMenu); // Արագ թարմացում էկրանին
    setDraggedCatIdx(null);

    // Թարմացում Firebase-ում
    const promises = newMenu.map((cat, i) =>
      updateDoc(doc(db, "menu", cat.id), { order: i + 1 })
    );
    await Promise.all(promises);
  };

  // Ապրանքների (Item) տեղափոխում
  const handleItemDragStart = (e, catId, index) => {
    e.stopPropagation(); // Որպեսզի բաժինը ևս չքաշվի
    setDraggedItem({ catId, index });
    e.dataTransfer.effectAllowed = "move";
  };
  const handleItemDragOver = (e) => {
    e.preventDefault();
  };
  const handleItemDrop = async (e, catId, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedItem.catId !== catId || draggedItem.index === index) {
      setDraggedItem(null);
      return;
    }
    const category = menu.find((c) => c.id === catId);
    if (!category) return;
    const newItems = [...(category.items || [])];
    const [moved] = newItems.splice(draggedItem.index, 1);
    newItems.splice(index, 0, moved);
    const newMenu = menu.map((c) => (c.id === catId ? { ...c, items: newItems } : c));
    setMenu(newMenu); // Արագ թարմացում էկրանին
    setDraggedItem(null);
    await updateDoc(doc(db, "menu", catId), { items: newItems });
  };

  // Բաժինների բացել/փակելու տրամաբանություն
  const toggleCategory = (catId) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // -- Import from Excel --
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        let data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("Ֆայլը դատարկ է կամ չի կարդացվել։");
          return;
        }

        const firstRowKeys = Object.keys(data[0]);
        if (
          firstRowKeys.length === 1 &&
          (firstRowKeys[0].includes(",") || firstRowKeys[0].includes(";"))
        ) {
          // Փորձում ենք ավտոմատ տարանջատել ստորակետերով կամ կետ-ստորակետերով (CSV fallback)
          const delimiter = firstRowKeys[0].includes(";") ? ";" : ",";
          const headers = firstRowKeys[0].split(delimiter);
          data = data.map((rawRow) => {
            const valString = String(rawRow[firstRowKeys[0]]);
            const values = valString.split(delimiter);
            const newObj = {};
            headers.forEach((h, i) => {
              newObj[h] = values[i] !== undefined ? values[i] : "";
            });
            return newObj;
          });
        }

        // Group items by category
        const groupedData = {};
        let foundRows = 0;

        data.forEach((rawRow) => {
          // Ջնջել թաքնված նշանները (BOM) և բացատները վերնագրերից
          const row = {};
          for (let key in rawRow) {
            const cleanKey = key
              .replace(/^\uFEFF/, "")
              .trim()
              .toLowerCase();
            row[cleanKey] =
              typeof rawRow[key] === "string"
                ? rawRow[key].trim()
                : rawRow[key];
          }

          const cat = row["category"] || row["բաժին"];
          if (!cat) return; // Skip invalid rows
          if (!groupedData[cat]) groupedData[cat] = [];
          groupedData[cat].push({
            nameEn:
              row["nameen"] ||
              row["name (en)"] ||
              row["անուն (անգլ)"] ||
              row["english"] ||
              "",
            nameHy:
              row["namehy"] ||
              row["name (hy)"] ||
              row["անուն (հայ)"] ||
              row["հայերեն"] ||
              "",
            price: row["price"] || row["գին"] || "",
            imageUrl: row["imageurl"] || row["նկարի հղում"] || "",
          });
          foundRows++;
        });

        if (foundRows === 0) {
          alert(
            "Ոչ մի ապրանք չավելացավ։ Համոզվեք, որ առաջին տողում կա 'Բաժին' վերնագիրը։",
          );
          return;
        }

        // Get existing highest order
        let highestOrder = menu.reduce(
          (max, sec) => Math.max(max, sec.order ?? 0),
          0,
        );

        // Upload/Update Firebase
        for (const [catName, items] of Object.entries(groupedData)) {
          const existingCat = menu.find((c) => c.category === catName);
          if (existingCat) {
            const ref = doc(db, "menu", existingCat.id);
            const newItems = [...(existingCat.items || []), ...items];
            await updateDoc(ref, { items: newItems });
          } else {
            highestOrder++;
            await addDoc(menuRef, {
              category: catName,
              iconUrl: "",
              itemsBackgroundUrl: "",
              items: items,
              order: highestOrder,
            });
          }
        }
        alert("Մենյուն հաջողությամբ ներմուծվեց։");
        loadMenu();
      } catch (error) {
        console.error("Ներմուծման սխալ:", error);
        alert("Տեղի ունեցավ սխալ ներմուծման ժամանակ։");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = null; // reset input securely
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // -- Image Upload Handler --
  const handleFileUpload = (e, setUrlCallback, folderPath, aspect = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Նախ կարդում ենք նկարը որպեսզի ցուցադրենք կտրելու մոդալում
    const reader = new FileReader();
    reader.onload = () => {
      setCropData({
        src: reader.result,
        setUrlCallback,
        folderPath,
        aspect,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Թույլ է տալիս նույն նկարը նորից ընտրել
  };

  const handleCropConfirm = async (blob) => {
    if (!cropData) return;
    const { setUrlCallback, folderPath, fileName } = cropData;
    setCropData(null); // Փակել մոդալը
    setIsUploading(true);
    try {
      const storage = getStorage();
      const fileRef = storageRef(storage, `${folderPath}/${Date.now()}_${fileName}`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      setUrlCallback(url);
    } catch (error) {
      console.error("Նկարի վերբեռնման սխալ:", error);
      alert("Նկարի վերբեռնումը ձախողվեց։ Համոզվեք որ Firebase Storage-ը միացված է։");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropData(null);
  };

  return (
    <div className="admin-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Admin Panel</h2>
        <div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={isImporting}
            style={{
              padding: "8px 16px",
              cursor: isImporting ? "wait" : "pointer",
              backgroundColor: isImporting ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {isImporting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaSpinner /> Ներմուծվում է...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaFileImport /> Ներմուծել Excel-ից
              </span>
            )}
          </button>
        </div>
      </div>

      <CategoryForm
        category={category}
        categoryEn={categoryEn}
        categoryIconUrl={categoryIconUrl}
        categoryItemsBgUrl={categoryItemsBgUrl}
        setCategory={setCategory}
        setCategoryEn={setCategoryEn}
        setCategoryIconUrl={setCategoryIconUrl}
        setCategoryItemsBgUrl={setCategoryItemsBgUrl}
        addCategory={addCategory}
        editingCategory={editingCategory}
        editingCategoryName={editingCategoryName}
        editingCategoryNameEn={editingCategoryNameEn}
        editingCategoryIconUrl={editingCategoryIconUrl}
        editingCategoryItemsBgUrl={editingCategoryItemsBgUrl}
        setEditingCategoryName={setEditingCategoryName}
        setEditingCategoryNameEn={setEditingCategoryNameEn}
        setEditingCategoryIconUrl={setEditingCategoryIconUrl}
        setEditingCategoryItemsBgUrl={setEditingCategoryItemsBgUrl}
        editCategory={editCategory}
        cancelCategoryEdit={cancelCategoryEdit}
        handleFileUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <hr />

      <div>
        <ItemForm
          menu={menu}
          selectedCatId={selectedCatId}
          setSelectedCatId={setSelectedCatId}
          itemNameHy={itemNameHy}
          setItemNameHy={setItemNameHy}
          itemNameEn={itemNameEn}
          setItemNameEn={setItemNameEn}
          itemPrice={itemPrice}
          setItemPrice={setItemPrice}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          addItem={addItem}
          editingItem={editingItem}
          editItem={editItem}
          cancelItemEdit={cancelItemEdit}
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
      </div>

      <hr />

      {menu.map((sec, index) => (
        <div key={sec.id}>
          <div
            draggable
            onDragStart={(e) => handleCategoryDragStart(e, index)}
            onDragOver={handleCategoryDragOver}
            onDrop={(e) => handleCategoryDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "grab",
              opacity: draggedCatIdx === index ? 0.5 : 1,
              backgroundColor: draggedCatIdx === index ? "#f9f9f9" : "transparent",
              padding: "4px",
              borderRadius: "4px"
            }}
            title="Բռնել և տեղափոխել բաժինը"
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Որպեսզի drag-ը չխանգարի
                toggleCategory(sec.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0 8px",
              }}
              title={expandedCats[sec.id] ? "Փակել ապրանքների ցանկը" : "Բացել ապրանքների ցանկը"}
            >
              {expandedCats[sec.id] ? <FaChevronDown color="black" /> : <FaChevronRight color="black" />}
            </button>
            {sec.iconUrl && (
              <img
                src={sec.iconUrl}
                alt={`${sec.category} icon`}
                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4 }}
                title="Icon"
              />
            )}
            {sec.itemsBackgroundUrl && (
              <img
                src={sec.itemsBackgroundUrl}
                alt={`${sec.category} background`}
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, border: "1px solid #ccc" }}
                title="Ֆոնային նկար"
              />
            )}
            <h3 style={{ margin: 0 }}>
              {sec.category} {sec.categoryEn && <span style={{color: "gray", fontSize: "0.9em"}}> / {sec.categoryEn}</span>}
            </h3>
            <span className="reorder-buttons">
              <ActionButton
                onAction={() => moveCategoryUp(index)}
                disabled={index === 0}
              >
                <FaArrowUp />
              </ActionButton>
              <ActionButton
                onAction={() => moveCategoryDown(index)}
                disabled={index === menu.length - 1}
              >
                <FaArrowDown />
              </ActionButton>
              <ActionButton onAction={() => startEditingCategory(sec)}>
                <FaEdit />
              </ActionButton>
              <ActionButton onAction={() => askDeleteCategory(sec.id)}>
                <FaTrash />
              </ActionButton>
            </span>
          </div>

          {expandedCats[sec.id] && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {sec.items?.map((item, idx) => (
                <li
                  key={idx}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, sec.id, idx)}
                  onDragOver={handleItemDragOver}
                  onDrop={(e) => handleItemDrop(e, sec.id, idx)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    cursor: "grab",
                    opacity: draggedItem?.catId === sec.id && draggedItem?.index === idx ? 0.5 : 1,
                    backgroundColor: draggedItem?.catId === sec.id && draggedItem?.index === idx ? "#f9f9f9" : "transparent",
                    padding: "4px",
                    borderRadius: "4px"
                  }}
                  title="Բռնել և տեղափոխել ապրանքը"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  )}
                  <span style={{ flexGrow: 1 }}>
                    {item.nameEn} / {item.nameHy} - {item.price} ֏
                  </span>
                  <ActionButton
                    onAction={() => moveItemUp(sec.id, idx)}
                    disabled={idx === 0}
                  >
                    <FaArrowUp />
                  </ActionButton>
                  <ActionButton
                    onAction={() => moveItemDown(sec.id, idx)}
                    disabled={idx === sec.items.length - 1}
                  >
                    <FaArrowDown />
                  </ActionButton>
                  <ActionButton
                    onAction={() => startEditingItem(sec.id, item, idx)}
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton onAction={() => askDeleteItem(sec.id, item)}>
                    <FaTrash />
                  </ActionButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {confirmDelete.visible && (
        <ConfirmModal
          message={
            confirmDelete.type === "category"
              ? "Դուք ցանկանում եք ջնջել այս բաժինը?"
              : "Դուք ցանկանում եք ջնջել այս կետը?"
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {cropData && (
        <ImageCropperModal
          src={cropData.src}
          aspect={cropData.aspect}
          onCropConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
