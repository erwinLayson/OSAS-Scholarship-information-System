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
    // allow token via cookie or Authorization header (Bearer)
        let authToken = token;
        // debug log
        console.log('authenticateStudent: cookie token present?', !!token, 'Authorization header present?', !!req.headers.authorization);
    if (!authToken && req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') authToken = parts[1];
    }

        if (!authToken) {
            console.warn('authenticateStudent: no token found (cookie or header)');
            return res.status(401).json({ message: "Authentication required", success: false });
        }

        // debug masked token (first/last chars)
        try {
            const snippet = authToken && authToken.length ? `${authToken.slice(0,8)}...${authToken.slice(-8)}` : 'N/A';
            console.log('authenticateStudent: token snippet=', snippet);
        } catch (e) { /* ignore */ }

        jwt.verify(authToken, process.env.STUDENT_LOGIN_SECRET_KEY, (err, data) => {
            if (err) {
                console.warn('authenticateStudent: token verify failed', err && err.message);
                return res.status(403).json({ message: "Invalid or expired token", success: false });
            }
        
        req.user = data;
        next();
    })
}

module.exports = {
    authenticateAdmin,
    authenticateStudent
};