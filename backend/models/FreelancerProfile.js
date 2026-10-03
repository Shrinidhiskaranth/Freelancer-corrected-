const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema(
  {
    companyName: String,
    jobTitle: String,
    startDate: String,
    endDate: String,
    description: String,
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: String,
    issuingOrganization: String,
    certificateFile: String,
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    language: String,
    proficiency: String,
  },
  { _id: false }
);

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Personal Information
    profilePicture: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },

    // Professional Information
    professionalTitle: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    category: { type: String, default: '' },
    skills: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 0 },
    availability: { type: String, default: '' },

    // About
    professionalSummary: { type: String, default: '' },
    careerObjective: { type: String, default: '' },

    // Education
    highestQualification: { type: String, default: '' },
    collegeOrUniversity: { type: String, default: '' },
    graduationYear: { type: String, default: '' },

    // Work Experience
    workExperience: { type: [workExperienceSchema], default: [] },

    // Portfolio
    portfolioWebsite: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    resume: { type: String, default: '' },
    portfolioFiles: { type: [String], default: [] },

    // Certifications
    certifications: { type: [certificationSchema], default: [] },

    // Languages
    languages: { type: [languageSchema], default: [] },

    // Location
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    timeZone: { type: String, default: '' },

    // Payment
    preferredPaymentMethod: { type: String, default: '' },
    paymentDetails: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },

    // Verification
    identityVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    // Preferences
    preferredJobType: { type: String, default: '' },
    remoteOrOnsite: { type: String, default: '' },

    // Agreement
    agreedToTerms: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
