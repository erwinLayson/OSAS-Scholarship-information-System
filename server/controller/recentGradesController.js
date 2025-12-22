const RecentGrades = require('../model/recent_grades');

const recentGradesController = {
  getAll: (req, res) => {
    RecentGrades.getAllRecentGrades((err, result) => {
      if (err) return res.status(500).json({ message: err.message || 'Internal server error', success: false });
      return res.status(200).json({ message: 'OK', success: true, data: result });
    });
  },

  getByStudent: (req, res) => {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ message: 'Missing studentId', success: false });
    RecentGrades.getStudentRecentGrades(studentId, (err, result) => {
      if (err) return res.status(500).json({ message: err.message || 'Internal server error', success: false });
      return res.status(200).json({ message: 'OK', success: true, data: result });
    });
  }
,

  // Student-scoped: get recent grades for the authenticated student
  getForCurrent: (req, res) => {
    const studentId = req.user && req.user.id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized', success: false });
    RecentGrades.getStudentRecentGrades(studentId, (err, result) => {
      if (err) return res.status(500).json({ message: err.message || 'Internal server error', success: false });
      return res.status(200).json({ message: 'OK', success: true, data: result });
    });
  }
};

module.exports = recentGradesController;
