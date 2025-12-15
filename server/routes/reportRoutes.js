const express = require('express');
const router = express.Router();
const ReportController = require('../controller/reportController');
const { authenticateAdmin } = require('../authenticate/auth');

// Generate report (admin only)
router.post('/generate', authenticateAdmin, ReportController.generateReport);

// Summary and recent reports
router.get('/summary', authenticateAdmin, ReportController.getSummary);
router.get('/recent', authenticateAdmin, ReportController.getRecent);

// Download and delete generated reports
router.get('/download/:id', authenticateAdmin, ReportController.downloadReport);
router.delete('/:id', authenticateAdmin, ReportController.deleteReport);

module.exports = router;
