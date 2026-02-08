import { useState, useEffect } from 'react';
import API from '../../../API/fetchAPI';
import { Button, Modal } from '../../shared/ui';

function EnableStudentEditGrade({ showToast = () => {} }) {
  const [allowGradeEdit, setAllowGradeEdit] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [semesterInput, setSemesterInput] = useState('');

  useEffect(() => {
    // Fetch current setting from server
    (async () => {
      try {
        const res = await API.get('/settings/allow_grade_edit');
        if (res.data && res.data.success) {
          setAllowGradeEdit(!!res.data.value);
        }
      } catch (e) {
        // Fallback to localStorage for compatibility
        try {
          const val = localStorage.getItem('allow_grade_edit') === 'true';
          setAllowGradeEdit(val);
        } catch (e2) {}
      }
    })();
  }, []);

  const handleToggleClick = async () => {
    const confirmMsg = allowGradeEdit 
      ? 'Disable students from updating semester grades?' 
      : 'Enable students to update semester grades?';
    if (!confirm(confirmMsg)) return;
    
    const next = !allowGradeEdit;

    if (next) {
      // When enabling, show semester picker first
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const sem = month >= 7 ? 'S2' : 'S1';
      setSemesterInput(`${year}-${sem}`);
      setShowSemesterPicker(true);
      return;
    }

    // When disabling, directly update
    try {
      const res = await API.put('/settings/allow_grade_edit', { value: next });
      if (res.data && res.data.success) {
        setAllowGradeEdit(next);
        try { localStorage.setItem('allow_grade_edit', next ? 'true' : 'false'); } catch (e) {}
        showToast('Students can no longer update semester grades', 'warning');
      } else {
        showToast(res.data?.message || 'Failed to update setting', 'error');
      }
    } catch (err) {
      console.error('Failed to update setting', err);
      showToast('Failed to update setting', 'error');
    }
  };

  const handleEnableSemester = async () => {
    const sem = String(semesterInput || '').trim();
    if (!/^[0-9]{4}-S[12]$/.test(sem)) {
      showToast('Invalid semester. Use format YYYY-S1 or YYYY-S2', 'error');
      return;
    }
    try {
      const res = await API.put('/settings/allow_grade_edit', { value: true, semester: sem });
      if (res.data && res.data.success) {
        setAllowGradeEdit(true);
        try { localStorage.setItem('allow_grade_edit', 'true'); } catch (e) {}
        showToast('Students can now update semester grades', 'success');
        setShowSemesterPicker(false);
      } else {
        showToast(res.data?.message || 'Failed to update setting', 'error');
      }
    } catch (err) {
      console.error('Failed to update setting', err);
      showToast('Failed to update setting', 'error');
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant={allowGradeEdit ? "secondary" : "primary"}
        onClick={handleToggleClick}
      >
        {allowGradeEdit ? 'Disable Grade Update' : 'Enable Grade Update'}
      </Button>

      {/* Semester Picker Modal */}
      <Modal
        isOpen={showSemesterPicker}
        onClose={() => setShowSemesterPicker(false)}
        title="Select Semester to Enable"
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={semesterInput.split('-')[0] || ''}
                onChange={(e) => {
                  const yr = String(e.target.value || '').slice(0,4);
                  const part = semesterInput.split('-')[1] || 'S1';
                  setSemesterInput(`${yr}-${part}`);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select 
                value={semesterInput.split('-')[1] || 'S1'} 
                onChange={(e) => {
                  const yr = semesterInput.split('-')[0] || new Date().getFullYear();
                  setSemesterInput(`${yr}-${e.target.value}`);
                }} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="S1">S1 (1st Sem)</option>
                <option value="S2">S2 (2nd Sem)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowSemesterPicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnableSemester}>
              Enable
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default EnableStudentEditGrade;