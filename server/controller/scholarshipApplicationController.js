const path = require('path');
const fs = require('fs');
const ScholarshipApplication = require('../model/scholarshipApplicationModel');
const { authenticateStudent } = require('../authenticate/auth');

class ScholarshipApplicationController {
  // Handles file uploads and creates an application record
  static apply(req, res) {
    // req.user should be present from authenticateStudent middleware
    const student = req.user;
    console.log('ScholarshipApplicationController.apply: req.user=', student);
    const scholarship_id = req.params.id;

    if (!student || !student.id) return res.status(401).json({ message: 'Authentication required', success: false });

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
  }
}

module.exports = ScholarshipApplicationController;
