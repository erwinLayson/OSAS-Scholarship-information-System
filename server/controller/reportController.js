const db = require('../config/database');

function formatCSV(rows, headers) {
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  const lines = [];
  lines.push(headers.join(','));
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

class ReportController {
  static async generateReport(req, res) {
    try {
      const { reportType, dateFrom, dateTo, status } = req.body;
      const params = [];
      let sql = '';

      const hasDateRange = dateFrom && dateTo;

      if (reportType === 'students') {
        sql = 'SELECT * FROM students';
        if (hasDateRange) sql += ' WHERE DATE(created_at) BETWEEN ? AND ?', params.push(dateFrom, dateTo);
      } else if (reportType === 'scholarships') {
        sql = 'SELECT * FROM scholarships';
        if (hasDateRange) sql += ' WHERE DATE(created_at) BETWEEN ? AND ?', params.push(dateFrom, dateTo);
        if (status) {
          sql += hasDateRange ? ' AND status = ?' : ' WHERE status = ?';
          params.push(status);
        }
      } else if (reportType === 'applications') {
        sql = 'SELECT * FROM applicants';
        if (hasDateRange) sql += ' WHERE DATE(created_at) BETWEEN ? AND ?', params.push(dateFrom, dateTo);
      } else if (reportType === 'academic') {
        // reuse students data and compute averages in JS
        sql = 'SELECT * FROM students';
        if (hasDateRange) sql += ' WHERE DATE(created_at) BETWEEN ? AND ?', params.push(dateFrom, dateTo);
      } else {
        return res.status(400).json({ message: 'Invalid report type', success: false });
      }

      db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', success: false, error: err });

        let headers = [];
        let rows = [];

        if (!results || results.length === 0) {
          headers = ['no_data'];
          rows = [];
        } else if (reportType === 'academic') {
          // compute average and include all student columns plus `average`
          const parseSubjects = (field) => {
            if (!field) return [];
            try { return typeof field === 'string' ? JSON.parse(field) : field; } catch(e){ return []; }
          };

          headers = Object.keys(results[0]).filter(h => h !== undefined);
          if (!headers.includes('average')) headers.push('average');

          rows = results.map(r => {
            const obj = {};
            for (const k of Object.keys(r)) {
              let v = r[k];
              if (v instanceof Date) v = v.toISOString();
              else if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
              obj[k] = v;
            }
            const subs = parseSubjects(r.subjects);
            const grades = Array.isArray(subs) ? subs.map(s => parseFloat(s.grade ?? s.score ?? s.value ?? NaN)).filter(n => !isNaN(n)) : [];
            obj['average'] = grades.length ? (grades.reduce((a,b)=>a+b,0)/grades.length).toFixed(2) : '';
            return obj;
          });
        } else {
          // generic: include all fields returned by the query
          headers = Object.keys(results[0]);
          rows = results.map(r => {
            const obj = {};
            for (const k of Object.keys(r)) {
              let v = r[k];
              if (v instanceof Date) v = v.toISOString();
              else if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
              obj[k] = v;
            }
            return obj;
          });
        }

        const csv = formatCSV(rows, headers);
        const filename = `report-${reportType}-${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error', success: false, error });
    }
  }
}

module.exports = ReportController;
