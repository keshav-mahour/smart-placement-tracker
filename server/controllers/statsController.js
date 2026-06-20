const Company = require('../models/Company');
const Resume = require('../models/Resume');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user data (for readiness calculations)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Fetch all company records for this user
    const companies = await Company.find({ userId });

    const totalApps = companies.length;

    // Filter statuses
    const offersReceived = companies.filter(c => c.status === 'Selected').length;
    const rejections = companies.filter(c => c.status === 'Rejected').length;
    
    // Future event dates
    const now = new Date();
    const upcomingOAs = companies.filter(c => c.testDate && new Date(c.testDate) > now).length;
    const interviewsScheduled = companies.filter(c => c.interviewDate && new Date(c.interviewDate) > now).length;

    // Packages (Average and Max)
    let highestPackage = 0;
    let avgPackage = 0;
    if (totalApps > 0) {
      highestPackage = Math.max(...companies.map(c => c.package || 0));
      const totalPkg = companies.reduce((acc, curr) => acc + (curr.package || 0), 0);
      avgPackage = parseFloat((totalPkg / totalApps).toFixed(2));
    }

    // Success Rate: Selected / (Selected + Rejected) or Selected / Total
    let successRate = 0;
    const closedApps = offersReceived + rejections;
    if (closedApps > 0) {
      successRate = Math.round((offersReceived / closedApps) * 100);
    } else if (totalApps > 0) {
      successRate = Math.round((offersReceived / totalApps) * 100);
    }

    // 3. Application Funnel & Status Distribution
    const funnelStages = {
      'Applied': 0,
      'Online Assessment': 0,
      'Technical Interview': 0,
      'HR Interview': 0,
      'Selected': 0,
      'Rejected': 0
    };

    companies.forEach(c => {
      if (funnelStages[c.status] !== undefined) {
        funnelStages[c.status]++;
      }
    });

    const funnelData = Object.keys(funnelStages).map(stage => ({
      stage,
      count: funnelStages[stage]
    }));

    // 4. Monthly Applications (Group by month and year)
    const monthlyGroups = {};
    companies.forEach(c => {
      const date = new Date(c.createdAt || Date.now());
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyGroups[monthYear] = (monthlyGroups[monthYear] || 0) + 1;
    });

    // Format monthly data for charts (sort chronological or keep last 6 months)
    const monthlyData = Object.keys(monthlyGroups).map(my => ({
      month: my,
      count: monthlyGroups[my]
    })).slice(-6); // Last 6 months

    if (monthlyData.length === 0) {
      monthlyData.push({ month: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }), count: 0 });
    }

    // 5. Calculate Placement Readiness Score
    // - DSA Progress (30%) - Target 300 problems
    const dsaProblems = user.readinessLog?.dsaProblems || 0;
    const dsaScore = Math.min((dsaProblems / 300) * 30, 30);

    // - Projects (25%) - Target 3 projects
    const projectsCount = user.readinessLog?.projectsCount || 0;
    const projectsScore = Math.min((projectsCount / 3) * 25, 25);

    // - Resume Strength (20%) - Target 100 (highest score among user's resumes)
    const resumes = await Resume.find({ userId });
    const maxResumeScore = resumes.length > 0 ? Math.max(...resumes.map(r => r.score || 0)) : 0;
    const resumeScore = Math.min((maxResumeScore / 100) * 20, 20);

    // - Applications (15%) - Target 10 applications
    const appsScore = Math.min((totalApps / 10) * 15, 15);

    // - Mock Interviews (10%) - Target 5 mock interviews
    const mocksCount = user.readinessLog?.mocksCount || 0;
    const mocksScore = Math.min((mocksCount / 5) * 10, 10);

    const overallReadiness = Math.round(dsaScore + projectsScore + resumeScore + appsScore + mocksScore);

    res.json({
      success: true,
      data: {
        cards: {
          totalApps,
          upcomingOAs,
          interviewsScheduled,
          offersReceived,
          highestPackage,
          avgPackage,
          successRate
        },
        charts: {
          funnel: funnelData,
          monthly: monthlyData,
          statusDistribution: [
            { name: 'Applied', value: funnelStages['Applied'] },
            { name: 'Online Assessment', value: funnelStages['Online Assessment'] },
            { name: 'Technical Interview', value: funnelStages['Technical Interview'] },
            { name: 'HR Interview', value: funnelStages['HR Interview'] },
            { name: 'Offers', value: funnelStages['Selected'] },
            { name: 'Rejected', value: funnelStages['Rejected'] }
          ].filter(item => item.value > 0) // filter out zero values for visual elegance
        },
        readiness: {
          score: overallReadiness,
          breakdown: {
            dsa: { score: Math.round(dsaScore), max: 30, current: dsaProblems, target: 300 },
            projects: { score: Math.round(projectsScore), max: 25, current: projectsCount, target: 3 },
            resume: { score: Math.round(resumeScore), max: 20, current: maxResumeScore, target: 100 },
            applications: { score: Math.round(appsScore), max: 15, current: totalApps, target: 10 },
            mocks: { score: Math.round(mocksScore), max: 10, current: mocksCount, target: 5 }
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats
};
