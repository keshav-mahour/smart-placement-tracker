const { GoogleGenerativeAI } = require('@google/generative-ai');
const Roadmap = require('../models/Roadmap');
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

// Mock Preparation Roadmap Generator
const generateMockRoadmap = (company, role, resumeSkills = []) => {
  const comp = company.toLowerCase();
  
  let focusAreas = [];
  let topics = [];
  let interviewQuestions = [];

  if (comp.includes('cisco')) {
    focusAreas = ['Computer Networks', 'OOP Concepts', 'Data Structures (Trees & Graphs)', 'Operating Systems'];
    topics = ['OSI Model & TCP/IP protocols', 'Subnetting & Routing Algorithms', 'Inheritance, Polymorphism & OOP Principles', 'Graph Traversals (BFS, DFS)', 'Multithreading & Process Synch'];
    interviewQuestions = [
      'What is the difference between TCP and UDP? When would you use which?',
      'Explain the difference between Method Overloading and Method Overriding in Java.',
      'How does the 3-way handshake work in TCP?',
      'Write a program to detect a cycle in a directed graph.',
      'What is virtual memory and how does paging work?'
    ];
  } else if (comp.includes('amazon') || comp.includes('google') || comp.includes('microsoft')) {
    focusAreas = ['Algorithms (Dynamic Programming & Graphs)', 'System Design Basics', 'Object Oriented Design', 'Data Structures (Heaps, Tries)'];
    topics = ['Dijkstra\'s & A* Shortest Path Algorithms', 'LRU Cache Design', 'Topological Sort', 'Trie for autocomplete systems', 'Microservices vs Monoliths architecture'];
    interviewQuestions = [
      'Design an LRU Cache. Explain the time and space complexity of get and put operations.',
      'Given an array of strings, group anagrams together.',
      'What is the difference between SQL and NoSQL databases? When should you use which?',
      'Explain BFS vs DFS. In what scenarios is DFS preferred over BFS?',
      'How would you design a scalable URL shortener like Bitly?'
    ];
  } else {
    // Default fallback roadmap
    focusAreas = ['Core DSA (Arrays & Strings)', 'SQL & Database Indexing', 'Object Oriented Programming', 'REST API Design'];
    topics = ['Time & Space Complexity analysis', 'Joins, Aggregations & Database Normalization', 'OOP Pillars (Abstraction, Encapsulation)', 'HTTP Methods & Status Codes'];
    interviewQuestions = [
      'What is database normalization? Explain 1NF, 2NF, and 3NF.',
      'What are the differences between GET, POST, PUT, and DELETE?',
      'Write a query to find the second highest salary of an employee.',
      'How do you handle exceptions in Java/Python?',
      'Write a function to check if a string is a palindrome.'
    ];
  }

  // Add customized missing skills suggestions based on what the student lacks
  const skillGaps = [];
  if (!resumeSkills.includes('Computer Networks') && comp.includes('cisco')) {
    skillGaps.push('Computer Networks');
  }
  if (!resumeSkills.includes('System Design') && (comp.includes('amazon') || comp.includes('google'))) {
    skillGaps.push('System Design');
  }

  return {
    company,
    role,
    focusAreas,
    topics: [...topics, ...skillGaps.map(s => `${s} (Missing on Resume)`)],
    interviewQuestions
  };
};

// @desc    Generate Company Roadmap
// @route   POST /api/roadmaps
// @access  Private
const generateRoadmap = async (req, res) => {
  const { company, role } = req.body;

  if (!company || !role) {
    return res.status(400).json({ success: false, message: 'Please provide both company name and role' });
  }

  try {
    // 1. Fetch user's latest resume to extract skills
    const latestResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const resumeSkills = latestResume ? latestResume.skills : [];

    let roadmapResult;

    // 2. Query Gemini API or run Mock roadmap generator
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'mock_mode') {
      console.log('Gemini API Key is in mock mode or not configured. Generating simulated preparation roadmap...');
      roadmapResult = generateMockRoadmap(company, role, resumeSkills);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          You are a professional technical interviewer and developer coach. Generate a customized preparation roadmap.
          
          Inputs:
          Target Company: ${company}
          Target Role: ${role}
          User's Current Skills: ${resumeSkills.join(', ') || 'None listed'}

          Analyze what this company evaluates in interviews for this role and cross-reference with the user's current skills.
          Provide the output as a valid JSON object matching the schema below:
          {
            "company": "${company}",
            "role": "${role}",
            "focusAreas": ["Area 1", "Area 2"],
            "topics": ["Topic 1", "Topic 2"],
            "interviewQuestions": ["Question 1", "Question 2"]
          }

          Important: Return ONLY the JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Ensure it is fully parseable.
        `;

        console.log('Gemini request started for roadmap generation', { model: modelName, promptLength: prompt.length });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = await response.text();
        console.log('Gemini response received for roadmap generation', { model: modelName, responseLength: text.length });

        roadmapResult = parseGeminiJson(text, 'roadmap generation');
      } catch (geminiError) {
        console.error('Gemini API error details:', {
          name: geminiError.name,
          message: geminiError.message,
          status: geminiError.status,
          statusText: geminiError.statusText,
          errorDetails: geminiError.errorDetails,
        });
        roadmapResult = generateMockRoadmap(company, role, resumeSkills);
      }
    }

    // 3. Save roadmap to database
    const roadmap = await Roadmap.create({
      userId: req.user._id,
      company: roadmapResult.company || company,
      role: roadmapResult.role || role,
      focusAreas: roadmapResult.focusAreas || [],
      topics: roadmapResult.topics || [],
      interviewQuestions: roadmapResult.interviewQuestions || []
    });

    res.status(201).json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all roadmaps for user
// @route   GET /api/roadmaps
// @access  Private
const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ generatedAt: -1 });
    res.json({ success: true, count: roadmaps.length, data: roadmaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get roadmap details
// @route   GET /api/roadmaps/:id
// @access  Private
const getRoadmapDetails = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (roadmap.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this roadmap' });
    }

    res.json({ success: true, data: roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private
const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (roadmap.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this roadmap' });
    }

    await Roadmap.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateRoadmap,
  getRoadmaps,
  getRoadmapDetails,
  deleteRoadmap
};
