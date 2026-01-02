const Job = require('../models/Job');

// @desc    Get all jobs for user
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { status, sortBy, order, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { appliedDate: -1 };
    if (sortBy === 'company') sortOption = { companyName: order === 'asc' ? 1 : -1 };
    if (sortBy === 'status') sortOption = { status: order === 'asc' ? 1 : -1 };
    if (sortBy === 'date') sortOption = { appliedDate: order === 'asc' ? 1 : -1 };
    if (sortBy === 'interview') sortOption = { interviewDate: 1, appliedDate: -1 };

    const jobs = await Job.find(query).sort(sortOption);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ id: req.params.id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      userId: req.user._id,
      source: req.body.source || 'Web'
    };
    
    // Check for duplicate
    const existing = await Job.findOne({
      userId: req.user._id,
      $or: [
        { jobLink: req.body.jobLink, jobLink: { $ne: '' } },
        { companyName: req.body.companyName, role: req.body.role }
      ]
    });
    
    if (existing) {
      return res.status(400).json({ 
        message: 'Duplicate job detected',
        existingJob: existing
      });
    }

    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ id: req.params.id, userId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== 'id') {
        job[key] = req.body[key];
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ id: req.params.id, userId: req.user._id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/jobs/stats
const getStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Job.countDocuments({ userId: req.user._id });
    
    const result = {
      total,
      applied: 0,
      interview: 0,
      shortlisted: 0,
      offer: 0,
      rejected: 0,
      ghosted: 0
    };

    stats.forEach(s => {
      result[s._id.toLowerCase()] = s.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interviews (jobs with Interview/Shortlisted status)
// @route   GET /api/jobs/interviews
const getInterviews = async (req, res) => {
  try {
    const jobs = await Job.find({
      userId: req.user._id,
      status: { $in: ['Interview', 'Shortlisted'] }
    }).sort({ interviewDate: 1, appliedDate: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  getInterviews
};
