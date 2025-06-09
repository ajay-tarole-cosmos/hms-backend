const express = require('express');
const controller = require('../controllers/procurement.controller');
const upload = require('../middlewares/upload'); // Multer for invoice
const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.patch('/:id/verify', controller.verify);
router.patch('/:id/approve', upload.single('invoice'), controller.approve);
router.patch('/:id/reject', controller.reject);

module.exports = router;
