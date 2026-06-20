const express = require('express');
const router = express.Router();
const { getCompanies, addCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all routes below

router.route('/')
  .get(getCompanies)
  .post(addCompany);

router.route('/:id')
  .put(updateCompany)
  .delete(deleteCompany);

module.exports = router;
