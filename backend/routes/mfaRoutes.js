const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/enable', authMiddleware, mfaController.enableMfa);

router.post('/verify', authMiddleware, mfaController.verifyMfa);

module.exports = router;
