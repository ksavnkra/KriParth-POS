const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/users');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), getUsers);
router.patch('/:id', verifyToken, authorize('admin'), updateUser);

module.exports = router;
