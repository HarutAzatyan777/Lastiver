import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/QrMenuPage.css";
import Nav from "../components/Nav";
import ScrollToTop from "../components/ScrollToTop";
import Skeleton from "./Skeleton";
import {
  FaChevronDown,
  FaChevronUp,
  FaBed,
  FaMountain,
  FaSwimmer,
  FaUtensils,
  FaCamera,
  FaMapMarkerAlt,
  FaMobileAlt,
} from "react-icons/fa";

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
      className="menu-section-container"
      style={{ marginBottom: "2rem" }}
    >
      <div className="qr-menu-section-title">
        <img
          src={section.iconUrl || "/icon.png"}
          alt="Category Icon"
          className="section-icon"
          style={{ mixBlendMode: "multiply" }}
        />
        <span className="section-title-text">
          {section.category}
          {section.categoryEn && (
            <span
              style={{
                fontSize: "0.8em",
                color: "#666",
                marginLeft: "8px",
                fontWeight: "normal",
              }}
            >
              / {section.categoryEn}
            </span>
          )}
        </span>
      </div>

      <div
        className="qr-menu-section fade-in"
        style={{
          animationDelay: `${index * 100}ms`,
          background: section.itemsBackgroundUrl ? "#1a1a20" : undefined,
          color: section.itemsBackgroundUrl ? "#fff" : "inherit",
          borderRadius: "16px",
          boxShadow: section.itemsBackgroundUrl
            ? "0 8px 20px rgba(0,0,0,0.3)"
            : "none",
          overflow: "hidden", // Որպեսզի նկարը չանցնի կլորացված անկյուններից
          minHeight: "380px", // Ապահովում է հաստատուն չափ, եթե նույնիսկ ապրանքները 4-ից քիչ են
          position: "relative",
          marginBottom: 0,
        }}
      >
        {/* Ֆիքսված բարձրությամբ ֆոնային նկար, որը չի լոճվի (zoom) ավելին բացելիս */}
        {section.itemsBackgroundUrl && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "450px", // Նկարը մնում է 450px բարձրության վրա
              backgroundImage: `linear-gradient(to bottom, rgba(26,26,32,0.2) 0%, rgba(26,26,32,0.8) 75%, #1a1a20 100%), url("${section.itemsBackgroundUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Պարունակությունը դնում ենք relative, որպեսզի նկարի վրայով երևա */}
        <div style={{ position: "relative", zIndex: 1 }}>
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
                className={`expand-btn ${!isExpanded ? "pulse" : ""}`}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "#333",
                  border: "none",
                  padding: "10px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
                title={isExpanded ? "Փակել" : "Տեսնել ավելին"}
              >
                {isExpanded ? (
                  <FaChevronUp size={20} />
                ) : (
                  <FaChevronDown size={20} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----- Main Component ----- */
export default function QrMenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalTopImage, setGlobalTopImage] = useState("");
  const [globalLogo, setGlobalLogo] = useState("");

  const categorySlugs = [];
  const seenCategories = new Set();
  menu.forEach((s) => {
    if (!seenCategories.has(s.category)) {
      seenCategories.add(s.category);
      categorySlugs.push({
        name: s.category,
        slug: slugify(s.category),
        iconUrl: s.iconUrl,
      });
    }
  });

  useEffect(() => {
    // Էջը թարմացնելիս (refresh) ավտոմատ բարձրանալ ամենավերև
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

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

    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGlobalTopImage(data.topImageUrl || "");
          setGlobalLogo(data.logoUrl || "");
        }
      } catch (e) {
        console.error("Չհաջողվեց բեռնել կարգավորումները։", e);
      }
    };

    Promise.all([fetchMenu(), fetchSettings()]);
  }, []);

  return (
    <div className="qr-menu-page">
      <div className="header-section">
        {globalTopImage && (
          <div className="top-banner-container">
            <img
              src={globalTopImage}
              alt="Top Banner"
              className="top-banner-image"
            />
          </div>
        )}
        <div className={`logo-container ${globalTopImage ? "overlapped" : ""}`}>
          <img
            src={globalLogo || "/logo.jpg"}
            alt="Lastiver Logo"
            className="main-logo"
          />
        </div>
      </div>

      <Nav categories={categorySlugs} />

      {loading ? (
        <Skeleton />
      ) : menu.length === 0 ? (
        <p className="empty-state">
          Մենյուն դեռ դատարկ է։ Խնդրում ենք փորձել ավելի ուշ կամ կապվել մեզ հետ։
        </p>
      ) : (
        menu.map((section, index) => (
          <div key={section.id}>
            <MenuSection section={section} index={index} />
            {section.intermediateImageUrl && (
              <div
                className="intermediate-image-container fade-in"
                style={{ textAlign: "center", margin: "20px 0" }}
              >
                <img
                  src={section.intermediateImageUrl}
                  alt="Intermediate Banner"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "16px",
                  }}
                />
              </div>
            )}
          </div>
        ))
      )}

      <div className="qr-menu-info">
        <p>Lastiver</p>
        <p>
          <em>
            <FaBed /> Comfortable stylish rooms
            <br />
            <FaMountain /> Stunning view
            <br />
            <FaSwimmer /> Heated outdoor pool
            <br />
            <FaUtensils /> Tasty restaurant
            <br />
            <FaCamera /> Armenian costumes
          </em>
        </p>
        <p>
          <strong>
            <FaMapMarkerAlt /> Yenoqavan &nbsp;&nbsp; <FaMobileAlt /> (+374) 33
            292 999
          </strong>
        </p>
        <ScrollToTop />
      </div>
    </div>
  );
}
