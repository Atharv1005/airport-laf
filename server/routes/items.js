const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { upload } = require('../services/cloudinaryService');

router.use(protect);

router.get('/stats', itemController.getStats);
router.post('/ai-suggest', itemController.aiSuggest);

router.route('/')
  .get(itemController.getItems)
  .post(upload.single('image'), itemController.createItem);

router.route('/:id')
  .get(itemController.getItem)
  .patch(upload.single('image'), itemController.updateItem);

router.patch('/:id/status', itemController.updateStatus);

module.exports = router;
