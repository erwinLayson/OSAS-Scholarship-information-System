const express = require('express');
const router = express.Router();
const ReportController = require('../controller/reportController');
const { authenticateAdmin } = require('../authenticate/auth');

// Generate report (admin only)
router.post('/generate', authenticateAdmin, ReportController.generateReport);

module.exports = router;
