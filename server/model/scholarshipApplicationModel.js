const db = require('../config/database');

class ScholarshipApplication {
  static create(applicationData, callback) {
    const { student_id, scholarship_id, documents } = applicationData;
    const docsJson = JSON.stringify(documents || []);
    const query = `INSERT INTO scholarship_applications (student_id, scholarship_id, documents, status, created_at) VALUES (?, ?, ?, 'Pending', NOW())`;
    db.query(query, [student_id, scholarship_id, docsJson], callback);
  }

  static getByStudent(student_id, callback) {
    const query = 'SELECT * FROM scholarship_applications WHERE student_id = ? ORDER BY created_at DESC';
    db.query(query, [student_id], callback);
  }

  static getByScholarship(scholarship_id, callback) {
    const query = 'SELECT * FROM scholarship_applications WHERE scholarship_id = ? ORDER BY created_at DESC';
    db.query(query, [scholarship_id], callback);
  }

  static getByStudentAndScholarship(student_id, scholarship_id, callback) {
    const query = 'SELECT * FROM scholarship_applications WHERE student_id = ? AND scholarship_id = ? LIMIT 1';
    db.query(query, [student_id, scholarship_id], callback);
  }

  static getById(id, callback) {
    const query = `SELECT a.*, s.name AS scholarship_name, st.name AS student_name, st.email AS email, st.subjects AS subjects
                   FROM scholarship_applications a
                   LEFT JOIN scholarships s ON a.scholarship_id = s.id
                   LEFT JOIN students st ON a.student_id = st.id
                   WHERE a.id = ?`;
    db.query(query, [id], callback);
  }

  static getAll(callback) {
    const query = `SELECT a.*, s.name AS scholarship_name,
               st.name AS student_name,
               st.email AS email,
               st.subjects AS subjects
             FROM scholarship_applications a
             LEFT JOIN scholarships s ON a.scholarship_id = s.id
             LEFT JOIN students st ON a.student_id = st.id
             ORDER BY a.created_at DESC`;
    db.query(query, callback);
  }

  static updateStatus(id, status, callback) {
    const query = 'UPDATE scholarship_applications SET status = ? WHERE id = ?';
    db.query(query, [status, id], callback);
  }
}

module.exports = ScholarshipApplication;
