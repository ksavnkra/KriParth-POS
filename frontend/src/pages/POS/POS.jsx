import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import "./POS.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

export default function POS() {
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [editingQty, setEditingQty] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [splitAmounts, setSplitAmounts] = useState({ cash: 0, card: 0, upi: 0 });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const qtyEditRef = useRef(null);

  const handleSplitChange = (field, val) => {
    const roundedTotal = Math.round(total);
    const othersSum = Object.keys(splitAmounts)
      .filter(k => k !== field)
      .reduce((s, k) => s + splitAmounts[k], 0);
    
    const maxAllowed = Math.max(0, roundedTotal - othersSum);
    const finalVal = Math.min(Number(val), maxAllowed);
    
    setSplitAmounts(prev => ({ ...prev, [field]: finalVal }));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products", { params: { limit: 100 } });
      const prods = res.data.data.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        gst: 18,
        category: p.category?.name || "Uncategorized",
        sku: p.sku,
      }));
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      const catNames = res.data.data.map((c) => c.name);
      setCategories(["All", ...catNames]);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

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
        if (existing.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const newQty = Math.min(item.qty + delta, item.stock);
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0),
    );
  };

  const setCartQty = (productId, newQty) => {
    if (!newQty || newQty < 1) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item;
          return { ...item, qty: Math.min(newQty, item.stock) };
        }),
      );
    }
    setEditingQty(null);
  };

  const startEditing = (itemId, currentQty) => {
    setEditingQty(itemId);
    setEditingValue(String(currentQty));
    setTimeout(() => {
      if (qtyEditRef.current) {
        qtyEditRef.current.focus();
        qtyEditRef.current.select();
      }
    }, 0);
  };

  // Inclusive Tax Math
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const netSubtotal = cart.reduce(
    (sum, item) => sum + (item.price * item.qty) / (1 + (item.gst || 0) / 100),
    0
  );
  const gstTotal = total - netSubtotal;
  // Keep old variable name map for compatibility with form bindings below:
  const subtotal = netSubtotal; 

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setCheckoutMsg("");

    try {
      // prepare payment details
      let paymentDetails = { cashAmount: 0, cardAmount: 0, upiAmount: 0, transactionId: "" };
      let pmode = paymentMode;

      if (paymentMode === 'split') {
        const sum = splitAmounts.cash + splitAmounts.card + splitAmounts.upi;
        const roundedT = Math.round(total);
        if (Math.abs(sum - roundedT) > 0.5) {
          setCheckoutMsg(`Split total (₹${sum}) must match bill total (₹${roundedT})`);
          setCheckingOut(false);
          return;
        }
        paymentDetails = { cashAmount: splitAmounts.cash, cardAmount: splitAmounts.card, upiAmount: splitAmounts.upi, transactionId: '' };
        pmode = 'split';
      } else {
        paymentDetails = { cashAmount: paymentMode === 'cash' ? Math.round(total) : 0, cardAmount: paymentMode === 'card' ? Math.round(total) : 0, upiAmount: paymentMode === 'upi' ? Math.round(total) : 0, transactionId: '' };
      }

      const salePayload = {
        items: cart.map((item) => ({ product: item.id, quantity: item.qty, discount: 0 })),
        taxRate: 18,
        paymentMode: pmode,
        discount: 0,
        paymentDetails,
        customerName,
        customerPhone,
      };

      const res = await API.post("/sales", salePayload);
      const inv = res.data.data.invoiceNumber;
      setCheckoutMsg(`Sale completed! Invoice: ${inv}`);
      setCart([]);
      setShowPaymentModal(false);
      fetchProducts();

      setTimeout(() => setCheckoutMsg(""), 4000);
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Checkout failed";
      setCheckoutMsg(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="page-container billing-page">
      <PageHeader title="Point of Sale" />
      <div className="billing-layout">
        <div className="items-panel">
          <div className="searchbox billing-searchbox">
            <span className="searchbox-icon">🔍</span>
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
            {filtered.length === 0 && (
              <div className="no-data" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
                {products.length === 0 ? "No products found. Add products first." : "No matching products."}
              </div>
            )}
            {filtered.map((product) => (
              <div
                key={product.id}
                className={`item-card ${product.stock === 0 ? "out-of-stock" : ""}`}
                onClick={() => addToCart(product)}
              >
                <div className="item-thumb">
                  <span className="thumb-icon">📦</span>
                </div>
                <div className="item-details">
                  <span className="item-name">{product.name}</span>
                  <div className="item-price-row">
                    <span className="item-price">₹{product.price}</span>
                    {product.stock > 0 ? (
                      <span className="tag tag-green">
                        {product.stock} in stock
                      </span>
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
                <span className="empty-cart-icon">🛒</span>
                <span>Cart is empty</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="order-line">
                  <div className="order-line-info">
                    <span className="order-line-name">{item.name}</span>
                    <span className="order-line-price">₹{item.price} each</span>
                  </div>
                  <div className="order-line-controls">
                    <button
                      className="qty-adj-btn"
                      onClick={() => updateCartQty(item.id, -1)}
                    >
                      −
                    </button>
                    {editingQty === item.id ? (
                      <input
                        ref={qtyEditRef}
                        type="number"
                        className="order-line-qty-input"
                        min="0"
                        value={editingValue}
                        onChange={(e) =>
                          setEditingValue(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            setCartQty(item.id, parseInt(editingValue, 10));
                          if (e.key === "Escape") setEditingQty(null);
                        }}
                        onBlur={() =>
                          setCartQty(item.id, parseInt(editingValue, 10))
                        }
                      />
                    ) : (
                      <span
                        className="order-line-qty-value"
                        onClick={() => startEditing(item.id, item.qty)}
                      >
                        {item.qty}
                      </span>
                    )}
                    <button
                      className="qty-adj-btn"
                      onClick={() => updateCartQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="order-line-total">
                    ₹{item.qty * item.price}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Math.round(total)}</span>
            </div>
            <div className="summary-row" style={{ fontSize: '13px', opacity: 0.8 }}>
              <span>(Incl. Tax Estimate)</span>
              <span>₹{Math.round(gstTotal)}</span>
            </div>
            <div className="summary-row summary-total" style={{ borderTop: '2px solid #eee', paddingTop: '10px', marginTop: '5px' }}>
              <span>Total Payable</span>
              <span>₹{Math.round(total)}</span>
            </div>

            {checkoutMsg && (
              <p className={`checkout-msg ${checkoutMsg.includes("completed") ? "checkout-success" : "checkout-error"}`}>
                {checkoutMsg}
              </p>
            )}

            <button
              className={`checkout-btn ${cart.length > 0 ? "checkout-btn-active" : ""}`}
              id="checkout-btn"
              onClick={() => cart.length > 0 && setShowPaymentModal(true)}
              disabled={cart.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Complete Payment</h3>
            <div className="modal-total">
              <span>Total Amount</span>
              <span className="modal-total-value">₹{Math.round(total)}</span>
            </div>
            <div className="payment-options">
              {["cash", "upi", "card"].map((mode) => (
                <button
                  key={mode}
                  className={`payment-option ${paymentMode === mode ? "payment-selected" : ""}`}
                  onClick={() => setPaymentMode(mode)}
                >
                  {mode === "cash" && "💵"} {mode === "upi" && "📱"} {mode === "card" && "💳"}
                  {" "}{mode.toUpperCase()}
                </button>
              ))}

              <button
                className={`payment-option ${paymentMode === 'split' ? 'payment-selected' : ''}`}
                onClick={() => setPaymentMode('split')}
              >
                🔀 Split
              </button>
            </div>

            {paymentMode === 'split' && (
              <div className="split-payment-container">
                <div className="split-payment-row">
                  <label className="split-payment-label">Cash</label>
                  <input className="split-payment-input" type="number" min="0" placeholder="0" value={splitAmounts.cash || ''} onChange={(e) => handleSplitChange('cash', e.target.value)} />
                </div>
                <div className="split-payment-row">
                  <label className="split-payment-label">Card</label>
                  <input className="split-payment-input" type="number" min="0" placeholder="0" value={splitAmounts.card || ''} onChange={(e) => handleSplitChange('card', e.target.value)} />
                </div>
                <div className="split-payment-row">
                  <label className="split-payment-label">UPI</label>
                  <input className="split-payment-input" type="number" min="0" placeholder="0" value={splitAmounts.upi || ''} onChange={(e) => handleSplitChange('upi', e.target.value)} />
                </div>
                <div className="split-payment-total">
                  Total Entered: <span style={{ color: Math.abs((splitAmounts.cash + splitAmounts.card + splitAmounts.upi) - total) < 0.5 ? '#27ae60' : '#e74c3c' }}>
                    ₹{(splitAmounts.cash + splitAmounts.card + splitAmounts.upi).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="customer-details-row">
              <div className="customer-field-wrap">
                <label className="customer-field-label">Customer Name</label>
                <input 
                  className="customer-field-input" 
                  placeholder="Walk-in / Optional"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="customer-field-wrap">
                <label className="customer-field-label">Phone / Number</label>
                <input 
                  className="customer-field-input" 
                  placeholder="98765xxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button
                className="modal-confirm"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
