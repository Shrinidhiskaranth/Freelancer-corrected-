const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic Information
    profilePicture: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },

    // Company Information
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    industry: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companySize: { type: String, default: '' },

    // Location
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    timeZone: { type: String, default: '' },

    // About
    about: { type: String, default: '' },
    hiringPreference: { type: String, default: '' },

    // Preferences
    preferredCommunication: { type: String, default: '' },
    languagesSpoken: { type: [String], default: [] },
    preferredCurrency: { type: String, default: '' },

    // Verification
    identityVerified: { type: Boolean, default: false },
    paymentMethodAdded: { type: Boolean, default: false },

    // Social Links
    linkedin: { type: String, default: '' },
    portfolioWebsite: { type: String, default: '' },

    // Agreement
    agreedToTerms: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientProfile', clientProfileSchema);
