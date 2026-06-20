const Company = require('../models/Company');

// @desc    Get all company applications for user
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new company application
// @route   POST /api/companies
// @access  Private
const addCompany = async (req, res) => {
  const { name, role, package, deadline, status, category, difficulty, resumeId, notes, testDate, interviewDate } = req.body;

  try {
    const company = await Company.create({
      userId: req.user._id,
      name,
      role,
      package,
      deadline,
      status: status || 'Applied',
      category,
      difficulty: difficulty || 'Medium',
      resumeId: resumeId || null,
      notes: notes || '',
      testDate: testDate || null,
      interviewDate: interviewDate || null
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update company application details / Kanban status
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company application not found' });
    }

    // Check ownership
    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this application' });
    }

    // Reset reminder flags if dates are changed
    if (req.body.testDate && req.body.testDate !== (company.testDate ? company.testDate.toISOString() : null)) {
      if (!req.body.reminders) req.body.reminders = { ...company.reminders };
      req.body.reminders.oaSent = false;
    }
    if (req.body.interviewDate && req.body.interviewDate !== (company.interviewDate ? company.interviewDate.toISOString() : null)) {
      if (!req.body.reminders) req.body.reminders = { ...company.reminders };
      req.body.reminders.interviewSent = false;
    }
    if (req.body.deadline && req.body.deadline !== company.deadline.toISOString()) {
      if (!req.body.reminders) req.body.reminders = { ...company.reminders };
      req.body.reminders.deadlineSent = false;
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete company application
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company application not found' });
    }

    // Check ownership
    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this application' });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanies,
  addCompany,
  updateCompany,
  deleteCompany
};
