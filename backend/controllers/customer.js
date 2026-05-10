const Customer = require("../models/customer");

// GET /api/v1/customers
const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: customers,
      meta: {
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch customers." },
    });
  }
};

// GET /api/v1/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Customer not found." },
      });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch customer." },
    });
  }
};

// POST /api/v1/customers
const createCustomer = async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;

    if (!name || !contact) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name and contact are required." },
      });
    }

    const existingContact = await Customer.findOne({ contact });
    if (existingContact) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_CONTACT", message: "A customer with this contact already exists." },
      });
    }

    const customer = await Customer.create({
      name,
      contact,
      email: email || "",
      address: address || "",
    });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    console.error("Create customer error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to create customer." },
    });
  }
};

// PUT /api/v1/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Customer not found." },
      });
    }

    const fields = ["name", "contact", "email", "address"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) customer[f] = req.body[f];
    });

    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to update customer." },
    });
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer };
