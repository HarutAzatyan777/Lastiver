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
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
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
  FaTimes,
} from "react-icons/fa";

const menuRef = collection(db, "menu");

export default function AdminPanelFirebase() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [categoryIconUrl, setCategoryIconUrl] = useState("");
  const [categoryItemsBgUrl, setCategoryItemsBgUrl] = useState("");
  const [categoryIntermediateImageUrl, setCategoryIntermediateImageUrl] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryNameEn, setEditingCategoryNameEn] = useState("");
  const [editingCategoryIconUrl, setEditingCategoryIconUrl] = useState("");
  const [editingCategoryItemsBgUrl, setEditingCategoryItemsBgUrl] =
    useState("");
  const [editingCategoryIntermediateImageUrl, setEditingCategoryIntermediateImageUrl] = useState("");

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
  const [toastMessage, setToastMessage] = useState(null);
  const [globalTopImageUrl, setGlobalTopImageUrl] = useState("");
  const [globalLogoUrl, setGlobalLogoUrl] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkTargetCatId, setBulkTargetCatId] = useState("");

  const loadMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setMenu(data);
  };

  const loadSettings = async () => {
    const docSnap = await getDoc(doc(db, "settings", "global"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setGlobalTopImageUrl(data.topImageUrl || "");
      setGlobalLogoUrl(data.logoUrl || "");
    }
  };

  useEffect(() => {
    loadMenu();
    loadSettings();
  }, []);

  const saveGlobalSettings = async () => {
    setIsUploading(true);
    await setDoc(doc(db, "settings", "global"), { 
      topImageUrl: globalTopImageUrl,
      logoUrl: globalLogoUrl
    }, { merge: true });
    setIsUploading(false);
    showToast("✅ Գլխավոր կարգավորումները պահպանվեցին։");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

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
      intermediateImageUrl: categoryIntermediateImageUrl,
      items: [],
      order: highestOrder + 1,
    });
    setCategory("");
    setCategoryEn("");
    setCategoryIconUrl("");
    setCategoryItemsBgUrl("");
    setCategoryIntermediateImageUrl("");
    loadMenu();
  };

  const startEditingCategory = (cat) => {
    setEditingCategory(cat);
    setEditingCategoryName(cat.category);
    setEditingCategoryNameEn(cat.categoryEn || "");
    setEditingCategoryIconUrl(cat.iconUrl || "");
    setEditingCategoryItemsBgUrl(cat.itemsBackgroundUrl || "");
    setEditingCategoryIntermediateImageUrl(cat.intermediateImageUrl || "");
  };

  const editCategory = async () => {
    if (!editingCategory || !editingCategoryName) return;
    const ref = doc(db, "menu", editingCategory.id);
    await updateDoc(ref, {
      category: editingCategoryName,
      categoryEn: editingCategoryNameEn,
      iconUrl: editingCategoryIconUrl,
      itemsBackgroundUrl: editingCategoryItemsBgUrl,
      intermediateImageUrl: editingCategoryIntermediateImageUrl,
    });
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryNameEn("");
    setEditingCategoryIconUrl("");
    setEditingCategoryItemsBgUrl("");
    setEditingCategoryIntermediateImageUrl("");
    loadMenu();
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategoryNameEn("");
    setEditingCategoryIconUrl("");
    setEditingCategoryItemsBgUrl("");
    setEditingCategoryIntermediateImageUrl("");
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

    const categoryToUpdate = menu.find((cat) => cat.id === selectedCatId);
    if (categoryToUpdate && categoryToUpdate.items) {
      const isDuplicate = categoryToUpdate.items.some(
        (item) =>
          (itemNameHy && item.nameHy === itemNameHy) ||
          (itemNameEn && item.nameEn === itemNameEn),
      );
      if (isDuplicate) {
            showToast("❌ Այս անվանումով ապրանք արդեն գոյություն ունի ընտրված բաժնում։");
        return;
      }
    }

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
    showToast("✅ Ապրանքը հաջողությամբ ավելացվեց։");
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

  // -- Bulk Actions Logic --
  const isItemSelected = (catId, item) => {
    return selectedItems.some((si) => si.catId === catId && si.original.nameHy === item.nameHy && si.original.nameEn === item.nameEn);
  };

  const toggleItemSelection = (catId, item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((si) => si.catId === catId && si.original.nameHy === item.nameHy && si.original.nameEn === item.nameEn);
      if (exists) {
        return prev.filter((si) => si !== exists);
      } else {
        return [...prev, { catId, original: item }];
      }
    });
  };

  const askBulkDelete = () => {
    setConfirmDelete({ visible: true, type: "bulkItems", payload: selectedItems });
  };

  const handleBulkMove = async () => {
    if (!bulkTargetCatId || selectedItems.length === 0) return;
    setIsUploading(true);
    try {
      const newMenu = menu.map((c) => ({ ...c, items: [...(c.items || [])] }));
      const itemsToMove = selectedItems.map((si) => si.original);

      // Remove from old categories
      selectedItems.forEach((si) => {
        const cat = newMenu.find((c) => c.id === si.catId);
        if (cat && cat.id !== bulkTargetCatId) {
          cat.items = cat.items.filter((item) => !(item.nameHy === si.original.nameHy && item.nameEn === si.original.nameEn));
        }
      });

      // Add to target category
      const targetCat = newMenu.find((c) => c.id === bulkTargetCatId);
      if (targetCat) {
        itemsToMove.forEach((newItem) => {
          const exists = targetCat.items.some(
            (existing) =>
              (newItem.nameHy && existing.nameHy === newItem.nameHy) ||
              (newItem.nameEn && existing.nameEn === newItem.nameEn)
          );
          if (!exists) {
            targetCat.items.push(newItem);
          }
        });
      }

      const affectedCatIds = new Set(selectedItems.map((si) => si.catId));
      affectedCatIds.add(bulkTargetCatId);

      const promises = Array.from(affectedCatIds).map((id) => {
        const updatedCat = newMenu.find((c) => c.id === id);
        if (updatedCat) {
          return updateDoc(doc(db, "menu", id), { items: updatedCat.items });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedItems([]);
      setBulkTargetCatId("");
      loadMenu();
      showToast("✅ Ապրանքները հաջողությամբ տեղափոխվեցին։");
    } catch (error) {
      console.error(error);
      showToast("❌ Սխալ առաջացավ տեղափոխման ժամանակ։");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.visible) return;

    if (confirmDelete.type === "category") {
      await deleteDoc(doc(db, "menu", confirmDelete.payload));
    } else if (confirmDelete.type === "item") {
      const { catId, item } = confirmDelete.payload;
      const ref = doc(db, "menu", catId);
      await updateDoc(ref, { items: arrayRemove(item) });
    } else if (confirmDelete.type === "bulkItems") {
      const itemsToDelete = confirmDelete.payload;
      const newMenu = menu.map((c) => ({ ...c, items: [...(c.items || [])] }));

      itemsToDelete.forEach((si) => {
        const cat = newMenu.find((c) => c.id === si.catId);
        if (cat) {
          cat.items = cat.items.filter((item) => !(item.nameHy === si.original.nameHy && item.nameEn === si.original.nameEn));
        }
      });

      const affectedCatIds = new Set(itemsToDelete.map((si) => si.catId));
      const promises = Array.from(affectedCatIds).map((id) => {
        const updatedCat = newMenu.find((c) => c.id === id);
        if (updatedCat) {
          return updateDoc(doc(db, "menu", id), { items: updatedCat.items });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedItems([]);
      showToast("✅ Ընտրված ապրանքները ջնջվեցին։");
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
      updateDoc(doc(db, "menu", cat.id), { order: i + 1 }),
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
    if (
      !draggedItem ||
      draggedItem.catId !== catId ||
      draggedItem.index === index
    ) {
      setDraggedItem(null);
      return;
    }
    const category = menu.find((c) => c.id === catId);
    if (!category) return;
    const newItems = [...(category.items || [])];
    const [moved] = newItems.splice(draggedItem.index, 1);
    newItems.splice(index, 0, moved);
    const newMenu = menu.map((c) =>
      c.id === catId ? { ...c, items: newItems } : c,
    );
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
        let duplicateInternal = 0;
        let duplicateFirebase = 0;
        let addedCount = 0;

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

          const nameEnVal =
            row["nameen"] ||
            row["name (en)"] ||
            row["անուն (անգլ)"] ||
            row["english"] ||
            "";
          const nameHyVal =
            row["namehy"] ||
            row["name (hy)"] ||
            row["անուն (հայ)"] ||
            row["հայերեն"] ||
            "";

          const isDuplicate = groupedData[cat].some(
            (item) =>
              (nameHyVal && item.nameHy === nameHyVal) ||
              (nameEnVal && item.nameEn === nameEnVal),
          );

          if (isDuplicate) {
            duplicateInternal++;
          } else {
            groupedData[cat].push({
              nameEn: nameEnVal,
              nameHy: nameHyVal,
              price: row["price"] || row["գին"] || "",
              imageUrl: row["imageurl"] || row["նկարի հղում"] || "",
            });
            foundRows++;
          }
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

            const uniqueNewItems = items.filter((newItem) => {
              return !(existingCat.items || []).some(
                (existingItem) =>
                  (newItem.nameHy && existingItem.nameHy === newItem.nameHy) ||
                  (newItem.nameEn && existingItem.nameEn === newItem.nameEn),
              );
            });

            duplicateFirebase += items.length - uniqueNewItems.length;

            if (uniqueNewItems.length > 0) {
              addedCount += uniqueNewItems.length;
              const newItems = [
                ...(existingCat.items || []),
                ...uniqueNewItems,
              ];
              await updateDoc(ref, { items: newItems });
            }
          } else {
            addedCount += items.length;
            highestOrder++;
            await addDoc(menuRef, {
              category: catName,
              iconUrl: "",
              itemsBackgroundUrl: "",
              intermediateImageUrl: "",
              items: items,
              order: highestOrder,
            });
          }
        }
        const totalSkipped = duplicateInternal + duplicateFirebase;
        showToast(`Ներմուծումն ավարտվեց։\n✅ Ավելացվել է: ${addedCount} ապրանք\n❌ Մերժվել է: ${totalSkipped} կրկնօրինակ`);
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
  const handleFileUpload = async (e, setUrlCallback, folderPath, aspect = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Եթե ֆայլը GIF է, բաց ենք թողնում կտրելու (crop) փուլը, որպեսզի անիմացիան չկորչի
    if (file.type === "image/gif") {
      setIsUploading(true);
      try {
        const storage = getStorage();
        const fileRef = storageRef(
          storage,
          `${folderPath}/${Date.now()}_${file.name}`,
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        setUrlCallback(url);
      } catch (error) {
        console.error("GIF վերբեռնման սխալ:", error);
        alert("GIF-ի վերբեռնումը ձախողվեց։ Համոզվեք որ Firebase Storage-ը միացված է։");
      } finally {
        setIsUploading(false);
        e.target.value = null;
      }
      return;
    }

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
      const fileRef = storageRef(
        storage,
        `${folderPath}/${Date.now()}_${fileName}`,
      );
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      setUrlCallback(url);
    } catch (error) {
      console.error("Նկարի վերբեռնման սխալ:", error);
      alert(
        "Նկարի վերբեռնումը ձախողվեց։ Համոզվեք որ Firebase Storage-ը միացված է։",
      );
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
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaSpinner /> Ներմուծվում է...
              </span>
            ) : (
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaFileImport /> Ներմուծել Excel-ից
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Settings Section */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#f9f9f9",
        }}
      >
        <h3>Գլխավոր կարգավորումներ</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
            <strong>🌌 Գլխավոր Բաններ:</strong> Ցուցադրվում է էջի ամենավերևում (16:9)
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              placeholder="Լոգոյի վերևի նկարի URL"
              value={globalTopImageUrl}
              onChange={(e) => setGlobalTopImageUrl(e.target.value)}
              style={{ flex: 1, margin: 0 }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, setGlobalTopImageUrl, "settings", 16 / 9)}
              disabled={isUploading}
            />
            {globalTopImageUrl && (
              <img
                src={globalTopImageUrl}
                alt="Top Banner"
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
              />
            )}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
            <strong>💠 Գլխավոր Լոգո:</strong> Խանութի լոգոն վերևի մասում (ազատ չափ կամ 1:1)
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              placeholder="Գլխավոր լոգոյի URL (կփոխարինի logo.jpg-ին)"
              value={globalLogoUrl}
              onChange={(e) => setGlobalLogoUrl(e.target.value)}
              style={{ flex: 1, margin: 0 }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, setGlobalLogoUrl, "settings", null)} // null = ազատ կտրում (freeform aspect ratio)
              disabled={isUploading}
            />
            {globalLogoUrl && (
              <img
                src={globalLogoUrl}
                alt="Main Logo"
                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4 }}
              />
            )}
          </div>
        </div>

        <button
          onClick={saveGlobalSettings}
          disabled={isUploading}
          style={{
            padding: "8px 16px",
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: isUploading ? "wait" : "pointer",
            alignSelf: "flex-start"
          }}
        >
          {isUploading ? "Պահպանվում է..." : "Պահպանել"}
        </button>
      </div>
      </div>

      <CategoryForm
        category={category}
        categoryEn={categoryEn}
        categoryIconUrl={categoryIconUrl}
        categoryItemsBgUrl={categoryItemsBgUrl}
        categoryIntermediateImageUrl={categoryIntermediateImageUrl}
        setCategory={setCategory}
        setCategoryEn={setCategoryEn}
        setCategoryIconUrl={setCategoryIconUrl}
        setCategoryItemsBgUrl={setCategoryItemsBgUrl}
        setCategoryIntermediateImageUrl={setCategoryIntermediateImageUrl}
        addCategory={addCategory}
        editingCategory={editingCategory}
        editingCategoryName={editingCategoryName}
        editingCategoryNameEn={editingCategoryNameEn}
        editingCategoryIconUrl={editingCategoryIconUrl}
        editingCategoryItemsBgUrl={editingCategoryItemsBgUrl}
        editingCategoryIntermediateImageUrl={editingCategoryIntermediateImageUrl}
        setEditingCategoryName={setEditingCategoryName}
        setEditingCategoryNameEn={setEditingCategoryNameEn}
        setEditingCategoryIconUrl={setEditingCategoryIconUrl}
        setEditingCategoryItemsBgUrl={setEditingCategoryItemsBgUrl}
        setEditingCategoryIntermediateImageUrl={setEditingCategoryIntermediateImageUrl}
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
              backgroundColor:
                draggedCatIdx === index ? "#f9f9f9" : "transparent",
              padding: "4px",
              borderRadius: "4px",
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
              title={
                expandedCats[sec.id]
                  ? "Փակել ապրանքների ցանկը"
                  : "Բացել ապրանքների ցանկը"
              }
            >
              {expandedCats[sec.id] ? (
                <FaChevronDown color="black" />
              ) : (
                <FaChevronRight color="black" />
              )}
            </button>
            {sec.iconUrl && (
              <img
                src={sec.iconUrl}
                alt={`${sec.category} icon`}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                  borderRadius: 4,
                }}
                title="Icon"
              />
            )}
            {sec.itemsBackgroundUrl && (
              <img
                src={sec.itemsBackgroundUrl}
                alt={`${sec.category} background`}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                title="Ֆոնային նկար"
              />
            )}
            <h3 style={{ margin: 0 }}>
              {sec.category}{" "}
              {sec.categoryEn && (
                <span style={{ color: "gray", fontSize: "0.9em" }}>
                  {" "}
                  / {sec.categoryEn}
                </span>
              )}
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
                    opacity:
                      draggedItem?.catId === sec.id &&
                      draggedItem?.index === idx
                        ? 0.5
                        : 1,
                    backgroundColor:
                      draggedItem?.catId === sec.id &&
                      draggedItem?.index === idx
                        ? "#f9f9f9"
                        : "transparent",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                  title="Բռնել և տեղափոխել ապրանքը"
                >
                  <input
                    type="checkbox"
                    checked={isItemSelected(sec.id, item)}
                    onChange={() => toggleItemSelection(sec.id, item)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "18px", height: "18px", cursor: "pointer", margin: "0 10px 0 0" }}
                  />
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
              : confirmDelete.type === "bulkItems"
              ? `Դուք ցանկանում եք ջնջել ընտրված ${confirmDelete.payload?.length} ապրանքները?`
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

      {selectedItems.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 10000,
            border: "1px solid #ddd",
            width: "90%",
            maxWidth: "600px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <strong style={{ whiteSpace: "nowrap" }}>Ընտրված է: {selectedItems.length}</strong>
          <select
            value={bulkTargetCatId}
            onChange={(e) => setBulkTargetCatId(e.target.value)}
            style={{ flex: 1, minWidth: "120px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", margin: 0 }}
          >
            <option value="">-- Տեղափոխել --</option>
            {menu.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkMove}
            disabled={!bulkTargetCatId || isUploading}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: (!bulkTargetCatId || isUploading) ? "not-allowed" : "pointer",
              margin: 0
            }}
          >
            Տեղափոխել
          </button>
          <button
            onClick={askBulkDelete}
            style={{
              padding: "8px 16px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              margin: 0
            }}
          >
            Ջնջել
          </button>
          <button
            onClick={() => {
              setSelectedItems([]);
              setBulkTargetCatId("");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: 0,
              padding: "8px"
            }}
            title="Չեղարկել"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#333",
            color: "#fff",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10000,
            whiteSpace: "pre-line",
            fontSize: "16px"
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
