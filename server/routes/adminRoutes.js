const express = require("express");
const adminController = require('../controller/adminController');
const { authenticateAdmin } = require('../authenticate/auth');

const adminRoutes = express.Router();

// Public Routes - Authentication
adminRoutes.post('/login', adminController.adminLogin);
adminRoutes.get('/verify', authenticateAdmin, adminController.verifyToken);

// Protected Routes - Require Authentication
adminRoutes.post('/profile', authenticateAdmin, adminController.getAdmin);
adminRoutes.put('/password', authenticateAdmin, adminController.update);
adminRoutes.post('/create', authenticateAdmin, adminController.create);
adminRoutes.get('/admin_list', authenticateAdmin, adminController.getAllAdmins);
adminRoutes.get("/logout", authenticateAdmin, adminController.adminLogout)
adminRoutes.get('/applicants', authenticateAdmin, adminController.getAllApplicants)
adminRoutes.get('/dashboard-stats', authenticateAdmin, adminController.getDashboardStats)

module.exports = adminRoutes;
