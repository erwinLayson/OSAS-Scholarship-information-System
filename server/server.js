const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/database');
const fs = require('fs');
const path = require('path');

const server = express();

server.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
server.use(express.json());
server.use(cookieParser());


// Router
const applicants = require('./routes/applicantRoutes');
const adminRoutes = require("./routes/adminRoutes");
const students = require('./routes/studentRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');


// Serve uploads directory for document/image access
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.use('/applicants', applicants);
server.use('/admin', adminRoutes);
server.use('/students', students);
server.use('/scholarships', scholarshipRoutes);
server.use('/reports', reportRoutes);
server.use('/settings', settingsRoutes);

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
            // run scholarship applications table migration if present
            const appSql = path.join(__dirname, 'database', 'scholarship_applications_table.sql');
            if (fs.existsSync(appSql)) {
                const sql2 = fs.readFileSync(appSql, 'utf8');
                db.query(sql2, (err) => {
                    if (err) console.warn('Error running scholarship_applications_table.sql:', err.message || err);
                    else console.log('Scholarship applications table ensured');
                });
            }
        } catch (e) {
            console.warn('Migration check failed', e.message || e);
        }
});