const Project = require('../models/Project');
const FreelancerProfile = require('../models/FreelancerProfile');

// Lightweight semantic normalization. It groups common aliases (React/React.js,
// Node/Node.js, JS/JavaScript, etc.) so related terms can match even when the
// exact spelling is different. This keeps the feature dependency-free.
const SEMANTIC_GROUPS = [
  ['react', 'reactjs', 'react.js'],
  ['nodejs', 'node', 'node.js'],
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['mongodb', 'mongo', 'mongo db'],
  ['express', 'expressjs', 'express.js'],
  ['frontend', 'front-end', 'front end', 'ui development'],
  ['backend', 'back-end', 'back end', 'server-side', 'server side'],
  ['fullstack', 'full-stack', 'full stack'],
  ['database', 'databases', 'db'],
  ['machine learning', 'ml'],
  ['artificial intelligence', 'ai'],
  ['data science', 'data analytics', 'data analysis'],
  ['ui ux', 'ui/ux', 'user experience', 'user interface'],
  ['aws', 'amazon web services', 'cloud'],
  ['spring boot', 'springboot'],
  ['java', 'java programming'],
  ['python', 'python programming'],
  ['sql', 'mysql', 'postgresql', 'relational database'],
  ['figma', 'ui design', 'interface design'],
  ['digital marketing', 'seo', 'search engine optimization'],
];

const semanticMap = new Map();
SEMANTIC_GROUPS.forEach(group => {
  const canonical = group[0];
  group.forEach(alias => semanticMap.set(alias, canonical));
});

function cleanText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[\/_-]+/g, ' ')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function semanticTokens(text = '') {
  const cleaned = cleanText(text);
  const tokens = new Set(cleaned.split(' ').filter(token => token.length > 2));

  // Add canonical concepts when a known multi-word or alias phrase occurs.
  semanticMap.forEach((canonical, alias) => {
    const aliasClean = cleanText(alias);
    if (cleaned.includes(aliasClean)) {
      tokens.add(canonical);
    }
  });

  // Also canonicalize individual tokens.
  [...tokens].forEach(token => {
    if (semanticMap.has(token)) tokens.add(semanticMap.get(token));
  });

  return tokens;
}

function jaccardSimilarity(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach(token => { if (b.has(token)) intersection += 1; });
  const union = new Set([...a, ...b]).size;
  return union ? Math.round((intersection / union) * 100) : 0;
}

function experienceScore(years, requiredLevel) {
  const targets = { Beginner: 1, Intermediate: 3, Expert: 5 };
  const target = targets[requiredLevel] || 3;
  const value = Number(years) || 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function budgetScore(hourlyRate, projectBudget, deadline) {
  const rate = Number(hourlyRate) || 0;
  const budget = Number(projectBudget) || 0;
  if (!rate || !budget) return 0;

  const days = Math.max(7, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
  // Estimate available working hours conservatively, capped to a normal project month.
  const estimatedHours = Math.min(176, Math.max(40, Math.ceil(days * 8 * 0.7)));
  const targetHourlyRate = budget / estimatedHours;
  const difference = Math.abs(rate - targetHourlyRate) / targetHourlyRate;
  return Math.max(0, Math.min(100, Math.round(100 - difference * 100)));
}

function availabilityScore(availability, deadline) {
  const value = cleanText(availability);
  if (!value || value.includes('not available')) return 0;

  const days = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
  const fullTime = value.includes('full time') || value.includes('fulltime');
  const partTime = value.includes('part time') || value.includes('parttime');

  if (fullTime) return 100;
  if (partTime) return days <= 14 ? 65 : 80;
  return 50;
}

function categoryScore(projectCategory, freelancerCategory) {
  if (!projectCategory || !freelancerCategory) return 0;
  const a = semanticTokens(projectCategory);
  const b = semanticTokens(freelancerCategory);
  return jaccardSimilarity(a, b) > 0 ? 100 : 0;
}

async function getProjectMatches(req, res) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const requiredSkills = (project.requiredSkills || []).map(s => cleanText(s)).filter(Boolean);
    const projectText = [
      project.title,
      project.description,
      project.category,
      ...(project.requiredSkills || [])
    ].join(' ');
    const projectTokens = semanticTokens(projectText);

    const freelancers = await FreelancerProfile.find()
      .populate('user', 'fullName username email isVerified')
      .lean();

    const matches = freelancers
      .map(profile => {
        if (!profile.user) return null;

        const freelancerSkills = (profile.skills || []).map(s => cleanText(s)).filter(Boolean);
        const matchingSkills = requiredSkills.filter(required => {
          const requiredTokens = semanticTokens(required);
          return freelancerSkills.some(skill => jaccardSimilarity(requiredTokens, semanticTokens(skill)) >= 35);
        });

        const skillScore = requiredSkills.length
          ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
          : 0;

        const profileText = [
          profile.professionalTitle,
          profile.professionalSummary,
          profile.careerObjective,
          ...(profile.skills || []),
          ...(profile.workExperience || []).map(w => `${w.jobTitle || ''} ${w.description || ''}`)
        ].join(' ');

        const semanticScore = jaccardSimilarity(projectTokens, semanticTokens(profileText));
        const experience = experienceScore(profile.yearsOfExperience, project.experienceLevel);
        const budget = budgetScore(profile.hourlyRate, project.budget, project.deadline);
        const availability = availabilityScore(profile.availability, project.deadline);
        const category = categoryScore(project.category, profile.category);

        // Weighted recommendation score (100 total):
        // skills 35 + semantic relevance 15 + experience 15 + budget 15 + availability 10 + category 10.
        const matchPercentage = Math.min(100, Math.round(
          skillScore * 0.35 +
          semanticScore * 0.15 +
          experience * 0.15 +
          budget * 0.15 +
          availability * 0.10 +
          category * 0.10
        ));

        const reasons = [];
        if (skillScore >= 70) reasons.push('Strong required-skill coverage');
        else if (skillScore >= 35) reasons.push('Several required skills match');
        if (semanticScore >= 30) reasons.push('Relevant project/profile experience');
        if (experience >= 80) reasons.push('Experience level fits the project');
        if (budget >= 75) reasons.push('Hourly rate fits the project budget');
        if (availability >= 80) reasons.push('Good availability for the deadline');
        if (category >= 100) reasons.push('Category matches');

        return {
          freelancerId: profile.user._id,
          fullName: profile.user.fullName,
          username: profile.user.username,
          professionalTitle: profile.professionalTitle || 'Professional Freelancer',
          profilePicture: profile.profilePicture || '',
          hourlyRate: profile.hourlyRate || 0,
          yearsOfExperience: profile.yearsOfExperience || 0,
          availability: profile.availability || '',
          category: profile.category || '',
          skills: profile.skills || [],
          matchingSkills,
          matchPercentage,
          matchBreakdown: {
            skills: skillScore,
            semantic: semanticScore,
            experience,
            budget,
            availability,
            category
          },
          explanation: reasons.length ? reasons : ['Partial profile compatibility']
        };
      })
      .filter(Boolean)
      .filter(m => m.matchPercentage > 10)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);

    return res.json({
      success: true,
      matchingMethod: 'multi-factor semantic rule-based ranking',
      matches
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI matching failed', error: err.message });
  }
}

module.exports = { getProjectMatches };
