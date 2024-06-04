const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/enable', authMiddleware, mfaController.enableMfa);

router.post('/verify', mfaController.verifyMfa);

router.post('/disable', authMiddleware, mfaController.disableMfa);

router.get('/check', authMiddleware, mfaController.checkMfa);

module.exports = router;
