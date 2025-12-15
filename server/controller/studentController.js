const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {approvalMail, rejectionMail} = require("./shared/mailer");

const Students = require('../model/studentModel');
const Applicants = require("../model/applicantsModel");
const Applicant_history = require("../model/applicant_historyModel");


const studentController = {
    errorMessage: (res, status, msg) => {
        return res.status(status).json(msg)
    },

    successMessage: (res, status, msg, data) => {
        return res.status(status).json(msg)
    },

    createStudent: (req, res) => {
        try {
            const { studentData, studentAccount } = req.body;

            if (!studentData || !studentAccount) {
                console.error('Missing data:', { studentData, studentAccount });
                return res.status(400).json({ message: "Missing student data or account info", success: false });
            }

            const student = {
                username: studentAccount.username,
                password: studentAccount.password,
                name: studentData.student_name,
                email: studentData.email,
                subjects: typeof studentData.subjects === 'string' ? studentData.subjects : JSON.stringify(studentData.subjects)
            };
            
            console.log('Prepared student data:', JSON.stringify(student, null, 2));
            
            Students.createStudent(student, (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: err.message || "Internal Server Error", success: false });
                }

                approvalMail(
                    "Your application is approve",
                    `please login your account to send requirements`,
                    student,
                )
                const newHistory = {
                    name: student.name,
                    email: student.email,
                    subjects: JSON.stringify(student.subjects),
                    status: "approve"
                }

                Applicant_history.create(newHistory, (err) => {
                    if (err) return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", success: false });
                    
                    Applicants.delete(studentData.id, (err) => {
                        if (err) return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", success: false });

                        studentController.errorMessage(res, 201, { message: "Student Approve Successfull", success: true });
                    })
                })
                
            });
        } catch (error) {
            console.error('Caught exception:', error);
            return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
        }
    },

    rejectStudent: (req, res) => {
        const studentEmail = req.body.email;

        Applicants.getByEmail(studentEmail, (err, result) => {
            if (err) return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", success: false });
            
            if (!result || result.length === 0) {
                return studentController.errorMessage(res, 404, { message: "Student not found", success: false });
            }

            const newHistory = {
                name: result[0].student_name,
                email: result[0].email,
                subjects: result[0].subjects,
                status: "reject"
            }

            Applicant_history.create(newHistory, (err) => {
                if (err) return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", succes: false });
    
                Applicants.delete(result[0].id, (delErr, delResult) => {
                    if (delErr) return studentController.errorMessage(res, 500, { message: delErr.message || "Internal server error", success: false });

                    rejectionMail( studentEmail,"Notice of rejection of application", "Scholarship application rejected", "Your average grade not pass the Scholarship requirements");
                    return studentController.successMessage(res, 200, { message: "Student rejected and deleted successfully", success: true }, delResult);
                });
            })
        })
    },

    studentLogin: (req, res) => {
        const { username, password } = req.body;

        if (username === "" || password === "") {
            return studentController.errorMessage(res, 400, { message: "Please fill up all fields", success: false });
        }

        Students.getStudentByUsername(username, (err, getResult) => {
            if (err) return studentController.errorMessage(res, 500, { message: "Database Error", success: false })
            
            if (getResult.length === 0) {
                return studentController.errorMessage(res, 401, { message: "User not found", success: false })
            }

            const student = getResult[0];

            const verifyPassword = bcrypt.compareSync(password, student.password);

            if (!verifyPassword) {
                return studentController.errorMessage(res, 401, { message: "Incorrect password", success: false })
            }

            const token = jwt.sign({ username }, process.env.STUDENT_LOGIN_SECRET_KEY, { expiresIn: "1h" });

            res.cookie("studentLogin", token, {
                sameSite: "lax",
                httpOnly: true,
                secure:false
            });

            return studentController.successMessage(res, 201, { message: "Login successfull", success: true });
        })  
    },

    getAll: (req, res) => {
        Students.getAllStudent((err, result) => {
            if (err) return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", success: false });

            return studentController.successMessage(res, 201, result);
        })
    },

    editStudent: (req, res) => {
        const studentId = req.params.id;
        const studentData = req.body;

        // Validate required fields (password is optional)
        if (!studentData.name || !studentData.email || !studentData.username) {
            return studentController.errorMessage(res, 400, { message: "Name, email, and username are required", success: false });
        }

        // Remove password from update if it's empty
        const updateData = { ...studentData };
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        const hashPassword = bcrypt.hashSync(updateData.password, 10);
        updateData['password'] = hashPassword;

        Students.updateStudent(studentId, updateData, (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return studentController.errorMessage(res, 500, { message: err.message || "Internal server error", success: false });
            }
            
            if (result.affectedRows === 0) {
                return studentController.errorMessage(res, 404, { message: "Student not found", success: false });
            }

            if (result.affectedRows === 0) {
                return studentController.successMessage(res, 201, {message: "No update change", succes: true})
            }

            approvalMail("Notice in request for account update", "Your new account details", studentData);
            return studentController.successMessage(res, 200, { message: "Student updated successfully", success: true }, result);
        })
    },

    deleteStudent: (req, res) => {
        const studentId = req.params.id;

        Students.deleteStudent(studentId, (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return studentController.errorMessage(res, 500, { message: err.message || 'Internal server error', success: false });
            }

            if (!result || result.affectedRows === 0) {
                return studentController.errorMessage(res, 404, { message: 'Student not found', success: false });
            }

            return studentController.successMessage(res, 200, { message: 'Student deleted successfully', success: true }, result);
        });
    },

    getProfile: (req, res) => {
        const username = req.user.username; // From JWT token

        Students.getStudentByUsername(username, (err, result) => {
            if (err) {
                return studentController.errorMessage(res, 500, { message: "Internal server error", success: false });
            }

            if (result.length === 0) {
                return studentController.errorMessage(res, 404, { message: "Student not found", success: false });
            }

            const student = result[0];
            
            // Remove password from response
            delete student.password;

            // Parse subjects if it's a string
            if (typeof student.subjects === 'string') {
                try {
                    student.subjects = JSON.parse(student.subjects);
                } catch (e) {
                    console.error('Error parsing subjects:', e);
                }
            }

            return res.status(200).json({ 
                message: "Profile retrieved successfully", 
                success: true, 
                data: student 
            });
        });
    },
    updateProfile: (req, res) => {
        const username = req.user.username;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return studentController.errorMessage(res, 400, { message: 'No data provided', success: false });
        }

        // Find student by username to get id
        Students.getStudentByUsername(username, (err, result) => {
            if (err) return studentController.errorMessage(res, 500, { message: err.message || 'Internal server error', success: false });
            if (!result || result.length === 0) return studentController.errorMessage(res, 404, { message: 'Student not found', success: false });

            const student = result[0];
            const studentId = student.id;

            // Prevent accidental password updates here
            if (updateData.password) delete updateData.password;

            // If email changed, ensure uniqueness
            const checks = [];
            if (updateData.email && updateData.email !== student.email) {
                checks.push(cb => Students.getStudentByEmail(updateData.email, (e, r) => cb(e, r)));
            }
            if (updateData.username && updateData.username !== student.username) {
                checks.push(cb => Students.getStudentByUsername(updateData.username, (e, r) => cb(e, r)));
            }

            const runChecks = (i) => {
                if (i >= checks.length) {
                    // perform update
                    Students.updateStudent(studentId, updateData, (err2, updateRes) => {
                        if (err2) return studentController.errorMessage(res, 500, { message: err2.message || 'Internal server error', success: false });
                        return studentController.successMessage(res, 200, { message: 'Profile updated successfully', success: true }, updateRes);
                    });
                    return;
                }

                checks[i]((errc, rc) => {
                    if (errc) return studentController.errorMessage(res, 500, { message: errc.message || 'Internal server error', success: false });
                    if (rc && rc.length > 0) return studentController.errorMessage(res, 400, { message: 'Email or username already in use', success: false });
                    runChecks(i+1);
                });
            };

            runChecks(0);
        });
    },

    changePassword: (req, res) => {
        const username = req.user.username;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return studentController.errorMessage(res, 400, { message: 'All password fields are required', success: false });
        }

        if (newPassword !== confirmPassword) {
            return studentController.errorMessage(res, 400, { message: 'New password and confirm password do not match', success: false });
        }

        Students.getStudentByUsername(username, (err, result) => {
            if (err) return studentController.errorMessage(res, 500, { message: err.message || 'Internal server error', success: false });
            if (!result || result.length === 0) return studentController.errorMessage(res, 404, { message: 'Student not found', success: false });

            const student = result[0];
            const verify = require('bcrypt').compareSync(currentPassword, student.password);
            if (!verify) return studentController.errorMessage(res, 401, { message: 'Current password is incorrect', success: false });

            const hash = require('bcrypt').hashSync(newPassword, 10);
            Students.updateStudent(student.id, { password: hash }, (err2, updateRes) => {
                if (err2) return studentController.errorMessage(res, 500, { message: err2.message || 'Internal server error', success: false });
                return studentController.successMessage(res, 200, { message: 'Password changed successfully', success: true }, updateRes);
            });
        });
    },
    
}

module.exports = studentController;