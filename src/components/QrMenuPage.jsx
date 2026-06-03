import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/QrMenuPage.css";
import Nav from "../components/Nav";
import ScrollToTop from "../components/ScrollToTop";

/* ----- Օգնական ֆունկցիա slugify-ի համար ----- */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Բոլոր բացատները փոխում ենք -
    .replace(/[^\p{L}\p{N}-]+/gu, "") // Թույլատրում ենք միայն տառեր (L), թվեր (N), և - նշանը
    .replace(/--+/g, "-"); // Երկուից ավել - վերացնում ենք
}

/* ----- MenuSection Subcomponent ----- */
function MenuSection({ section, index }) {
  const sectionId = slugify(section.category);
  const [isExpanded, setIsExpanded] = useState(false);

  const ITEMS_LIMIT = 4; // Ցուցադրվող ապրանքների քանակը մինչև «Տեսնել ավելին»
  const items = section.items || [];
  const hasMore = items.length > ITEMS_LIMIT;
  const visibleItems = isExpanded ? items : items.slice(0, ITEMS_LIMIT);

  return (
    <div
      id={sectionId}
      className="qr-menu-section fade-in"
      style={{
        animationDelay: `${index * 100}ms`,
        backgroundImage: section.itemsBackgroundUrl
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url("${section.itemsBackgroundUrl}")`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: section.itemsBackgroundUrl ? "#fff" : "inherit",
        borderRadius: "16px",
        boxShadow: section.itemsBackgroundUrl
          ? "0 8px 20px rgba(0,0,0,0.3)"
          : "none",
        overflow: "hidden", // Որպեսզի նկարը չանցնի կլորացված անկյուններից
        minHeight: "380px", // Ապահովում է հաստատուն չափ, եթե նույնիսկ ապրանքները 4-ից քիչ են
      }}
    >
      <h3 className="qr-menu-section-title">
        <img
          src={section.iconUrl || "/icon.png"}
          alt="Category Icon"
          className="section-icon"
        />
        <span className="section-title-text">
          {section.category}
          {section.categoryEn && (
            <span
              style={{
                fontSize: "0.8em",
                color: section.itemsBackgroundUrl ? "#ddd" : "#666",
                marginLeft: "8px",
                fontWeight: "normal",
              }}
            >
              / {section.categoryEn}
            </span>
          )}
        </span>
      </h3>

      <ul className="qr-menu-items">
        {visibleItems.map((item, idx) => (
          <li key={idx} className="qr-menu-item">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.nameEn || item.nameHy || "Menu item image"}
                className="qr-menu-item-image"
              />
            )}
            <div className="qr-menu-item-text">
              <div className="qr-menu-item-line">
                <span className="item-name-block">
                  {item.nameEn && (
                    <span className="item-name-en">{item.nameEn}</span>
                  )}
                  {item.nameHy && (
                    <span className="item-name-hy">{item.nameHy}</span>
                  )}
                </span>
                <span className="dots"></span>
                <strong className="item-price">{item.price} AMD</strong>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            paddingBottom: "15px",
          }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#333",
              border: "none",
              padding: "8px 24px",
              borderRadius: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "background 0.3s ease",
            }}
          >
            {isExpanded ? "Փակել ⬆" : "Տեսնել ավելին ⬇"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ----- Main Component ----- */
export default function QrMenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [...new Set(menu.map((s) => s.category))];
  const categorySlugs = categories.map((cat) => ({
    name: cat,
    slug: slugify(cat),
  }));

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q = query(collection(db, "menu"), orderBy("order"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenu(data);
      } catch (error) {
        console.error("Չհաջողվեց բեռնել մենյուն։", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="qr-menu-page">
      <h2 className="menu-title">
        <img src="/logo.jpg" alt="Lastiver Logo" className="menu-logo" />
      </h2>

      <Nav categories={categorySlugs} />

      {loading ? (
        <div className="loader" aria-label="Մենյուն բեռնվում է...">
          <span>Մենյուն բեռնվում է...</span>
        </div>
      ) : menu.length === 0 ? (
        <p className="empty-state">
          Մենյուն դեռ դատարկ է։ Խնդրում ենք փորձել ավելի ուշ կամ կապվել մեզ հետ։
        </p>
      ) : (
        menu.map((section, index) => (
          <MenuSection key={section.id} section={section} index={index} />
        ))
      )}

      <div className="qr-menu-info">
        <p>Lastiver</p>
        <p>
          <em>
            Relax and recharge with us
            <br />
            ▫️Restaurant / Pool / Bar
            <br />
            ▫️Every day 10:00-22:00
          </em>
        </p>
        <p>
          <strong>Երևան-Աշտարակ մայրուղի ձախ ափ 17/1, Ashtarak, Armenia</strong>
        </p>
        <ScrollToTop />
      </div>
    </div>
  );
}
