import "./Products.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

const products = [
  {
    id: 1,
    name: "TakaTak",
    unit: "pcs",
    category: "Chips",
    price: 25,
    cost: 12.71,
    gst: 18,
    stock: 1017,
  },
  {
    id: 2,
    name: "Chocolate Bar",
    unit: "pcs",
    category: "Snacks",
    price: 50,
    cost: 35,
    gst: 18,
    stock: 83,
  },
  {
    id: 3,
    name: "Cold Drink (500ml)",
    unit: "bottle",
    category: "Beverages",
    price: 40,
    cost: 28,
    gst: 28,
    stock: 80,
  },
  {
    id: 4,
    name: "Mineral Water (1L)",
    unit: "bottle",
    category: "Beverages",
    price: 20,
    cost: 12,
    gst: 18,
    stock: 200,
  },
  {
    id: 5,
    name: "Pen Set (10 pcs)",
    unit: "set",
    category: "Stationery",
    price: 120,
    cost: 65,
    gst: 12,
    stock: 50,
  },
  {
    id: 6,
    name: "Notebook (200 pages)",
    unit: "pcs",
    category: "Stationery",
    price: 60,
    cost: 35,
    gst: 12,
    stock: 100,
  },
  {
    id: 7,
    name: "Sports Shoes",
    unit: "pair",
    category: "Clothing",
    price: 1999,
    cost: 1200,
    gst: 12,
    stock: 0,
  },
  {
    id: 8,
    name: "Denim Jeans",
    unit: "pcs",
    category: "Clothing",
    price: 1299,
    cost: 750,
    gst: 12,
    stock: 20,
  },
  {
    id: 9,
    name: "Cotton T-Shirt",
    unit: "pcs",
    category: "Clothing",
    price: 499,
    cost: 280,
    gst: 12,
    stock: 30,
  },
  {
    id: 10,
    name: "LED Bulb 9W",
    unit: "pcs",
    category: "Electronics",
    price: 120,
    cost: 70,
    gst: 18,
    stock: 60,
  },
  {
    id: 11,
    name: "Extension Board 4-Way",
    unit: "pcs",
    category: "Electronics",
    price: 450,
    cost: 280,
    gst: 18,
    stock: 20,
  },
  {
    id: 12,
    name: "Basmati Rice (5kg)",
    unit: "pcs",
    category: "Groceries",
    price: 450,
    cost: 350,
    gst: 5,
    stock: 50,
  },
];

export default function Products() {
  return (
    <div className="page-container">
      <PageHeader title="Products" />
      <div className="page-content">
        <div className="toolbar">
          <div className="searchbox">
            <span className="searchbox-icon">🔍</span>
            <input
              type="text"
              className="searchbox-input"
              placeholder="Search products..."
            />
          </div>
          <button className="btn-add">+ Add Product</button>
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
                      <div className="prod-icon">📦</div>
                      <div>
                        <div className="prod-name">{product.name}</div>
                        <div className="prod-unit">{product.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="cat-tag">{product.category}</span>
                  </td>
                  <td className="td-bold">₹{product.price}</td>
                  <td className="td-bold">₹{product.cost}</td>
                  <td>
                    <span className="gst-val">{product.gst}%</span>
                  </td>
                  <td>
                    <span
                      className={`tag ${product.stock > 0 ? "tag-green" : "tag-red"}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" aria-label="Edit product">
                        ✏️
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        aria-label="Delete product"
                      >
                        🗑️
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
