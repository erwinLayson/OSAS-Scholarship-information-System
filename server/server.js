const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/database');

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

server.use('/applicants', applicants);
server.use('/admin', adminRoutes);
server.use('/students', students);
server.use('/scholarships', scholarshipRoutes);

server.listen(3000, () => {
    console.log("server is running in http://localhost:3000");
});