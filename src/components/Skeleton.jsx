import React from "react";
import styles from "./Skeleton.module.css";

export default function Skeleton() {
  // Սահմանում ենք քանի կատեգորիա և ապրանք ենք ուզում ցուցադրել բեռնման ժամանակ
  const sections = [1, 2];
  const items = [1, 2, 3];

  return (
    <div className={styles.skeletonContainer}>
      {sections.map((sec) => (
        <div key={sec} className={styles.section}>
          <div className={`${styles.categoryTitle} ${styles.shimmer}`}></div>
          <div className={styles.categoryBody}>
            {items.map((item) => (
              <div key={item} className={styles.item}>
                <div className={`${styles.itemImage} ${styles.shimmer}`}></div>
                <div className={styles.itemText}>
                  <div
                    className={`${styles.itemTitle} ${styles.shimmer}`}
                  ></div>
                  <div
                    className={`${styles.itemSubtitle} ${styles.shimmer}`}
                  ></div>
                </div>
                <div className={`${styles.itemPrice} ${styles.shimmer}`}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
