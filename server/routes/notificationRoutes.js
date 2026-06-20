const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead, markAllRead, clearAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(clearAllNotifications);

router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);

module.exports = router;
