const multer = require('multer');
const path = require('path');

const destinations = {
  profilePicture: 'uploads/profile-pictures',
  companyLogo: 'uploads/logos',
  resume: 'uploads/resumes',
  portfolioFiles: 'uploads/portfolios',
  certificateFiles: 'uploads/certificates',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = destinations[file.fieldname] || 'uploads';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;
