const Stock = require('../models/stock');
const Product = require('../models/product');
const InventoryLog = require('../models/inventory');

// GET /api/v1/stock
const getStockEntries = async (req, res) => {
  try {
    const { product, startDate, endDate } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const entries = await Stock.find(filter)
      .populate('product', 'name category')
      .populate('addedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// POST /api/v1/stock
const addStock = async (req, res) => {
  try {
    const { product: productId, quantity, totalCost, sellerName, sellerGstNumber, gstPercentage, gstType, invoiceNumber, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });

    const prevStock = product.stock;

    const stock = await Stock.create({
      product: productId,
      quantity: Number(quantity),
      totalCost: Number(totalCost),
      sellerName: sellerName || 'Unknown Seller',
      sellerGstNumber: sellerGstNumber || '',
      gstPercentage: gstPercentage !== undefined ? Number(gstPercentage) : (product.gstPercentage || 18),
      gstType: gstType || 'cgst_sgst',
      invoiceNumber: invoiceNumber || '',
      notes: notes || '',
      addedBy: req.user._id
    });

    // Update product stock quantity and cost price
    product.stock += Number(quantity);
    // reference sets costPrice to stock.baseAmount / quantity (exclusive of GST cost base)
    // await stock.save() calls pre hook and populates baseAmount. But mongoose .create actually runs hooks already!
    const baseRate = Number(stock.gstPercentage) || 0;
    const calcBaseAmount = Number(totalCost) / (1 + baseRate / 100);
    product.costPrice = Number((calcBaseAmount / Number(quantity)).toFixed(2));
    
    await product.save();

    // Critical Bridge: Also log in core Inventory Log audit trail
    await InventoryLog.create({
      product: productId,
      type: "purchase",
      quantity: Number(quantity),
      previousStock: prevStock,
      newStock: product.stock,
      reason: `Stock Purchase from ${sellerName} (Inv: ${invoiceNumber || 'N/A'})`,
      performedBy: req.user._id,
      reference: stock._id
    });

    const populated = await Stock.findById(stock._id)
      .populate('product', 'name category')
      .populate('addedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Add Stock Error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// GET /api/v1/stock/summary
const getStockSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthStocks = await Stock.find({ createdAt: { $gte: startOfMonth } }).populate('product', 'name category');

    const totalPurchases = monthStocks.reduce((s, st) => s + st.totalCost, 0);
    const totalGstPaid = monthStocks.reduce((s, st) => s + st.gstAmount, 0);
    const totalQuantity = monthStocks.reduce((s, st) => s + st.quantity, 0);

    // By seller
    const bySeller = {};
    monthStocks.forEach(st => {
      const sName = st.sellerName || "Unknown";
      if (!bySeller[sName]) bySeller[sName] = { total: 0, gst: 0, entries: 0 };
      bySeller[sName].total += st.totalCost;
      bySeller[sName].gst += st.gstAmount;
      bySeller[sName].entries += 1;
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        totalPurchases: Math.round(totalPurchases), 
        totalGstPaid: Math.round(totalGstPaid), 
        totalQuantity, 
        bySeller, 
        entries: monthStocks.length 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// DELETE /api/v1/stock/:id (Hard delete & Reverse Product Stock)
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ success: false, error: { message: "Stock entry not found" } });

    const product = await Product.findById(stock.product);
    if (product) {
      // Reverse quantities using direct update bypassing instance validation roadblocks.
      const newStock = Math.max(0, product.stock - stock.quantity);
      await Product.findByIdAndUpdate(product._id, { stock: newStock });

      // Clean corresponding log
      await InventoryLog.deleteOne({ reference: stock._id });
    }

    await Stock.findByIdAndDelete(stock._id);

    res.status(200).json({ success: true, data: { message: "Stock record deleted and inventory adjusted." } });
  } catch (error) {
    console.error("Delete Stock Error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = { getStockEntries, addStock, getStockSummary, deleteStock };
