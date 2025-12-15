const express = require('express');
const ScholarshipController = require('../controller/scholarshipController');
const { authenticateAdmin } = require('../authenticate/auth');

const scholarshipRoutes = express.Router();

// Public route - accessible to all
scholarshipRoutes.get('/list', ScholarshipController.getAll);

// Admin-only routes
scholarshipRoutes.post('/create', authenticateAdmin, ScholarshipController.create);
scholarshipRoutes.get('/:id', authenticateAdmin, ScholarshipController.getById);
scholarshipRoutes.put('/edit/:id', authenticateAdmin, ScholarshipController.update);
scholarshipRoutes.delete('/delete/:id', authenticateAdmin, ScholarshipController.delete);

module.exports = scholarshipRoutes;
