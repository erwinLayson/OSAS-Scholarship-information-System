const { sendScholarshipMail } = require('./shared/mailer');
const Student = require('../model/studentModel');

const Scholarship = require('../model/scholarshipModel');

function errorMessage(res, status, message) {
    return res.status(status).json(message);
}

class ScholarshipController {
    // Create a new scholarship
    static create(req, res) {
        const scholarshipData = req.body;
        
        // Validate required fields
        if (!scholarshipData.name || !scholarshipData.description || !scholarshipData.amount || 
            !scholarshipData.slots || !scholarshipData.deadline) {
            return errorMessage(res, 400, { 
                message: "All fields are required", 
                success: false 
            });
        }

        Scholarship.create(scholarshipData, (err, result) => {
            if (err) {
                console.error('Error creating scholarship:', err);
                return errorMessage(res, 500, { 
                    message: "Internal server error", 
                    success: false, 
                    error: err 
                });
            }

            Student.getAllStudent((err, result) => {
                if (err) return errorMessage(res, 500, { message: err.message || "Internal server error", success: false });

                const studentsEmail = result.map(student => student.email);
                console.log(studentsEmail);

                sendScholarshipMail("New scholarship posted", studentsEmail, "Provide the requirement to apply the scholarship program");
                res.status(201).json({ 
                message: "Scholarship created successfully", 
                success: true,
                scholarshipId: result.insertId
            });
            })
        });
    }

    // Get all scholarships
    static getAll(req, res) {
        Scholarship.getAll((err, scholarships) => {
            if (err) {
                console.error('Error fetching scholarships:', err);
                return errorMessage(res, 500, { 
                    message: "Internal server error", 
                    success: false, 
                    error: err 
                });
            }

            res.status(200).json({ 
                message: "Scholarships retrieved successfully", 
                success: true, 
                data: scholarships 
            });
        });
    }

    // Get scholarship by ID
    static getById(req, res) {
        const { id } = req.params;

        Scholarship.getById(id, (err, scholarship) => {
            if (err) {
                console.error('Error fetching scholarship:', err);
                return errorMessage(res, 500, { 
                    message: "Internal server error", 
                    success: false, 
                    error: err 
                });
            }

            if (scholarship.length === 0) {
                return errorMessage(res, 404, { 
                    message: "Scholarship not found", 
                    success: false 
                });
            }

            res.status(200).json({ 
                message: "Scholarship retrieved successfully", 
                success: true, 
                data: scholarship[0] 
            });
        });
    }

    // Update scholarship
    static update(req, res) {
        const { id } = req.params;
        const scholarshipData = req.body;

        Scholarship.update(id, scholarshipData, (err, result) => {
            if (err) {
                console.error('Error updating scholarship:', err);
                return errorMessage(res, 500, { 
                    message: "Internal server error", 
                    success: false, 
                    error: err 
                });
            }

            if (result.affectedRows === 0) {
                return errorMessage(res, 404, { 
                    message: "Scholarship not found", 
                    success: false 
                });
            }

            res.status(200).json({ 
                message: "Scholarship updated successfully", 
                success: true 
            });
        });
    }

    // Delete scholarship
    static delete(req, res) {
        const { id } = req.params;

        Scholarship.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting scholarship:', err);
                return errorMessage(res, 500, { 
                    message: "Internal server error", 
                    success: false, 
                    error: err 
                });
            }

            if (result.affectedRows === 0) {
                return errorMessage(res, 404, { 
                    message: "Scholarship not found", 
                    success: false 
                });
            }

            res.status(200).json({ 
                message: "Scholarship deleted successfully", 
                success: true 
            });
        });
    }
}

module.exports = ScholarshipController;
