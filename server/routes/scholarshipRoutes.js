const express = require('express');
const ScholarshipController = require('../controller/scholarshipController');
const ScholarshipApplicationController = require('../controller/scholarshipApplicationController');
const { authenticateAdmin, authenticateStudent } = require('../authenticate/auth');
const multer = require('multer');

// multer temp storage
const upload = multer({ dest: 'tmp/' });

const scholarshipRoutes = express.Router();

// Public route - accessible to all
scholarshipRoutes.get('/list', ScholarshipController.getAll);

// Admin-only routes
scholarshipRoutes.post('/create', authenticateAdmin, ScholarshipController.create);
// Admin: manage scholarship applications
scholarshipRoutes.get('/applications', authenticateAdmin, ScholarshipApplicationController.listAll);
scholarshipRoutes.get('/applications/:id', authenticateAdmin, ScholarshipApplicationController.getById);
scholarshipRoutes.put('/applications/:id/status', authenticateAdmin, ScholarshipApplicationController.updateStatus);

// Scholarship CRUD
scholarshipRoutes.get('/:id', authenticateAdmin, ScholarshipController.getById);
scholarshipRoutes.put('/edit/:id', authenticateAdmin, ScholarshipController.update);
scholarshipRoutes.delete('/delete/:id', authenticateAdmin, ScholarshipController.delete);

// Student apply route (multipart/form-data, files field name: documents)
scholarshipRoutes.post('/apply/:id', authenticateStudent, upload.array('documents', 10), ScholarshipApplicationController.apply);

module.exports = scholarshipRoutes;
