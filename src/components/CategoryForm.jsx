import React from "react";
import ActionButton from "./ActionButton";
import {
  FaTimes,
  FaPlus,
  FaCheck,
  FaSpinner,
  FaLanguage,
} from "react-icons/fa";

export default function CategoryForm({
  category,
  categoryEn,
  categoryIconUrl,
  categoryItemsBgUrl,
  categoryIntermediateImageUrl,
  setCategory,
  setCategoryEn,
  setCategoryIconUrl,
  setCategoryItemsBgUrl,
  setCategoryIntermediateImageUrl,
  addCategory,
  editingCategory,
  editingCategoryName,
  editingCategoryNameEn,
  editingCategoryIconUrl,
  editingCategoryItemsBgUrl,
  editingCategoryIntermediateImageUrl,
  setEditingCategoryName,
  setEditingCategoryNameEn,
  setEditingCategoryIconUrl,
  setEditingCategoryItemsBgUrl,
  setEditingCategoryIntermediateImageUrl,
  editCategory,
  cancelCategoryEdit,
  handleFileUpload,
  isUploading,
}) {
  // Google Translate-ի ավտոմատ թարգմանման ֆունկցիա
  const autoTranslate = async (text, setter) => {
    if (!text) return;
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hy&tl=en&dt=t&q=${encodeURIComponent(text)}`,
      );
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        setter(data[0][0][0]);
      }
    } catch (e) {
      console.error("Թարգմանության սխալ:", e);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h3>Ավելացնել նոր բաժին</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            placeholder="Բաժին (Հայերեն)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            type="button"
            onClick={() => autoTranslate(category, setCategoryEn)}
            style={{
              padding: "0 10px",
              cursor: "pointer",
              background: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            title="Ավտոմատ թարգմանել անգլերեն"
          >
            <FaLanguage size={20} color="#555" />
          </button>
          <input
            placeholder="Category (English)"
            value={categoryEn}
            onChange={(e) => setCategoryEn(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
        </div>
        <div
          style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}
        >
          <strong>🖼️ Բաժնի Icon:</strong> Փոքր պատկերակ վերնագրի կողքին (1:1)
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
            placeholder="Բաժնի icon նկարի URL (կամ վերբեռնեք 👉)"
            value={categoryIconUrl}
            onChange={(e) => setCategoryIconUrl(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={
              (e) => handleFileUpload(e, setCategoryIconUrl, "categories", 1) // 1:1 Icon
            }
            disabled={isUploading}
          />
          {categoryIconUrl && (
            <div style={{ position: "relative", display: "flex" }}>
              <img
                src={categoryIconUrl}
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
                onClick={() => setCategoryIconUrl("")}
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
        <div
          style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}
        >
          <strong>🌄 Ֆոնային Նկար:</strong> Ցուցադրվում է բաժնի ապրանքների
          հետևում (16:9)
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
            placeholder="Բաժնի ֆոնային նկարի URL (կամ վերբեռնեք 👉)"
            value={categoryItemsBgUrl}
            onChange={(e) => setCategoryItemsBgUrl(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={
              (e) =>
                handleFileUpload(e, setCategoryItemsBgUrl, "categories", 16 / 9) // 16:9 Background
            }
            disabled={isUploading}
          />
          {categoryItemsBgUrl && (
            <div style={{ position: "relative", display: "flex" }}>
              <img
                src={categoryItemsBgUrl}
                alt="Preview Background"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <button
                type="button"
                onClick={() => setCategoryItemsBgUrl("")}
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
                title="Ջնջել ֆոնը"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        <div
          style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}
        >
          <strong>🌉 Միջանկյալ Նկար:</strong> Մեծ բաններ այս բաժնի ավարտից
          անմիջապես հետո (Instagram չափս՝ 1080x1080 կամ 1080x1350)
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
            placeholder="Միջանկյալ նկարի URL (բաժնից հետո) 👉"
            value={categoryIntermediateImageUrl}
            onChange={(e) => setCategoryIntermediateImageUrl(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileUpload(
                e,
                setCategoryIntermediateImageUrl,
                "categories",
                null, // Ազատ կտրում՝ Instagram չափսերի համար
              )
            }
            disabled={isUploading}
          />
          {categoryIntermediateImageUrl && (
            <div style={{ position: "relative", display: "flex" }}>
              <img
                src={categoryIntermediateImageUrl}
                alt="Intermediate"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <button
                type="button"
                onClick={() => setCategoryIntermediateImageUrl("")}
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
        <ActionButton onAction={addCategory} disabled={isUploading}>
          {isUploading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaSpinner /> Վերբեռնվում է...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <FaPlus /> Ավելացնել Բաժին
            </span>
          )}
        </ActionButton>
      </div>

      {editingCategory && (
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
            <h3>Խմբագրել բաժինը</h3>
            <p style={{ color: "red" }}>
              Խմբագրում ես: <strong>{editingCategory.category}</strong>
            </p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                placeholder="Բաժին (Հայերեն)"
                value={editingCategoryName}
                onChange={(e) => setEditingCategoryName(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button
                type="button"
                onClick={() =>
                  autoTranslate(editingCategoryName, setEditingCategoryNameEn)
                }
                style={{
                  padding: "0 10px",
                  cursor: "pointer",
                  background: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                title="Ավտոմատ թարգմանել անգլերեն"
              >
                <FaLanguage size={20} color="#555" />
              </button>
              <input
                placeholder="Category (English)"
                value={editingCategoryNameEn}
                onChange={(e) => setEditingCategoryNameEn(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "4px",
              }}
            >
              <strong>🖼️ Բաժնի Icon:</strong> Փոքր պատկերակ վերնագրի կողքին
              (1:1)
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
                placeholder="Icon URL (կամ վերբեռնեք 👉)"
                value={editingCategoryIconUrl}
                onChange={(e) => setEditingCategoryIconUrl(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={
                  (e) =>
                    handleFileUpload(
                      e,
                      setEditingCategoryIconUrl,
                      "categories",
                      1,
                    ) // 1:1 Icon
                }
                disabled={isUploading}
              />
              {editingCategoryIconUrl && (
                <div style={{ position: "relative", display: "flex" }}>
                  <img
                    src={editingCategoryIconUrl}
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
                    onClick={() => setEditingCategoryIconUrl("")}
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
            <div
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "4px",
              }}
            >
              <strong>🌄 Ֆոնային Նկար:</strong> Ցուցադրվում է բաժնի ապրանքների
              հետևում (16:9)
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
                placeholder="Ֆոնային նկարի URL (կամ վերբեռնեք 👉)"
                value={editingCategoryItemsBgUrl}
                onChange={(e) => setEditingCategoryItemsBgUrl(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(
                    e,
                    setEditingCategoryItemsBgUrl,
                    "categories",
                    16 / 9, // 16:9 Background
                  )
                }
                disabled={isUploading}
              />
              {editingCategoryItemsBgUrl && (
                <div style={{ position: "relative", display: "flex" }}>
                  <img
                    src={editingCategoryItemsBgUrl}
                    alt="Preview Background"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingCategoryItemsBgUrl("")}
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
                    title="Ջնջել ֆոնը"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "4px",
              }}
            >
              <strong>🌉 Միջանկյալ Նկար:</strong> Մեծ բաններ այս բաժնի ավարտից
              անմիջապես հետո (Instagram չափս՝ 1080x1080 կամ 1080x1350)
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
                placeholder="Միջանկյալ նկարի URL (բաժնից հետո) 👉"
                value={editingCategoryIntermediateImageUrl}
                onChange={(e) =>
                  setEditingCategoryIntermediateImageUrl(e.target.value)
                }
                style={{ flex: 1, margin: 0 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(
                    e,
                    setEditingCategoryIntermediateImageUrl,
                    "categories",
                    null, // Ազատ կտրում՝ Instagram չափսերի համար
                  )
                }
                disabled={isUploading}
              />
              {editingCategoryIntermediateImageUrl && (
                <div style={{ position: "relative", display: "flex" }}>
                  <img
                    src={editingCategoryIntermediateImageUrl}
                    alt="Intermediate Preview"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingCategoryIntermediateImageUrl("")}
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
            <ActionButton onAction={editCategory} disabled={isUploading}>
              {isUploading ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FaSpinner /> Վերբեռնվում է...
                </span>
              ) : (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FaCheck /> Թարմացնել բաժինը
                </span>
              )}
            </ActionButton>
            <ActionButton onAction={cancelCategoryEdit}>
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaTimes /> Չեղարկել
              </span>
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
