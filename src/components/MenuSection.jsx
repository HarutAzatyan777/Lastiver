export default function MenuSection({ category, items }) {
    return (
      <section>
        <h2>{category}</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items?.map((item, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "1rem",
              }}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                />
              )}
              <div>
                <strong>{item.name}</strong> — {item.price} ֏
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  