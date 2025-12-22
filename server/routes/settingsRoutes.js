const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const { authenticateAdmin } = require('../authenticate/auth');

// Public read - students can check if editing is allowed
router.get('/allow_grade_edit', settingsController.getAllowGradeEdit);
// Admin update
router.put('/allow_grade_edit', authenticateAdmin, settingsController.setAllowGradeEdit);

module.exports = router;
