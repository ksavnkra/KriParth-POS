const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getStockEntries, addStock, getStockSummary, deleteStock } = require('../controllers/stock');

router.use(verifyToken);

router.get('/', getStockEntries);
router.post('/', addStock);
router.get('/summary', getStockSummary);
router.delete('/:id', deleteStock);

module.exports = router;
