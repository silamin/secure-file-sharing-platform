const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);

router.get('/', fileController.listFiles);

router.get('/uploaded', authMiddleware, fileController.listUploadedFiles);

router.get('/downloaded', authMiddleware, fileController.listDownloadedFiles);

router.get('/:id', fileController.downloadFile);

router.put('/:id', authMiddleware, fileController.updateFile);

router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;
