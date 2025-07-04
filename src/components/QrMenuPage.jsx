// QrMenuPage.jsx

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/QrMenuPage.css";

/* ----- MenuSection Subcomponent ----- */
function MenuSection({ section, index }) {
  return (
    <div
      className="qr-menu-section fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.category}
          className="section-image"
          style={{
            width: "100%",
            maxWidth: "300px",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        />
      )}
      <h3>{section.category}</h3>
      <ul className="qr-menu-items">
        {section.items?.map((item, idx) => (
          <li key={idx} className="qr-menu-item">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name || "Menu item image"}
                className="item-image"
              />
            )}
            <span>
              {item.name} — <strong>{item.price} ֏</strong>
            </span>
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
        <span>Pascali Menu</span>
      </h2>

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
          <MenuSection
            key={section.id}
            section={section}
            index={index}
          />
        ))
      )}

      <div className="qr-menu-info">
        <p>📍 Moskovyan 28</p>
        <p>
          <em>
            Once upon a time Harutyun Pascali opened the 1st coffee place in
            France…
          </em>
        </p>
        <p>
          <strong>Official distributor of Malongo</strong>
        </p>
      </div>
    </div>
  );
}
