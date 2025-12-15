const db = require('../config/database');
const Reports = require('../model/reportModel');
const fs = require('fs');
const path = require('path');

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
        // Only apply status filter when a specific status is selected (not 'All')
        if (status && String(status).toLowerCase() !== 'all') {
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

        // write CSV file to disk and record report metadata
        try {
          const dir = path.join(__dirname, '..', 'generated_reports');
          fs.mkdirSync(dir, { recursive: true });
          const filepath = path.join(dir, filename);
          fs.writeFile(filepath, csv, 'utf8', (writeErr) => {
            const size_bytes = Buffer.byteLength(csv, 'utf8');
            const generated_by = req.user ? (req.user.username || req.user) : 'admin';

            if (writeErr) console.warn('Failed to write report file', writeErr);

            Reports.create({ name: filename, type: reportType, generated_by, filename, size_bytes, status: 'Ready' }, (err) => {
              if (err) console.warn('Failed to record report metadata', err);
              // send CSV back to client
              res.setHeader('Content-Type', 'text/csv');
              res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
              res.send(csv);
            });
          });
        } catch (e) {
          console.warn('Error recording report', e);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.send(csv);
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error', success: false, error });
    }
  }

  static async downloadReport(req, res) {
    const id = req.params.id;
    Reports.getById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      if (!results || !results[0]) return res.status(404).json({ message: 'Report not found', success: false });
      const report = results[0];
      const filepath = path.join(__dirname, '..', 'generated_reports', report.filename);
      fs.access(filepath, fs.constants.R_OK, (accessErr) => {
        if (accessErr) return res.status(404).json({ message: 'Report file not found', success: false });
        res.download(filepath, report.filename);
      });
    });
  }

  static async deleteReport(req, res) {
    const id = req.params.id;
    Reports.getById(id, (err, results) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      if (!results || !results[0]) return res.status(404).json({ message: 'Report not found', success: false });
      const report = results[0];
      const filepath = path.join(__dirname, '..', 'generated_reports', report.filename);
      fs.unlink(filepath, (unlinkErr) => {
        // ignore file unlink errors and proceed to delete DB row
        Reports.deleteById(id, (delErr, delRes) => {
          if (delErr) return res.status(500).json({ message: 'Failed to delete report', success: false, error: delErr });
          return res.status(200).json({ message: 'Report deleted', success: true });
        });
      });
    });
  }

  static async getSummary(req, res) {
    Reports.getSummary((err, data) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });

      const response = {
        totalReportsGenerated: data.total_this_month || 0,
        storageUsedBytes: data.storage_bytes || 0,
        lastGenerated: data.lastGenerated || null,
        mostGenerated: data.mostGenerated || null
      };

      res.status(200).json({ message: 'Summary retrieved', success: true, data: response });
    });
  }

  static async getRecent(req, res) {
    const limit = parseInt(req.query.limit || '10', 10);
    Reports.getRecent(limit, (err, results) => {
      if (err) return res.status(500).json({ message: 'Internal server error', success: false, error: err });
      res.status(200).json({ message: 'Recent reports', success: true, data: results });
    });
  }
}

module.exports = ReportController;
