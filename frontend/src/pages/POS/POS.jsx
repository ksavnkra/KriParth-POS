import { useState } from "react";
import "./POS.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

const categories = ["All", "Beverages", "Chips", "Clothing", "Electronics", "Groceries", "Snacks", "Stationery"];

const products = [
  { id: 1, name: "TakaTak", price: 25, stock: 1017, gst: 18, category: "Chips" },
  { id: 2, name: "Chocolate Bar", price: 50, stock: 83, gst: 18, category: "Snacks" },
  { id: 3, name: "Cold Drink (500ml)", price: 40, stock: 80, gst: 28, category: "Beverages" },
  { id: 4, name: "Mineral Water (1L)", price: 20, stock: 200, gst: 18, category: "Beverages" },
  { id: 5, name: "Pen Set (10 pcs)", price: 120, stock: 50, gst: 12, category: "Stationery" },
  { id: 6, name: "Notebook (200 pages)", price: 60, stock: 100, gst: 12, category: "Stationery" },
  { id: 7, name: "Sports Shoes", price: 1999, stock: 0, gst: 12, category: "Clothing" },
  { id: 8, name: "Denim Jeans", price: 1299, stock: 20, gst: 12, category: "Clothing" },
  { id: 9, name: "Cotton T-Shirt", price: 499, stock: 30, gst: 12, category: "Clothing" },
  { id: 10, name: "LED Bulb 9W", price: 120, stock: 60, gst: 18, category: "Electronics" },
  { id: 11, name: "Extension Board 4-Way", price: 450, stock: 20, gst: 18, category: "Electronics" },
  { id: 12, name: "Basmati Rice (5kg)", price: 450, stock: 50, gst: 5, category: "Groceries" },
];

export default function POS() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstTotal = cart.reduce(
    (sum, item) => sum + (item.price * item.qty * item.gst) / 100,
    0
  );
  const total = subtotal + gstTotal;

  return (
    <div className="page-container billing-page">
      <PageHeader title="Point of Sale" />
      <div className="billing-layout">
        <div className="items-panel">
          <div className="searchbox billing-searchbox">
            <svg className="searchbox-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="searchbox-input"
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: "100%" }}
            />
          </div>

          <div className="cat-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="item-grid">
            {filtered.map((product) => (
              <div
                key={product.id}
                className={`item-card ${product.stock === 0 ? "out-of-stock" : ""}`}
                onClick={() => addToCart(product)}
              >
                <div className="item-thumb">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="item-details">
                  <span className="item-name">{product.name}</span>
                  <div className="item-price-row">
                    <span className="item-price">₹{product.price}</span>
                    {product.stock > 0 ? (
                      <span className="tag tag-green">{product.stock} in stock</span>
                    ) : (
                      <span className="tag tag-red">Out</span>
                    )}
                  </div>
                  <span className="item-gst">GST: {product.gst}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-panel">
          <div className="order-top">
            <h3>Current Order</h3>
            <span className="order-count">{cart.length} item(s)</span>
          </div>

          <div className="order-items">
            {cart.length === 0 ? (
              <div className="order-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Cart is empty</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="order-line">
                  <div className="order-line-info">
                    <span className="order-line-name">{item.name}</span>
                    <span className="order-line-qty">
                      {item.qty} × ₹{item.price}
                    </span>
                  </div>
                  <div className="order-line-actions">
                    <span className="order-line-total">
                      ₹{item.qty * item.price}
                    </span>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>GST</span>
              <span>₹{Math.round(gstTotal)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{Math.round(total)}</span>
            </div>
            <button className="checkout-btn">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
