const Appicant_history = require('../model/applicant_historyModel');
const applicants = require('../model/applicantsModel');

const applicantsController = {
  // Create a new student
  createApplicant: (req, res) => {
        const { studentName, email, subjects } = req.body;

        // Validation
        if (!studentName || !email || !subjects) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: studentName, email, and subjects'
            });
            }

            // Check if email already exists
            applicants.getByEmail(email, (err, results) => {
            if (err) {
                return res.status(500).json({
                success: false, 
                message: 'Database error',
                error: err
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                success: false,
                message: 'Email already exists'
                });
            }

            // Create student
            const studentData = { studentName, email, subjects };
            
            applicants.create(studentData, (err, result) => {
                if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create student',
                            error: err
                        });
                    }

                    res.status(201).json({
                    success: true,
                    message: 'Student registered successfully',
                    data: {
                        id: result.insertId,
                        studentName,
                        email,
                        subjects
                    }
                });
            });
        });
    },

};

module.exports = applicantsController;
