import "./Stock.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";

const purchases = [
  {
    id: 1,
    product: "TakaTak",
    category: "Chips",
    seller: "BevCafe",
    sellerGst: "76843321",
    qty: 1050,
    unitPrice: 15.0,
    gst: 18,
    gstType: "CGST+SGST",
    gstAmt: 2403,
    cgst: 1201,
    sgst: 1201,
    total: 15750,
    date: "27/2/2026",
  },
  {
    id: 2,
    product: "Toor Dal (1kg)",
    category: "Groceries",
    seller: "Metro Cash & Carry",
    sellerGst: "07AABCM5678B2Z1",
    qty: 32,
    unitPrice: 136.5,
    gst: 5,
    gstType: "CGST+SGST",
    gstAmt: 208,
    cgst: 104,
    sgst: 104,
    total: 4368,
    date: "27/2/2026",
  },
  {
    id: 3,
    product: "Sunflower Oil (1L)",
    category: "Groceries",
    seller: "Local Supplier",
    sellerGst: "",
    qty: 33,
    unitPrice: 157.5,
    gst: 5,
    gstType: "CGST+SGST",
    gstAmt: 248,
    cgst: 124,
    sgst: 124,
    total: 5198,
    date: "27/2/2026",
  },
  {
    id: 4,
    product: "Sugar (1kg)",
    category: "Groceries",
    seller: "Reliance Wholesale",
    sellerGst: "27AABCR1234A1Z5",
    qty: 51,
    unitPrice: 42.0,
    gst: 5,
    gstType: "IGST",
    gstAmt: 102,
    cgst: 0,
    sgst: 0,
    total: 2142,
    date: "27/2/2026",
  },
  {
    id: 5,
    product: "Wheat Flour (5kg)",
    category: "Groceries",
    seller: "Metro Cash & Carry",
    sellerGst: "07AABCM5678B2Z1",
    qty: 44,
    unitPrice: 194.25,
    gst: 5,
    gstType: "CGST+SGST",
    gstAmt: 407,
    cgst: 204,
    sgst: 204,
    total: 8547,
    date: "27/2/2026",
  },
  {
    id: 6,
    product: "Tea Leaves (250g)",
    category: "Groceries",
    seller: "Local Supplier",
    sellerGst: "",
    qty: 32,
    unitPrice: 99.75,
    gst: 5,
    gstType: "CGST+SGST",
    gstAmt: 152,
    cgst: 76,
    sgst: 76,
    total: 3192,
    date: "27/2/2026",
  },
  {
    id: 7,
    product: "Salt (1kg)",
    category: "Groceries",
    seller: "Reliance Wholesale",
    sellerGst: "27AABCR1234A1Z5",
    qty: 11,
    unitPrice: 18.0,
    gst: 0,
    gstType: "IGST",
    gstAmt: 0,
    cgst: 0,
    sgst: 0,
    total: 198,
    date: "27/2/2026",
  },
  {
    id: 8,
    product: "Wireless Earbuds",
    category: "Electronics",
    seller: "Metro Cash & Carry",
    sellerGst: "07AABCM5678B2Z1",
    qty: 49,
    unitPrice: 1003.0,
    gst: 18,
    gstType: "CGST+SGST",
    gstAmt: 7497,
    cgst: 3749,
    sgst: 3749,
    total: 49147,
    date: "27/2/2026",
  },
];

export default function Stock() {
  return (
    <div className="page-container">
      <PageHeader title="Stock Management" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard label="Total Purchases" value="₹0" />
          <KPICard
            label="GST Paid (Input)"
            value={<span style={{ color: "#e74c3c" }}>₹0</span>}
          />
          <KPICard label="Items Added" value="0" />
          <KPICard
            label="Stock Entries"
            value={<span style={{ color: "#e67e22" }}>0</span>}
          />
        </div>

        <div className="toolbar">
          <h2 className="toolbar-title">Purchase History</h2>
          <button className="btn-add">+ Add Stock</button>
        </div>

        <div className="table-card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Qty</th>
                <th>₹/Unit</th>
                <th>GST</th>
                <th>GST Amt</th>
                <th>Total (Incl.)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-primary">{r.product}</div>
                    <div className="cell-sub">{r.category}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{r.seller}</div>
                    {r.sellerGst && (
                      <div className="cell-muted">{r.sellerGst}</div>
                    )}
                  </td>
                  <td>{r.qty}</td>
                  <td>₹{r.unitPrice.toFixed(2)}</td>
                  <td>
                    <span className="gst-val">{r.gst}%</span>
                    <div className="cell-muted">{r.gstType}</div>
                  </td>
                  <td>
                    <span className="amt-highlight">
                      ₹{r.gstAmt.toLocaleString()}
                    </span>
                    {r.cgst > 0 && (
                      <div className="cell-muted">
                        C:{r.cgst} S:{r.sgst}
                      </div>
                    )}
                    {r.gstType === "IGST" && (
                      <div className="cell-muted">I:{r.gstAmt}</div>
                    )}
                  </td>
                  <td className="td-bold">₹{r.total.toLocaleString()}</td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
