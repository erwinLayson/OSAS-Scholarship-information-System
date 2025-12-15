const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/database');
const fs = require('fs');
const path = require('path');

const server = express();

server.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
server.use(express.json());
server.use(cookieParser());


// Router
const applicants = require('./routes/applicantRoutes');
const adminRoutes = require("./routes/adminRoutes");
const students = require('./routes/studentRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const reportRoutes = require('./routes/reportRoutes');

server.use('/applicants', applicants);
server.use('/admin', adminRoutes);
server.use('/students', students);
server.use('/scholarships', scholarshipRoutes);
server.use('/reports', reportRoutes);

server.listen(3000, () => {
    console.log("server is running in http://localhost:3000");
        // Run DB migrations for reports table if SQL file exists
        try {
            const sqlPath = path.join(__dirname, 'database', 'reports_table.sql');
            if (fs.existsSync(sqlPath)) {
                const sql = fs.readFileSync(sqlPath, 'utf8');
                db.query(sql, (err) => {
                    if (err) console.warn('Error running reports_table.sql:', err.message || err);
                    else console.log('Reports table ensured');
                });
            }
        } catch (e) {
            console.warn('Migration check failed', e.message || e);
        }
});