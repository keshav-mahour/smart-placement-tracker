const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resume = require('../models/Resume');

// Helper to clean JSON string from Markdown block code wrappers
const cleanJsonString = (rawStr) => {
  let cleaned = rawStr.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/^```/, '').trim();
  }
  return cleaned;
};

const parseGeminiJson = (rawStr, source) => {
  const cleaned = cleanJsonString(rawStr);
  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    const fallbackMatch = cleaned.match(/\{[\s\S]*\}/);
    if (fallbackMatch) {
      return JSON.parse(fallbackMatch[0]);
    }
    const error = new Error(`Failed to parse Gemini JSON response for ${source}`);
    error.cause = parseError;
    throw error;
  }
};

// Mock Resume Analysis Generator
const generateMockAnalysis = (text, filename) => {
  const lowercaseText = text.toLowerCase();
  
  // Extract some common terms if present to make it feel responsive to the upload
  const skillsList = [];
  if (lowercaseText.includes('javascript') || lowercaseText.includes('js')) skillsList.push('JavaScript');
  if (lowercaseText.includes('react')) skillsList.push('React.js');
  if (lowercaseText.includes('node')) skillsList.push('Node.js');
  if (lowercaseText.includes('python')) skillsList.push('Python');
  if (lowercaseText.includes('java') && !lowercaseText.includes('javascript')) skillsList.push('Java');
  if (lowercaseText.includes('sql') || lowercaseText.includes('database')) skillsList.push('SQL');
  if (lowercaseText.includes('html') || lowercaseText.includes('css')) skillsList.push('HTML/CSS');
  
  // Add some defaults if empty
  if (skillsList.length === 0) {
    skillsList.push('Java', 'SQL', 'HTML/CSS');
  }

  const score = Math.floor(Math.random() * (85 - 65 + 1)) + 65; // score between 65 and 85

  return {
    score,
    skills: skillsList,
    analysis: {
      missingSkills: ['Computer Networks', 'OOP Concepts', 'REST APIs', 'System Design Basics'],
      improvementTips: [
        'Add quantifiable metrics to project descriptions (e.g., "improved speed by 20%").',
        'Add a dedicated summary section at the top focusing on target SDE roles.',
        'Use bullet points instead of paragraphs for better readability.',
        'Make sure links to your GitHub/Portfolio are clickable.'
      ],
      weakAreas: [
        'Lack of cloud deployments (e.g., AWS, GCP or Docker experience).',
        'No testing frameworks mentioned (e.g. Jest, JUnit).',
        'Project descriptions are too brief and technology stacks are not specified.'
      ]
    }
  };
};

// @desc    Upload and Analyze Resume
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF resume file' });
  }

  const filePath = req.file.path;

  try {
    // 1. Read and parse PDF file text
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || '';

    if (!resumeText.trim()) {
      // Clean up uploaded file if empty
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Could not extract text from the PDF. File may be empty or secured.' });
    }

    let analysisResult;

    // 2. Query Gemini API or run Mock analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'mock_mode') {
      console.log('Gemini API Key is in mock mode or not configured. Generating simulated analysis...');
      analysisResult = generateMockAnalysis(resumeText, req.file.originalname);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          You are a professional recruiting manager and ATS expert. Analyze the following resume text and extract the details.
          
          Provide the output as a valid JSON object matching the schema below:
          {
            "score": 75,
            "skills": ["Java", "React", "SQL"],
            "analysis": {
              "missingSkills": ["Docker", "OOP Concepts", "System Design"],
              "improvementTips": ["Tip 1", "Tip 2"],
              "weakAreas": ["Weak area 1", "Weak area 2"]
            }
          }

          Important: Return ONLY the JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Ensure it is fully parseable.

          Resume text:
          ${resumeText}
        `;

        console.log('Gemini request started for resume analysis', { model: modelName, promptLength: prompt.length });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = await response.text();
        console.log('Gemini response received for resume analysis', { model: modelName, responseLength: text.length });

        analysisResult = parseGeminiJson(text, 'resume analysis');
      } catch (geminiError) {
        console.error('Gemini API error details:', {
          name: geminiError.name,
          message: geminiError.message,
          status: geminiError.status,
          statusText: geminiError.statusText,
          errorDetails: geminiError.errorDetails,
        });
        analysisResult = generateMockAnalysis(resumeText, req.file.originalname);
      }
    }

    // Determine the version number
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });
    const versionLabel = `Resume V${resumeCount + 1}`;

    // 3. Save to database
    const resume = await Resume.create({
      userId: req.user._id,
      versionLabel,
      filename: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`, // Relative path for local serving if needed
      score: analysisResult.score || 70,
      skills: analysisResult.skills || [],
      analysis: {
        missingSkills: analysisResult.analysis?.missingSkills || [],
        improvementTips: analysisResult.analysis?.improvementTips || [],
        weakAreas: analysisResult.analysis?.weakAreas || []
      }
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    // Cleanup file in case of crash
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resumes uploaded by user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get resume details
// @route   GET /api/resumes/:id
// @access  Private
const getResumeDetails = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this resume' });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this resume' });
    }

    // Try deleting local file
    const absolutePath = path.join(__dirname, '..', resume.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeDetails,
  deleteResume
};
