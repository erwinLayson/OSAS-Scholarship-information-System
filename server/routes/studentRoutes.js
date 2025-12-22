const express = require('express');

// controller
const studentController = require('../controller/studentController');

// middle ware
const { authenticateStudent, authenticateAdmin } = require("../authenticate/auth");

const route = express.Router();

// auth by admin
route.post('/create', authenticateAdmin, studentController.createStudent);
route.post('/reject', authenticateAdmin, studentController.rejectStudent);
route.get('/student_list', authenticateAdmin, studentController.getAll);
route.put('/edit/:id', authenticateAdmin, studentController.editStudent);
// Admin delete student
route.delete('/:id', authenticateAdmin, studentController.deleteStudent);

// student routes authenticate
route.post('/login', studentController.studentLogin);
route.get('/profile', authenticateStudent, studentController.getProfile);
// Student self-service routes
route.put('/profile', authenticateStudent, studentController.updateProfile);
route.post('/profile/password', authenticateStudent, studentController.changePassword);

// Student can view their own recent grades history
const recentGradesController = require('../controller/recentGradesController');
route.get('/recent-grades', authenticateStudent, recentGradesController.getForCurrent);

module.exports = route;