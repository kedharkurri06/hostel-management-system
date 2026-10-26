const Complaint = require('../models/Complaint');
const { isDBConnected } = require('../config/db');
const { initialComplaints } = require('../utils/fallbackData');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const total = initialComplaints.length;
      const pending = initialComplaints.filter(c => c.status === 'Pending').length;
      const inProgress = initialComplaints.filter(c => c.status === 'In Progress').length;
      const resolved = initialComplaints.filter(c => c.status === 'Resolved').length;
      const emergency = initialComplaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      return res.json({
        success: true,
        data: {
          total,
          pending,
          inProgress,
          resolved,
          emergency,
          resolutionRate,
          categoryBreakdown: [],
          activeQueue: initialComplaints.filter(c => c.status !== 'Resolved')
        },
        source: 'fallback'
      });
    }

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const emergency = await Complaint.countDocuments({
      priority: 'Emergency',
      status: { $ne: 'Resolved' }
    });

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const categoryBreakdown = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const activeQueue = await Complaint.find({ status: { $ne: 'Resolved' } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        emergency,
        resolutionRate,
        categoryBreakdown,
        activeQueue
      }
    });
  } catch (error) {
    const total = initialComplaints.length;
    const pending = initialComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = initialComplaints.filter(c => c.status === 'In Progress').length;
    const resolved = initialComplaints.filter(c => c.status === 'Resolved').length;
    const emergency = initialComplaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        emergency,
        resolutionRate,
        categoryBreakdown: [],
        activeQueue: initialComplaints.filter(c => c.status !== 'Resolved')
      },
      source: 'fallback'
    });
  }
};

module.exports = { getStats };
