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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/* ----- MenuSection Subcomponent ----- */
function MenuSection({ section, index }) {
  const sectionId = slugify(section.category);

  return (
    <div
      id={sectionId}
      className="qr-menu-section fade-in"
      style={{
        animationDelay: `${index * 100}ms`,
        backgroundImage: section.itemsBackgroundUrl
          ? `url(${section.itemsBackgroundUrl})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h3 className="qr-menu-section-title">
        <img src="/icon.png" alt="Default Icon" className="section-icon" />
        {section.category}
        {section.iconUrl && (
          <img
            src={section.iconUrl}
            alt="Category Extra Icon"
            className="section-icon-iconUrl"
            style={{ marginLeft: "4px" }}
          />
        )}
      </h3>

      <ul className="qr-menu-items">
        {section.items?.map((item, idx) => (
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
        <img src="/logo.jpg" alt="Pascali Logo" className="menu-logo" />
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
            <br />▫️Restaurant / Pool / Bar
            <br />▫️Every day 10:00-22:00
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
