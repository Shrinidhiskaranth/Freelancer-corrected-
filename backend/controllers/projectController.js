const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, budget, deadline, experienceLevel } = req.body;

    const project = new Project({
      title,
      description,
      category,
      requiredSkills,
      budget,
      deadline,
      experienceLevel,
      clientId: req.user._id, // Set by auth middleware
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Server error while creating project' });
  }
};

// Get projects for the logged-in client
exports.getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching projects' });
  }
};

// Get all open projects (for freelancers)
exports.getAllOpenProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Open' })
      .populate('clientId', 'fullName profileCompleted currency')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching open projects:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching open projects' });
  }
};

// Get a single project by ID
exports.getSingleProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId', 'fullName currency');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching project' });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Ensure only the owner can update
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Server error while updating project' });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting project' });
  }
};

// Add a progress update to a project (Freelancer only)
exports.addProgressUpdate = async (req, res) => {
  try {
    const { text, fileLink } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify it's in progress
    if (project.status !== 'In Progress' && project.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Can only add updates to active projects' });
    }

    project.progressUpdates.push({
      text,
      fileLink,
      freelancerId: req.user._id,
      date: new Date()
    });

    await project.save();
    res.status(200).json({ success: true, message: 'Progress update added', project });
  } catch (error) {
    console.error('Error adding progress update:', error);
    res.status(500).json({ success: false, message: 'Server error while adding update' });
  }
};

// Mark project as completed (Client only)
exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this project' });
    }

    project.status = 'Completed';
    project.paymentStatus = 'Paid';
    await project.save();
    res.status(200).json({ success: true, message: 'Project marked as completed and payment released', project });
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({ success: false, message: 'Server error while completing project' });
  }
};
