const express = require('express');
const router = express.Router();
const { addExperience, getExperiences, getExperienceStats } = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(addExperience)
  .get(getExperiences);

router.get('/stats', getExperienceStats);

module.exports = router;
