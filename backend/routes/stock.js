const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireAdmin, requireAdminOrManager } = require('../middleware/adminAuth');
const { getStockEntries, addStock, getStockSummary, deleteStock } = require('../controllers/stock');

router.use(verifyToken);

router.get('/', getStockEntries);
router.post('/', requireAdminOrManager, addStock);
router.get('/summary', getStockSummary);
router.delete('/:id', requireAdmin, deleteStock);

module.exports = router;
