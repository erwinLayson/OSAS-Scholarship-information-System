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

  static getById(id, callback) {
    const query = 'SELECT * FROM scholarship_applications WHERE id = ?';
    db.query(query, [id], callback);
  }
}

module.exports = ScholarshipApplication;
