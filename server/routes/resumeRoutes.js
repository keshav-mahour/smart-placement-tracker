const express = require('express');
const router = express.Router();
const { uploadResume, getResumes, getResumeDetails, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.route('/:id')
  .get(getResumeDetails)
  .delete(deleteResume);

module.exports = router;
