const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  getInterviews
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/interviews', getInterviews);
router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(getJob).put(updateJob).delete(deleteJob);

module.exports = router;
