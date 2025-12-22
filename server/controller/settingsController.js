const Settings = require('../model/settingsModel');

const settingsController = {
  getAllowGradeEdit: (req, res) => {
    // return allow flag as well as current session id and semester so clients can detect prior updates
    Settings.getByKey('allow_grade_edit', (err, result) => {
      if (err) return res.status(500).json({ message: err.message || 'Internal server error', success: false });
      const row = (result && result.length > 0) ? result[0] : null;
      const val = row ? (String(row.setting_value) === 'true') : false;

      Settings.getByKey('grade_edit_session', (err2, res2) => {
        if (err2) console.warn('Failed to read grade_edit_session', err2 && err2.message ? err2.message : err2);
        const sessionRow = (res2 && res2.length > 0) ? res2[0] : null;
        const sessionId = sessionRow ? (sessionRow.setting_value || '') : '';

        Settings.getByKey('grade_edit_semester', (err3, res3) => {
          if (err3) console.warn('Failed to read grade_edit_semester', err3 && err3.message ? err3.message : err3);
          const semRow = (res3 && res3.length > 0) ? res3[0] : null;
          const semester = semRow ? (semRow.setting_value || '') : '';

          return res.status(200).json({ message: 'ok', success: true, value: val, sessionId, semester });
        });
      });
    });
  },

  setAllowGradeEdit: (req, res) => {
    const { value, semester } = req.body;
    if (typeof value === 'undefined') return res.status(400).json({ message: 'Missing value', success: false });
    const v = value ? 'true' : 'false';

    // when enabling, require semester info
    if (value) {
      if (!semester || typeof semester !== 'string' || !semester.match(/^[0-9]{4}-S[12]$/)) {
        return res.status(400).json({ message: 'Missing or invalid semester. Use format YYYY-S1 or YYYY-S2', success: false });
      }
    }

    // when enabling, create a new session id so students can update once per enable
    const sessionId = value ? String(Date.now()) : '';

    Settings.upsert('allow_grade_edit', v, (err) => {
      if (err) return res.status(500).json({ message: err.message || 'Internal server error', success: false });

      // store/clear session id and semester
      Settings.upsert('grade_edit_session', sessionId, (err2) => {
        if (err2) console.warn('Failed to save grade_edit_session', err2 && err2.message ? err2.message : err2);
        const semValue = value ? semester : '';
        Settings.upsert('grade_edit_semester', semValue, (err3) => {
          if (err3) console.warn('Failed to save grade_edit_semester', err3 && err3.message ? err3.message : err3);
          return res.status(200).json({ message: 'Setting updated', success: true, value: v === 'true' });
        });
      });
    });
  }
};

module.exports = settingsController;