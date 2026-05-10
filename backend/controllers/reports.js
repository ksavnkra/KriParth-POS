const Sale = require("../models/invoice");
const Expense = require("../models/expense");

// Helper to build a date match object from query params
const buildDateMatch = (startDate, endDate, field = "createdAt") => {
	const match = {};
	if (startDate) {
		const s = new Date(startDate);
		if (!isNaN(s)) match[field] = { ...(match[field] || {}), $gte: s };
	}
	if (endDate) {
		// include the whole end day by setting time to end of day
		const e = new Date(endDate);
		if (!isNaN(e)) {
			e.setHours(23, 59, 59, 999);
			match[field] = { ...(match[field] || {}), $lte: e };
		}
	}
	return match;
};

const getDashboardStats = async (req, res) => {
	try {
		// compute revenue for today and month
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

		const todaysRevenueAgg = await Sale.aggregate([
			{ $match: { createdAt: { $gte: startOfToday, $lte: endOfToday }, status: "completed" } },
			{ $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
		]);

		const monthlyRevenueAgg = await Sale.aggregate([
			{ $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
			{ $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
		]);

		const todaysExpensesAgg = await Expense.aggregate([
			{ $match: { date: { $gte: startOfToday, $lte: endOfToday } } },
			{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
		]);

		const monthlyExpensesAgg = await Expense.aggregate([
			{ $match: { date: { $gte: startOfMonth } } },
			{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
		]);

		const latestSales = await Sale.find().sort({ createdAt: -1 }).limit(5).populate("cashier", "name");

		// last billed info
		const lastSale = await Sale.findOne().sort({ createdAt: -1 }).populate("cashier", "name email");

		res.status(200).json({
			success: true,
			data: {
				revenue: {
					today: todaysRevenueAgg[0]?.total || 0,
					month: monthlyRevenueAgg[0]?.total || 0,
				},
				expenses: {
					today: todaysExpensesAgg[0]?.total || 0,
					month: monthlyExpensesAgg[0]?.total || 0,
				},
				latestSales,
				lastSale,
			},
		});
	} catch (err) {
		console.error("Dashboard stats error:", err.message);
		res.status(500).json({ success: false, error: { message: "Failed to load dashboard stats" } });
	}
};

const getSalesReport = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const match = { status: "completed", ...buildDateMatch(startDate, endDate, "createdAt") };

		const sales = await Sale.find(match).sort({ createdAt: -1 }).limit(100);

		// build a summary
		const summaryAgg = await Sale.aggregate([
			{ $match: match },
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: "$grandTotal" },
					totalDiscount: { $sum: "$discount" },
				},
			},
		]);

		const s = summaryAgg[0] || { totalSales: 0, totalRevenue: 0, totalDiscount: 0 };

		const summary = {
			totalSales: s.totalSales || 0,
			totalRevenue: s.totalRevenue || 0,
			totalDiscount: s.totalDiscount || 0,
			avgOrderValue: s.totalSales ? Math.round((s.totalRevenue || 0) / s.totalSales) : 0,
		};

		res.status(200).json({ success: true, data: { summary, sales } });
	} catch (err) {
		console.error("Sales report error:", err.message);
		res.status(500).json({ success: false, error: { message: "Failed to load sales report" } });
	}
};

const getRevenueReport = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const match = buildDateMatch(startDate, endDate, "createdAt");

		// revenue by day
		const revenue = await Sale.aggregate([
			{ $match: { status: "completed", ...match } },
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					total: { $sum: "$grandTotal" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: -1 } },
			{ $limit: 100 },
		]);

		// summary totals for the period
		const totalsAgg = await Sale.aggregate([
			{ $match: { status: "completed", ...match } },
			{ $group: { _id: null, totalRevenue: { $sum: "$grandTotal" }, totalItems: { $sum: { $sum: "$items.quantity" } } } },
		]);

		const totals = totalsAgg[0] || { totalRevenue: 0, totalItems: 0 };

		const profit = {
			totalRevenue: totals.totalRevenue || 0,
			grossProfit: Math.round(totals.totalRevenue || 0) || 0,
			totalItems: totals.totalItems || 0,
		};

		res.status(200).json({ success: true, data: { profit, revenue } });
	} catch (err) {
		console.error("Revenue report error:", err.message);
		res.status(500).json({ success: false, error: { message: "Failed to load revenue report" } });
	}
};

const getTopProducts = async (req, res) => {
	try {
		const { startDate, endDate, limit = 10 } = req.query;
		const match = buildDateMatch(startDate, endDate, "createdAt");

		const products = await Sale.aggregate([
			{ $match: { status: "completed", ...match } },
			{ $unwind: "$items" },
			{
				$group: {
					_id: "$items.product",
					productName: { $first: "$items.name" },
					totalQuantity: { $sum: "$items.quantity" },
					totalRevenue: { $sum: "$items.total" },
				},
			},
			{ $sort: { totalQuantity: -1 } },
			{ $limit: parseInt(limit) },
		]);

		res.status(200).json({ success: true, data: products });
	} catch (err) {
		console.error("Top products error:", err.message);
		res.status(500).json({ success: false, error: { message: "Failed to load top products" } });
	}
};

const getCashierPerformance = async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const match = buildDateMatch(startDate, endDate, "createdAt");

		const perf = await Sale.aggregate([
			{ $match: { status: "completed", ...match } },
			{
				$group: {
					_id: "$cashier",
					totalRevenue: { $sum: "$grandTotal" },
					totalSales: { $sum: 1 },
					avgOrderValue: { $avg: "$grandTotal" },
				},
			},
			{ $sort: { totalRevenue: -1 } },
		]);

		// populate cashier names by mapping ids (fast path)
		const populated = await Sale.populate(perf, { path: "_id", model: "User", select: "name" });

		const result = populated.map((p) => ({
			cashierName: p._id?.name || "Unknown",
			totalSales: p.totalSales || 0,
			totalRevenue: p.totalRevenue || 0,
			avgOrderValue: Math.round(p.avgOrderValue || 0),
		}));

		res.status(200).json({ success: true, data: result });
	} catch (err) {
		console.error("Cashier perf error:", err.message);
		res.status(500).json({ success: false, error: { message: "Failed to load cashier performance" } });
	}
};

module.exports = { getSalesReport, getRevenueReport, getTopProducts, getCashierPerformance, getDashboardStats };
