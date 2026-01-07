require("dotenv").config();

const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


const admin = require("../model/adminModel");
const applicants = require('../model/applicantsModel');
const student = require('../model/studentModel');

function errorMessage(res, stauts, message) {
    return res.status(stauts).json(message)
}

class adminController {
    static adminLogin(req, res) {
        const SECRET_KEY = process.env.ADMIN_LOGIN_SECRET_KEY;
        const { username, password } = req.body;
        
        if (username === "" || password === "") {
            return errorMessage(res, 400, { message: "Fill up all fields", success: false });
        }

        admin.getByUsername(username, (err, data) => {
            if (err) return errorMessage(res, 500, { message: "Internal server error", success: false });

            if (data.length <= 0) {
                return errorMessage(res, 401, {message: "Invalid Username", success: false})
            }

            const adminCredential = data[0];

            // Check if password exists in database record
            if (!adminCredential.password) {
                return errorMessage(res, 500, { message: "Account password not configured", success: false });
            }

            try {
                const passwordVerify = bcrypt.compareSync(password, adminCredential.password);

                if (!passwordVerify) {
                    return errorMessage(res, 401, { message: "Incorrect Password", success: false });
                }
            } catch (bcryptError) {
                console.error("Password verification error:", bcryptError);
                return errorMessage(res, 500, { message: "Password verification failed", success: false });
            }

            const token = jwt.sign({username}, SECRET_KEY, { expiresIn: "1h" })
            
            res.cookie("adminLogin", token ,{
                httpOnly: true,
                secure: false,
                sameSite: "lax",
            })

            res.status(200).json({ message: "login successfull", success: true });
        })
    }

    static getAdmin(req, res) {
        const { username } = req.body;
        
        if (!username) {
            return errorMessage(res, 400, {message: "Username is required", success: false});
        }
        
        admin.getByUsername(username, (err, data) => {
            if(err) return errorMessage(res, 500, {message: "Internal server error", success: false, error: err})

            res.status(200).json({ message: "admin get success", success: true, data: data });
        })
    }

    static verifyToken(req, res) {
        const SECRET_KEY = process.env.ADMIN_LOGIN_SECRET_KEY;
        const token = req.cookies.adminLogin;

        if (!token) {
            return errorMessage(res, 401, { message: "Not authenticated", success: false });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            res.status(200).json({ message: "Authenticated", success: true, user: decoded });
        } catch (err) {
            return errorMessage(res, 401, { message: "Invalid or expired token", success: false });
        }
    }

    static create(req, res) {
        const data = req.body;
        const isFill = Object.keys(data).every(key => (
            data[key] !== "" && data[key] !== null
        ));

        if (!isFill) {
            return errorMessage(res, 400, { message: "Fill up all fields", success: false });
        }

        admin.getByEmail(data.email, (err, result) => {
            if (err) return errorMessage(res, 500, { message: "Database error", error: err, success: false });
            
            if (result.length > 0) {
                return errorMessage(res, 400, {message: "Email already exists", success: false})
            }

            admin.create(data, (error) => {
                if (error) return errorMessage(res, 500, { message: "Database error", success: false, error: error });
                
                res.status(201).json({message: "Account created successfully", success: true})
            })
        })
    }

    static getAllAdmins(req, res) {
        admin.getAll((err, data) => {
            if(err) return errorMessage(res, 500, {message: "Internal server error", success: false, error: err})

            res.status(200).json({ message: "Admins retrieved successfully", success: true, data: data });
        })
    }

    static update(req, res) {
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return errorMessage(res, 200, { message: "password not match", success: false});
        }
        admin.update(password, (err, data) => {
            if (err) return errorMessage(res, 500, { message: "Internal server error", success: false, error: err });

            if (data.changedRows == 0) {
                res.status(201).json({ message: "No Update happen", success: true, data: data });
            }

            if (data.changedRows > 0) {
                res.status(201).json({ message: "Update Successfull", success: true, data: data });
            }
        });
    }

    static adminLogout(req, res) {

        res.clearCookie("adminLogin", {
            sameSite: "lax",
            httpOnly: true,
            secure: false,
        })

        res.status(201).json({message: "Logout successfull", success: true})
    }

    static getAllApplicants (req, res) {
        applicants.getAll((err, data) => {
            if (err) return res.status(500).json("Internal server Error");

            res.status(200).json(data);
        }) 
    }

    static getDashboardStats(req, res) {
        // Get total students count
        student.getAllStudent((err, students) => {
            if (err) {
                console.error('Error fetching students:', err);
                return errorMessage(res, 500, { message: "Internal server error", success: false, error: err });
            }

            // Get all applicants
            applicants.getAll((err2, applications) => {
                if (err2) {
                    console.error('Error fetching applicants:', err2);
                    return errorMessage(res, 500, { message: "Internal server error", success: false, error: err2 });
                }

                const stats = {
                    totalStudents: students.length,
                    totalApplications: applications.length,
                    pendingApplications: applications.length, // All applicants are pending until approved/rejected
                    approvedApplications: students.length, // Students are approved applicants
                };

                // Get recent applications (last 5)
                const recentApplications = applications.slice(0, 5).map(app => {
                    let date = new Date().toISOString().split('T')[0];
                    
                    if (app.created_at) {
                        date = new Date(app.created_at).toISOString().split('T')[0];
                    } else if (app.createdDate) {
                        date = new Date(app.createdDate).toISOString().split('T')[0];
                    }
                    
                    return {
                        id: app.id,
                        student: app.student_name || app.studentName || app.name || 'Unknown',
                        email: app.email,
                        status: 'Pending',
                        date: date
                    };
                });

                res.status(200).json({
                    success: true,
                    message: "Dashboard stats retrieved successfully",
                    stats,
                    recentApplications
                });
            });
        });
    }
}

module.exports = adminController;