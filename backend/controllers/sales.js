const Sale = require("../models/invoice");
const Product = require("../models/product");
const InventoryLog = require("../models/inventory");
const Customer = require("../models/customer");

// helper to generate invoice number like INV-20260509-0001
const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // find how many invoices were created today
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const count = await Sale.countDocuments({ createdAt: { $gte: startOfDay } });

  const seq = String(count + 1).padStart(4, "0");
  return `INV-${dateStr}-${seq}`;
};

// POST /api/v1/sales
const createSale = async (req, res) => {
  try {
    const { items, discount, taxRate, paymentMode, paymentDetails, customer, customerName, customerPhone, notes } = req.body;

    let linkedCustomerId = customer || null;

    // Lazy auto-create or lookup customer by phone
    if (!linkedCustomerId && (customerName || customerPhone)) {
      let existing = null;
      if (customerPhone && customerPhone.trim().length > 0) {
        existing = await Customer.findOne({ contact: customerPhone.trim() });
      }
      
      if (existing) {
        linkedCustomerId = existing._id;
      } else {
        // construct sparse object
        const newPayload = { name: customerName?.trim() || "Walk-in Customer" };
        if (customerPhone && customerPhone.trim().length > 0) newPayload.contact = customerPhone.trim();
        
        try {
          const newCust = await Customer.create(newPayload);
          linkedCustomerId = newCust._id;
        } catch (err) {
          console.log("Optional customer registration skipped/failed:", err.message);
          // silent catch so sale continues regardless
        }
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "At least one item is required." },
      });
    }

    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Payment mode is required." },
      });
    }

    // build line items and validate stock
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: "PRODUCT_NOT_FOUND", message: `Product ${item.product} not found.` },
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Not enough stock for "${product.name}". Available: ${product.stock}`,
          },
        });
      }

      const itemDiscount = item.discount || 0;
      const itemTotal = (product.price * item.quantity) - itemDiscount;

      lineItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: itemDiscount,
        total: itemTotal,
      });

      subtotal += itemTotal;
    }

    const billDiscount = discount || 0;
    const tax = taxRate || 0;
    const grandTotal = subtotal - billDiscount;
    const beforeTax = tax > 0 ? grandTotal / (1 + tax / 100) : grandTotal;
    const taxAmount = grandTotal - beforeTax;

    const invoiceNumber = await generateInvoiceNumber();

    const sale = await Sale.create({
      invoiceNumber,
      items: lineItems,
      subtotal,
      taxAmount,
      taxRate: tax,
      discount: billDiscount,
      grandTotal,
      paymentMode,
      paymentDetails: paymentDetails || {},
      customer: linkedCustomerId,
      cashier: req.user._id,
      notes: notes || "",
    });

    // update stock for each product and log it
    for (const item of lineItems) {
      const product = await Product.findById(item.product);
      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await InventoryLog.create({
        product: item.product,
        type: "sale",
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock: product.stock,
        reason: `Sale ${invoiceNumber}`,
        performedBy: req.user._id,
        reference: sale._id,
      });
    }

    // if customer is linked, update their total purchases
    if (linkedCustomerId) {
      await Customer.findByIdAndUpdate(linkedCustomerId, {
        $inc: { totalPurchases: grandTotal },
      });
    }

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    console.error("Create sale error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to create sale." },
    });
  }
};

// GET /api/v1/sales
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, cashier, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const ed = new Date(endDate);
        // Set to absolute end of the selected day (23:59:59.999) to include current day items
        ed.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = ed;
      }
    }

    if (cashier) filter.cashier = cashier;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate("cashier", "name")
      .populate("customer", "name contact")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: sales,
      meta: {
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch sales." },
    });
  }
};

// GET /api/v1/sales/:id
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("cashier", "name email")
      .populate("customer", "name contact email")
      .populate("items.product", "name sku");

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Sale not found." },
      });
    }

    res.status(200).json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch sale." },
    });
  }
};

// POST /api/v1/sales/:id/refund
const refundSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Sale not found." },
      });
    }

    if (sale.status === "refunded") {
      return res.status(400).json({
        success: false,
        error: { code: "ALREADY_REFUNDED", message: "This sale has already been refunded." },
      });
    }

    sale.status = "refunded";
    await sale.save();

    // restore stock
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        product.stock += item.quantity;
        await product.save();

        await InventoryLog.create({
          product: item.product,
          type: "return",
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: product.stock,
          reason: `Refund for ${sale.invoiceNumber}`,
          performedBy: req.user._id,
          reference: sale._id,
        });
      }
    }

    // update customer total if linked
    if (sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { totalPurchases: -sale.grandTotal },
      });
    }

    res.status(200).json({
      success: true,
      data: { message: "Sale refunded successfully.", sale },
    });
  } catch (err) {
    console.error("Refund error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to process refund." },
    });
  }
};

module.exports = { createSale, getSales, getSale, refundSale };
