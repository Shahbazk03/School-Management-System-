'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const generateTeacherId = () => `TEACH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generateEmployeeId = () => `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
  const generatePassword = () => Math.random().toString(36).slice(-6) + 'T1@';

  const [formData, setFormData] = useState({
    teacherId: generateTeacherId(),
    teacherPassword: generatePassword(),
    employeeId: generateEmployeeId(),
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    qualifications: '', // We will store filename or base64 here
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [resetTarget, setResetTarget] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetResult, setResetResult] = useState<string | null>(null);

  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassSection, setSelectedClassSection] = useState('');

  const [editTarget, setEditTarget] = useState<any>(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    employeeId: '',
    department: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchTeachers();
    apiClient.get('/schools/settings').then(res => setSchoolId(res.data?.id)).catch(() => {});
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/teachers');
      setTeachers(res.data);
    } catch (e) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/classes');
      setClasses(res.data);
    } catch (e) {
      console.error('Failed to load classes');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !resetTarget) return;
    try {
      const res = await apiClient.post(`/teachers/${resetTarget.id}/reset-password`, { newPassword });
      setResetResult(res.data.password);
      toast.success('Password updated successfully');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAssignClass = async () => {
    if (!selectedClassSection || !assignTarget) return;
    try {
      await apiClient.post(`/teachers/${assignTarget.id}/assign-class/${selectedClassSection}`);
      toast.success('Assigned as Class Teacher');
      setAssignTarget(null);
      setSelectedClassSection('');
      fetchTeachers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to assign class teacher');
    }
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    try {
      await apiClient.patch(`/teachers/${editTarget.id}`, editData);
      toast.success('Teacher updated successfully');
      setEditTarget(null);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update teacher');
    } finally {
      setEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error('School context is missing.');
      return;
    }
    setSaving(true);
    try {
      // In a real app, you would use FormData for file uploads. 
      // Here we just save the file name to the string field for demonstration.
      const payload = { 
        ...formData, 
        schoolId,
        qualifications: cvFile ? cvFile.name : formData.qualifications,
        password: formData.teacherPassword
      };
      const res = await apiClient.post('/teachers', payload);
      setCredentials(res.data.credentials);
      toast.success('Teacher account created successfully');
      fetchTeachers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const rows = text.split('\n').map(r => r.trim()).filter(r => r);
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        const payloadArr = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => obj[h] = values[i]);
          return {
            teacherId: obj.teacherid || generateTeacherId(),
            employeeId: obj.employeeid || generateEmployeeId(),
            firstName: obj.firstname || 'Unknown',
            lastName: obj.lastname || '',
            email: obj.email || '',
            mobile: obj.mobile || '',
            qualifications: obj.qualifications || '',
            department: obj.department || '',
            joiningDate: obj.joiningdate || new Date().toISOString().split('T')[0],
            password: generatePassword(),
            schoolId
          };
        });

        if (payloadArr.length === 0) throw new Error("No data found in CSV");

        await apiClient.post('/teachers/bulk', payloadArr);
        toast.success(`Successfully imported ${payloadArr.length} teachers`);
        fetchTeachers();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err.message || 'Failed to parse/upload CSV');
      } finally {
        setBulkUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setCredentials(null);
    setShowForm(false);
    setCvFile(null);
    setFormData({
      teacherId: generateTeacherId(),
      teacherPassword: generatePassword(),
      employeeId: generateEmployeeId(),
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      qualifications: '',
      department: '',
      joiningDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
        {!showForm && (
          <div className="flex gap-2">
            <div>
              <input type="file" id="bulkUpload" accept=".csv" className="hidden" onChange={handleBulkUpload} disabled={bulkUploading} />
              <label htmlFor="bulkUpload" className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow hover:bg-green-700 cursor-pointer block text-center opacity-90">
                {bulkUploading ? 'Uploading...' : 'Bulk Import (CSV)'}
              </label>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700"
            >
              + Add Teacher
            </button>
          </div>
        )}
      </div>

      {showForm && !credentials && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Teacher Login ID</label><input required name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="TEACH-2026-0001" /></div>
                <div><label className="block text-sm font-medium mb-1">Teacher Password</label><input required name="teacherPassword" value={formData.teacherPassword} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Enter password" /></div>
                <div><label className="block text-sm font-medium mb-1">Employee ID</label><input required name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Mobile</label><input name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">CV (PDF format)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="w-full p-1.5 border rounded bg-white text-sm" />
                </div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Joining Date</label><input type="date" required name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {saving ? 'Processing...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {credentials && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Teacher Created Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded border border-green-200">
                <h4 className="font-bold text-lg mb-2">Teacher Credentials</h4>
                <p><strong>Login ID:</strong> {credentials.loginId}</p>
                <p><strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{credentials.password}</code></p>
              </div>
              <div className="pt-4 flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">Print Credentials</button>
                <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">Done</button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Teacher ID</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Employee ID</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Class Teacher Of</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{teacher.teacherId}</td>
                    <td className="px-4 py-3 font-medium">{teacher.firstName} {teacher.lastName}</td>
                    <td className="px-4 py-3">{teacher.employeeId}</td>
                    <td className="px-4 py-3">{teacher.email || '—'}</td>
                    <td className="px-4 py-3">
                      {teacher.classSections?.length > 0 ? (
                        teacher.classSections.map((cs: any) => (
                          <Badge key={cs.id} variant="secondary" className="mr-1">
                            {cs.class?.name} {cs.section?.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => {
                          setEditTarget(teacher);
                          setEditData({
                            firstName: teacher.firstName,
                            lastName: teacher.lastName,
                            email: teacher.email || '',
                            mobile: teacher.mobile || '',
                            employeeId: teacher.employeeId || '',
                            department: teacher.department || ''
                          });
                        }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { setAssignTarget(teacher); fetchClasses(); }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Assign Class
                      </button>
                      <button 
                        onClick={() => { setResetTarget(teacher); setResetResult(null); setNewPassword(''); }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Update Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Password Reset Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Update Password</h3>
              <p className="text-sm text-gray-500">For {resetTarget.firstName} {resetTarget.lastName} ({resetTarget.teacherId})</p>
            </div>
            <div className="p-6 space-y-4">
              {resetResult ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                  <p className="font-bold mb-2">Password successfully updated!</p>
                  <p>New Password: <code className="bg-white px-2 py-1 rounded border">{resetResult}</code></p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
                    <strong>Note:</strong> For security reasons, the current password is encrypted and cannot be displayed.
                  </div>
                  <label className="block text-sm font-medium mb-1">Set New Password</label>
                  <input 
                    required
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter new password" 
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => { setResetTarget(null); setResetResult(null); }} className="px-4 py-2 bg-gray-200 rounded text-sm font-medium">
                {resetResult ? 'Close' : 'Cancel'}
              </button>
              {!resetResult && (
                <button onClick={handleResetPassword} disabled={!newPassword} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
                  Update Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Class Teacher Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Assign Class Teacher</h3>
              <p className="text-sm text-gray-500">For {assignTarget.firstName} {assignTarget.lastName}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Class & Section</label>
                <select 
                  value={selectedClassSection} 
                  onChange={e => setSelectedClassSection(e.target.value)} 
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls: any) => 
                    cls.classSections?.map((cs: any) => (
                      <option key={cs.id} value={cs.id}>
                        {cls.name} - Section {cs.section?.name}
                      </option>
                    ))
                  )}
                </select>
                {classes.length === 0 && <p className="text-xs text-red-500 mt-1">No classes found. Please create classes first.</p>}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => setAssignTarget(null)} className="px-4 py-2 bg-gray-200 rounded text-sm font-medium">Cancel</button>
              <button onClick={handleAssignClass} disabled={!selectedClassSection} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden my-8">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Edit Teacher Details</h3>
              <p className="text-sm text-gray-500">For {editTarget.teacherId}</p>
            </div>
            <form onSubmit={handleEditTeacher}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input required value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input required value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} className="w-full p-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input required value={editData.employeeId} onChange={e => setEditData({...editData, employeeId: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile</label>
                  <input value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input value={editData.department} onChange={e => setEditData({...editData, department: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 bg-gray-200 rounded text-sm font-medium">Cancel</button>
                <button type="submit" disabled={editing} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}