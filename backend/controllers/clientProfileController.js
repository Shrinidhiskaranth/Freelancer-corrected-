const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');

function fileUrl(req, file) {
  if (!file) return '';
  return `/${file.path.replace(/\\/g, '/')}`;
}

async function completeProfile(req, res) {
  try {
    const userId = req.user._id;
    const files = req.files || {};
    const body = req.body;

    const languagesSpoken = body.languagesSpoken
      ? String(body.languagesSpoken).split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const profileData = {
      user: userId,
      phoneNumber: body.phoneNumber || '',
      companyName: body.companyName || '',
      industry: body.industry || '',
      companyWebsite: body.companyWebsite || '',
      companySize: body.companySize || '',
      country: body.country || '',
      state: body.state || '',
      city: body.city || '',
      timeZone: body.timeZone || '',
      about: body.about || '',
      hiringPreference: body.hiringPreference || '',
      preferredCommunication: body.preferredCommunication || '',
      languagesSpoken,
      preferredCurrency: body.preferredCurrency || '',
      identityVerified: body.identityVerified === 'true',
      paymentMethodAdded: body.paymentMethodAdded === 'true',
      linkedin: body.linkedin || '',
      portfolioWebsite: body.portfolioWebsite || '',
      agreedToTerms: body.agreedToTerms === 'true',
    };

    if (files.profilePicture) profileData.profilePicture = fileUrl(req, files.profilePicture[0]);
    if (files.companyLogo) profileData.companyLogo = fileUrl(req, files.companyLogo[0]);

    if (!profileData.agreedToTerms) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms & Conditions' });
    }

    const profile = await ClientProfile.findOneAndUpdate(
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
    const profile = await ClientProfile.findOne({ user: req.user._id });
    return res.json({ success: true, profile: profile || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile', error: err.message });
  }
}

module.exports = { completeProfile, getMyProfile };
