const db = require('../config/database');

// Table layout (from your DB): recent_grade_id (PK), id (student id), grades (varchar), create_at (timestamp), semester, average
const RecentGrades = {
    // data: { studentId, subjects, semester, average }
    addRecentGrade: (data, cb) => {
        const { studentId, subjects, semester, average, sessionId } = data;
        const grades = typeof subjects === 'string' ? subjects : JSON.stringify(subjects);
        const sql = 'INSERT INTO recent_grades (`id`, `grades`, `semester`, `average`, `session_id`) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [studentId, grades, semester || null, typeof average !== 'undefined' ? average : null, sessionId || null], cb);
    },

    getStudentRecentGrades: (studentId, cb) => {
        const sql = 'SELECT * FROM recent_grades WHERE `id` = ? ORDER BY create_at DESC';
        db.query(sql, [studentId], cb);
    },

    getAllRecentGrades: (cb) => {
        const sql = 'SELECT * FROM recent_grades ORDER BY create_at DESC';
        db.query(sql, cb);
    },

    getByStudentAndSemester: (studentId, semester, cb) => {
        const sql = 'SELECT * FROM recent_grades WHERE `id` = ? AND `semester` = ? LIMIT 1';
        db.query(sql, [studentId, semester], cb);
    },

    getByStudentAndSession: (studentId, sessionId, cb) => {
        const sql = 'SELECT * FROM recent_grades WHERE `id` = ? AND `session_id` = ? LIMIT 1';
        db.query(sql, [studentId, sessionId], cb);
    },

    deleteRecentGrade: (recentGradeId, cb) => {
        const sql = 'DELETE FROM recent_grades WHERE recent_grade_id = ?';
        db.query(sql, [recentGradeId], cb);
    }
};

module.exports = RecentGrades;