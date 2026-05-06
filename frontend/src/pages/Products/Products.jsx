import "./Products.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

const products = [
  { id: 1, name: "TakaTak", unit: "pcs", category: "Chips", price: 25, cost: 12.71, gst: 18, stock: 1017 },
  { id: 2, name: "Chocolate Bar", unit: "pcs", category: "Snacks", price: 50, cost: 35, gst: 18, stock: 83 },
  { id: 3, name: "Cold Drink (500ml)", unit: "bottle", category: "Beverages", price: 40, cost: 28, gst: 28, stock: 80 },
  { id: 4, name: "Mineral Water (1L)", unit: "bottle", category: "Beverages", price: 20, cost: 12, gst: 18, stock: 200 },
  { id: 5, name: "Pen Set (10 pcs)", unit: "set", category: "Stationery", price: 120, cost: 65, gst: 12, stock: 50 },
  { id: 6, name: "Notebook (200 pages)", unit: "pcs", category: "Stationery", price: 60, cost: 35, gst: 12, stock: 100 },
  { id: 7, name: "Sports Shoes", unit: "pair", category: "Clothing", price: 1999, cost: 1200, gst: 12, stock: 0 },
  { id: 8, name: "Denim Jeans", unit: "pcs", category: "Clothing", price: 1299, cost: 750, gst: 12, stock: 20 },
  { id: 9, name: "Cotton T-Shirt", unit: "pcs", category: "Clothing", price: 499, cost: 280, gst: 12, stock: 30 },
  { id: 10, name: "LED Bulb 9W", unit: "pcs", category: "Electronics", price: 120, cost: 70, gst: 18, stock: 60 },
  { id: 11, name: "Extension Board 4-Way", unit: "pcs", category: "Electronics", price: 450, cost: 280, gst: 18, stock: 20 },
  { id: 12, name: "Basmati Rice (5kg)", unit: "pcs", category: "Groceries", price: 450, cost: 350, gst: 5, stock: 50 },
];

export default function Products() {
  return (
    <div className="page-container">
      <PageHeader title="Products" />
      <div className="page-content">
        <div className="toolbar">
          <div className="searchbox">
            <svg className="searchbox-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="searchbox-input"
              placeholder="Search products..."
            />
          </div>
          <button className="btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>

        <div className="table-card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>GST %</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="prod-cell">
                      <div className="prod-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                      </div>
                      <div>
                        <div className="prod-name">{product.name}</div>
                        <div className="prod-unit">{product.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="cat-tag">{product.category}</span></td>
                  <td className="td-bold">₹{product.price}</td>
                  <td className="td-bold">₹{product.cost}</td>
                  <td><span className="gst-val">{product.gst}%</span></td>
                  <td>
                    <span className={`tag ${product.stock > 0 ? "tag-green" : "tag-red"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" aria-label="Edit product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="icon-btn icon-btn-danger" aria-label="Delete product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
