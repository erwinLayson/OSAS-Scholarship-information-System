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

// student routes authenticate
route.post('/login', studentController.studentLogin);
route.get('/profile', authenticateStudent, studentController.getProfile);

module.exports = route;