const express = require('express');
const router = express.Router();
const applicantsController = require('../controller/applicantController');
const { authenticateAdmin } = require("../authenticate/auth");

// Create a new student
router.post('/register', applicantsController.createApplicant);

module.exports = router;


module.exports = router;
