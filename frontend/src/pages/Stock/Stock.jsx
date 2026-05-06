import "./Stock.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";

const purchaseHistory = [
  { id: 1, product: "TakaTak", category: "Chips", seller: "BevCafe", sellerGst: "76843321", qty: 1050, unitPrice: 15.00, gst: 18, gstType: "CGST+SGST", gstAmt: 2403, cgst: 1201, sgst: 1201, total: 15750, date: "27/2/2026" },
  { id: 2, product: "Toor Dal (1kg)", category: "Groceries", seller: "Metro Cash & Carry", sellerGst: "07AABCM5678B2Z1", qty: 32, unitPrice: 136.50, gst: 5, gstType: "CGST+SGST", gstAmt: 208, cgst: 104, sgst: 104, total: 4368, date: "27/2/2026" },
  { id: 3, product: "Sunflower Oil (1L)", category: "Groceries", seller: "Local Supplier", sellerGst: "", qty: 33, unitPrice: 157.50, gst: 5, gstType: "CGST+SGST", gstAmt: 248, cgst: 124, sgst: 124, total: 5198, date: "27/2/2026" },
  { id: 4, product: "Sugar (1kg)", category: "Groceries", seller: "Reliance Wholesale", sellerGst: "27AABCR1234A1Z5", qty: 51, unitPrice: 42.00, gst: 5, gstType: "IGST", gstAmt: 102, cgst: 0, sgst: 0, total: 2142, date: "27/2/2026" },
  { id: 5, product: "Wheat Flour (5kg)", category: "Groceries", seller: "Metro Cash & Carry", sellerGst: "07AABCM5678B2Z1", qty: 44, unitPrice: 194.25, gst: 5, gstType: "CGST+SGST", gstAmt: 407, cgst: 204, sgst: 204, total: 8547, date: "27/2/2026" },
  { id: 6, product: "Tea Leaves (250g)", category: "Groceries", seller: "Local Supplier", sellerGst: "", qty: 32, unitPrice: 99.75, gst: 5, gstType: "CGST+SGST", gstAmt: 152, cgst: 76, sgst: 76, total: 3192, date: "27/2/2026" },
  { id: 7, product: "Salt (1kg)", category: "Groceries", seller: "Reliance Wholesale", sellerGst: "27AABCR1234A1Z5", qty: 11, unitPrice: 18.00, gst: 0, gstType: "IGST", gstAmt: 0, cgst: 0, sgst: 0, total: 198, date: "27/2/2026" },
  { id: 8, product: "Wireless Earbuds", category: "Electronics", seller: "Metro Cash & Carry", sellerGst: "07AABCM5678B2Z1", qty: 49, unitPrice: 1003.00, gst: 18, gstType: "CGST+SGST", gstAmt: 7497, cgst: 3749, sgst: 3749, total: 49147, date: "27/2/2026" },
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
          <button className="btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Stock
          </button>
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
              {purchaseHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div>
                      <div className="cell-primary">{item.product}</div>
                      <div className="cell-sub">{item.category}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="cell-primary">{item.seller}</div>
                      {item.sellerGst && <div className="cell-muted">{item.sellerGst}</div>}
                    </div>
                  </td>
                  <td>{item.qty}</td>
                  <td>₹{item.unitPrice.toFixed(2)}</td>
                  <td>
                    <div>
                      <span className="gst-val">{item.gst}%</span>
                      <div className="cell-muted">{item.gstType}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="amt-highlight">₹{item.gstAmt.toLocaleString()}</span>
                      {item.cgst > 0 && (
                        <div className="cell-muted">C:{item.cgst} S:{item.sgst}</div>
                      )}
                      {item.gstType === "IGST" && (
                        <div className="cell-muted">I:{item.gstAmt}</div>
                      )}
                    </div>
                  </td>
                  <td className="td-bold">₹{item.total.toLocaleString()}</td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
