const path = require('path');
const fs = require('fs');
const ScholarshipApplication = require('../model/scholarshipApplicationModel');
const { authenticateStudent } = require('../authenticate/auth');
const { sendScholarshipMail, rejectionMail } = require('./shared/mailer');

class ScholarshipApplicationController {
  // Handles file uploads and creates an application record
  static apply(req, res) {
    // req.user should be present from authenticateStudent middleware
    const student = req.user;
    console.log('ScholarshipApplicationController.apply: req.user=', student);
    const scholarship_id = req.params.id;

    if (!student || !student.id) return res.status(401).json({ message: 'Authentication required', success: false });

    // Before saving files, ensure the student hasn't already applied to this scholarship
    ScholarshipApplication.getByStudentAndScholarship(student.id, scholarship_id, (checkErr, existingRows) => {
      if (checkErr) {
        console.error('Error checking existing application:', checkErr);
        return res.status(500).json({ message: 'Internal server error', success: false, error: checkErr });
      }

      if (existingRows && existingRows.length > 0) {
        return res.status(400).json({ message: 'You have already applied for this scholarship', success: false });
      }

      // files handled by multer are available as req.files
      const files = req.files ?? [];
      const savedFiles = [];

      try {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'scholarship_applications');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        files.forEach(file => {
          // move file from multer temp to uploads with original filename prefix
          const timestamp = Date.now();
          const safeName = `${student.id}_${timestamp}_${file.originalname}`.replace(/\s+/g, '_');
          const dest = path.join(uploadDir, safeName);
          fs.renameSync(file.path, dest);
          // store relative path
          savedFiles.push(path.join('uploads', 'scholarship_applications', safeName));
        });

        const payload = {
          student_id: student.id,
          scholarship_id: scholarship_id,
          documents: savedFiles
        };

        ScholarshipApplication.create(payload, (err, result) => {
          if (err) {
            console.error('Error saving scholarship application:', err);
            return res.status(500).json({ message: 'Failed to save application', success: false, error: err });
          }

          return res.status(201).json({ message: 'Application submitted', success: true, applicationId: result.insertId });
        });
      } catch (e) {
        console.error('Apply error', e);
        return res.status(500).json({ message: 'Failed to process files', success: false, error: e.message });
      }
    });
  }

  static listAll(req, res) {
    const ScholarshipApplication = require('../model/scholarshipApplicationModel');
    ScholarshipApplication.getAll((err, rows) => {
      if (err) {
        console.error('Error fetching applications:', err);
        return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      }
      return res.status(200).json({ message: 'Applications retrieved', success: true, data: rows });
    });
  }

  static getById(req, res) {
    const id = req.params.id;
    ScholarshipApplication.getById(id, (err, rows) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Application not found', success: false });
      return res.status(200).json({ message: 'Application retrieved', success: true, data: rows[0] });
    });
  }

  static updateStatus(req, res) {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required', success: false });

    ScholarshipApplication.getById(id, (err, rows) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Application not found', success: false });

      ScholarshipApplication.updateStatus(id, status, (uErr) => {
        if (uErr) return res.status(500).json({ message: 'Failed to update status', success: false, error: uErr });
        // send notification email to applicant
        try {
          const to = app.email || app.email;
          const scholarshipName = app.scholarship_name || 'the scholarship';
          if (status === 'Approved') {
            sendScholarshipMail(
              'Scholarship Application Approved',
              to,
              `Congratulations! Your application for ${scholarshipName} has been approved.`
            );
          } else if (status === 'Rejected') {
            rejectionMail(
              to,
              'Scholarship Application Rejected',
              'We are sorry to inform you',
              `Your application for ${scholarshipName} has been rejected.`
            );
          }
        } catch (e) {
          console.warn('Failed to send status email', e && e.message);
        }

        return res.status(200).json({ message: 'Status updated', success: true });
      });
    });
  }

  static downloadDocument(req, res) {
    const id = req.params.id;
    const index = parseInt(req.params.index || '0', 10);

    ScholarshipApplication.getById(id, (err, rows) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Application not found', success: false });

      const app = rows[0];
      let docs = app.documents || app.documents;
      try {
        if (typeof docs === 'string') docs = JSON.parse(docs);
      } catch (e) {
        docs = docs || [];
      }

      if (!Array.isArray(docs) || docs.length === 0 || index < 0 || index >= docs.length) {
        return res.status(404).json({ message: 'Document not found', success: false });
      }

      const docPath = docs[index];
      const fullPath = path.join(__dirname, '..', docPath);

      if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File not found on server', success: false });

      return res.sendFile(fullPath);
    });
  }
}

module.exports = ScholarshipApplicationController;
