const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDENTITY_REGEX = /^[a-zA-Z0-9]+$/;

function validateRegistration({ fullName, email, username, password, confirmPassword, identityNumber }) {
  if (!fullName || !email || !username || !password || !confirmPassword || !identityNumber) {
    return 'All fields are required';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  if (!IDENTITY_REGEX.test(identityNumber)) {
    return 'Identity / Registration Number must be alphanumeric (letters and numbers only)';
  }
  if (identityNumber.length < 6) {
    return 'Identity / Registration Number must be at least 6 characters long';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

function register(role) {
  return async (req, res) => {
    try {
      const { fullName, email, username, password, confirmPassword, identityNumber } = req.body;

      const validationError = validateRegistration({ fullName, email, username, password, confirmPassword, identityNumber });
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
        return res.status(409).json({ success: false, message: `${field} is already in use` });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        identityNumber,
        role,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please log in.',
        user: { id: user._id, fullName: user.fullName, username: user.username, role: user.role },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
    }
  };
}

function login(role) {
  return async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier = email or username

      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Email/username and password are required' });
      }

      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Account does not exist' });
      }

      if (user.role !== role) {
        return res.status(404).json({ success: false, message: 'Account does not exist' });
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      return res.status(500).json({ success: false, message: err.message, error: err.message });
    }
  };
}

async function checkExists(req, res) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ success: false, message: 'Email and username are required' });
    }
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already in use` });
    }
    return res.json({ success: true, message: 'Details are available' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Validation failed', error: err.message });
  }
}

async function me(req, res) {
  return res.json({ success: true, user: req.user });
}

function logout(req, res) {
  // JWT is stateless and stored client-side, so logout is handled by discarding the token on the client.
  return res.json({ success: true, message: 'Logged out successfully' });
}

async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address' });
    }

    // Encrypt the new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset failed', error: err.message });
  }
}

module.exports = {
  registerClient: register('CLIENT'),
  registerFreelancer: register('FREELANCER'),
  loginClient: login('CLIENT'),
  loginFreelancer: login('FREELANCER'),
  checkExists,
  me,
  logout,
  resetPassword,
};
