require("dotenv").config();

const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
    const token = req.cookies.adminLogin;

    if (!token) return res.status(401).json({ message: "Authentication required", success: false });

    jwt.verify(token, process.env.ADMIN_LOGIN_SECRET_KEY, (err, data) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token", success: false })
        
        req.user = data;
        next();
    })
}


function authenticateStudent(req, res, next) {
    const token = req.cookies.studentLogin;

    if (!token) return res.status(401).json({ message: "Authentication required", success: false });

    jwt.verify(token, process.env.STUDENT_LOGIN_SECRET_KEY, (err, data) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token", success: false })
        
        req.user = data;
        next();
    })
}

module.exports = {
    authenticateAdmin,
    authenticateStudent
};