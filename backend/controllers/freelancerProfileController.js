const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');

function fileUrl(file) {
  if (!file) return '';
  return `/${file.path.replace(/\\/g, '/')}`;
}

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function completeProfile(req, res) {
  try {
    const userId = req.user._id;
    const files = req.files || {};
    const body = req.body;

    const skills = body.skills ? String(body.skills).split(',').map((s) => s.trim()).filter(Boolean) : [];
    const workExperience = parseJsonArray(body.workExperience);
    const languages = parseJsonArray(body.languages);
    const certificationsMeta = parseJsonArray(body.certifications); // [{name, issuingOrganization}]

    const certificateFiles = files.certificateFiles || [];
    const certifications = certificationsMeta.map((cert, index) => ({
      name: cert.name || '',
      issuingOrganization: cert.issuingOrganization || '',
      certificateFile: certificateFiles[index] ? fileUrl(certificateFiles[index]) : '',
    }));

    const profileData = {
      user: userId,
      phoneNumber: body.phoneNumber || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender || '',
      professionalTitle: body.professionalTitle || '',
      yearsOfExperience: Number(body.yearsOfExperience) || 0,
      category: body.category || '',
      skills,
      hourlyRate: Number(body.hourlyRate) || 0,
      availability: body.availability || '',
      professionalSummary: body.professionalSummary || '',
      careerObjective: body.careerObjective || '',
      highestQualification: body.highestQualification || '',
      collegeOrUniversity: body.collegeOrUniversity || '',
      graduationYear: body.graduationYear || '',
      workExperience,
      portfolioWebsite: body.portfolioWebsite || '',
      github: body.github || '',
      linkedin: body.linkedin || '',
      languages,
      certifications,
      country: body.country || '',
      state: body.state || '',
      city: body.city || '',
      timeZone: body.timeZone || '',
      preferredPaymentMethod: body.preferredPaymentMethod || '',
      paymentDetails: body.paymentDetails || '',
      bankName: body.bankName || '',
      accountHolderName: body.accountHolderName || '',
      accountNumber: body.accountNumber || '',
      ifscCode: body.ifscCode || '',
      identityVerified: body.identityVerified === 'true',
      emailVerified: body.emailVerified === 'true',
      phoneVerified: body.phoneVerified === 'true',
      preferredJobType: body.preferredJobType || '',
      remoteOrOnsite: body.remoteOrOnsite || '',
      agreedToTerms: body.agreedToTerms === 'true',
    };

    if (files.profilePicture) profileData.profilePicture = fileUrl(files.profilePicture[0]);
    if (files.resume) profileData.resume = fileUrl(files.resume[0]);
    if (files.portfolioFiles) profileData.portfolioFiles = files.portfolioFiles.map(fileUrl);

    if (!profileData.agreedToTerms) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms & Conditions' });
    }

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    return res.json({ success: true, message: 'Profile completed successfully', profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save profile', error: err.message });
  }
}

async function getMyProfile(req, res) {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user._id });
    return res.json({ success: true, profile: profile || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile', error: err.message });
  }
}

module.exports = { completeProfile, getMyProfile };
