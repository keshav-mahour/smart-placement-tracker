const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmaps, getRoadmapDetails, deleteRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(generateRoadmap)
  .get(getRoadmaps);

router.route('/:id')
  .get(getRoadmapDetails)
  .delete(deleteRoadmap);

module.exports = router;
