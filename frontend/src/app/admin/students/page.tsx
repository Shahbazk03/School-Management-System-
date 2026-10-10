'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // Form Data
  const generateId = (prefix: string) => `${prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const generatePassword = () => Math.random().toString(36).slice(-6) + 'A1@';
  const generateAdmissionNo = () => `ADM-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    // Step 1: Student
    studentId: generateId('STU'),
    studentPassword: generatePassword(),
    admissionNo: generateAdmissionNo(),
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'MALE',
    
    // Step 2: Parent
    parentLoginId: generateId('PAR'),
    parentPassword: generatePassword(),
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'FATHER',
    
    // Step 3: Academic
    academicSessionId: '',
    classSectionId: '',
    rollNumber: '',
  });

  // Supporting Lookups
  const [sessions, setSessions] = useState<any[]>([]);
  const [classSections, setClassSections] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  
  // Bulk Import
  const [showBulk, setShowBulk] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Reset Password
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetResult, setResetResult] = useState<string | null>(null);

  // Enroll existing student state
  const [enrollTarget, setEnrollTarget] = useState<any>(null);
  const [enrollSessionId, setEnrollSessionId] = useState('');
  const [enrollClassSectionId, setEnrollClassSectionId] = useState('');
  const [enrollRollNumber, setEnrollRollNumber] = useState('');
  const [enrollSaving, setEnrollSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchLookups();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/students');
      setStudents(res.data);
    } catch (e) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [sessRes, classRes, schoolRes] = await Promise.all([
        apiClient.get('/academic-sessions').catch(() => ({ data: [] })),
        apiClient.get('/classes').catch(() => ({ data: [] })),
        apiClient.get('/schools/settings').catch(() => ({ data: null }))
      ]);
      setSessions(sessRes.data);
      
      const flatSections: any[] = [];
      (classRes.data || []).forEach((c: any) => {
        (c.classSections || []).forEach((cs: any) => {
          flatSections.push({
            id: cs.id,
            class: { name: c.name },
            section: { name: cs.section?.name }
          });
        });
      });
      setClassSections(flatSections);
      
      if (schoolRes.data) setSchoolId(schoolRes.data.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!schoolId) {
      toast.error('School context is missing. Cannot create student.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, schoolId };
      const res = await apiClient.post('/students', payload);
      setCredentials(res.data.credentials);
      toast.success('Student admission completed successfully');
      fetchStudents();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to complete admission workflow');
    } finally {
      setSaving(false);
    }
  };

  const resetWizard = () => {
    setCredentials(null);
    setStep(1);
    setShowWizard(false);
    setFormData({
      studentId: generateId('STU'),
      studentPassword: generatePassword(),
      admissionNo: generateAdmissionNo(),
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'MALE',
      parentLoginId: generateId('PAR'),
      parentPassword: generatePassword(),
      parentFirstName: '',
      parentLastName: '',
      parentPhone: '',
      parentEmail: '',
      parentRelation: 'FATHER',
      academicSessionId: '',
      classSectionId: '',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length <= 1) return toast.error('CSV is empty or missing headers');
      const headers = lines[0].split(',');
      const students = lines.slice(1).map((line, idx) => {
        const values = line.split(',');
        let obj: any = { _id: idx };
        headers.forEach((h, i) => {
          obj[h.trim()] = values[i]?.trim();
        });
        if(!obj.studentPassword) obj.studentPassword = Math.random().toString(36).slice(-8) + 'A1!';
        if(!obj.parentPassword) obj.parentPassword = Math.random().toString(36).slice(-8) + 'B2@';
        return obj;
      });
      setBulkData(students);
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if(!schoolId) return toast.error('School context is missing.');
    setBulkSaving(true);
    try {
      const payload = bulkData.map(s => ({ ...s, schoolId }));
      await apiClient.post('/students/bulk', payload);
      toast.success('Bulk import successful');
      setBulkData([]);
      setShowBulk(false);
      fetchStudents();
    } catch(e) {
      toast.error('Bulk import failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if(!resetTarget) return;
    try {
      const res = await apiClient.post(`/students/${resetTarget.id}/reset-password`, { newPassword: newPassword || undefined });
      setResetResult(res.data.password);
      toast.success('Password reset successful');
    } catch(e: any) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleEnrollStudent = async () => {
    if(!enrollTarget || !enrollSessionId || !enrollClassSectionId) return;
    setEnrollSaving(true);
    try {
      await apiClient.post('/enrollments', {
        studentId: enrollTarget.id,
        academicSessionId: enrollSessionId,
        classSectionId: enrollClassSectionId,
        admissionStatus: 'ENROLLED',
        startDate: new Date().toISOString(),
        rollNumber: enrollRollNumber || undefined
      });
      toast.success('Student enrolled successfully');
      setEnrollTarget(null);
      setEnrollSessionId('');
      setEnrollClassSectionId('');
      setEnrollRollNumber('');
      fetchStudents();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to enroll student');
    } finally {
      setEnrollSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        {!showWizard && !showBulk && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBulk(true)}
              className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow hover:bg-green-700"
            >
              Bulk Import (CSV)
            </button>
            <button 
              onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700"
            >
              + Add Student
            </button>
          </div>
        )}
      </div>

      {showBulk && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Upload a CSV with headers: <code>studentId, firstName, lastName, dob, gender, admissionNo, parentLoginId, parentFirstName, parentLastName, parentRelation</code>. Passwords will be auto-generated if missing.
            </p>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full p-2 border rounded" />
            
            {bulkData.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-2 py-2">Student ID</th>
                      <th className="px-2 py-2">Student Name</th>
                      <th className="px-2 py-2">Student Pwd</th>
                      <th className="px-2 py-2">Parent ID</th>
                      <th className="px-2 py-2">Parent Pwd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map(s => (
                      <tr key={s._id} className="border-b">
                        <td className="px-2 py-2"><input value={s.studentId || ''} onChange={e => { const nd = [...bulkData]; nd[s._id].studentId = e.target.value; setBulkData(nd); }} className="w-full p-1 border rounded" /></td>
                        <td className="px-2 py-2">{s.firstName} {s.lastName}</td>
                        <td className="px-2 py-2"><input value={s.studentPassword || ''} onChange={e => { const nd = [...bulkData]; nd[s._id].studentPassword = e.target.value; setBulkData(nd); }} className="w-full p-1 border rounded" /></td>
                        <td className="px-2 py-2"><input value={s.parentLoginId || ''} onChange={e => { const nd = [...bulkData]; nd[s._id].parentLoginId = e.target.value; setBulkData(nd); }} className="w-full p-1 border rounded" /></td>
                        <td className="px-2 py-2"><input value={s.parentPassword || ''} onChange={e => { const nd = [...bulkData]; nd[s._id].parentPassword = e.target.value; setBulkData(nd); }} className="w-full p-1 border rounded" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setShowBulk(false); setBulkData([]); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button onClick={handleBulkSubmit} disabled={bulkSaving || bulkData.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                {bulkSaving ? 'Saving...' : 'Submit Import'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {showWizard && !credentials && (
        <Card>
          <CardHeader>
            <CardTitle>Admission Wizard - Step {step} of 3</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><h3 className="font-bold text-lg mb-2">Student Information</h3></div>
                  <div><label className="block text-sm font-medium mb-1">Student Login ID</label><input required name="studentId" value={formData.studentId} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Password</label>
                    <input required name="studentPassword" value={formData.studentPassword} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Enter password (e.g. stu@123)" />
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Admission No</label><input required name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">First Name</label><input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name</label><input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Gender</label><select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><h3 className="font-bold text-lg mb-2">Parent/Guardian Information</h3></div>
                  <div><label className="block text-sm font-medium mb-1">Parent Login ID</label><input required name="parentLoginId" value={formData.parentLoginId} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Parent Password</label>
                    <input required name="parentPassword" value={formData.parentPassword} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Enter password (e.g. par@123)" />
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Relationship</label><select name="parentRelation" value={formData.parentRelation} onChange={handleInputChange} className="w-full p-2 border rounded"><option value="FATHER">Father</option><option value="MOTHER">Mother</option><option value="GUARDIAN">Guardian</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">First Name</label><input required name="parentFirstName" value={formData.parentFirstName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name</label><input required name="parentLastName" value={formData.parentLastName} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><h3 className="font-bold text-lg mb-2">Academic Enrollment</h3></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Session</label>
                    <select required name="academicSessionId" value={formData.academicSessionId} onChange={handleInputChange} className="w-full p-2 border rounded">
                      <option value="">Select Session...</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Class Section (Optional if API handles later)</label>
                    <select name="classSectionId" value={formData.classSectionId} onChange={handleInputChange} className="w-full p-2 border rounded">
                      <option value="">Assign Later</option>
                      {classSections.map(cs => <option key={cs.id} value={cs.id}>{cs.class?.name} - Section {cs.section?.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Roll Number</label>
                    <input name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="e.g. 101, 12, etc." />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <button type="button" onClick={() => step > 1 ? setStep(step - 1) : resetWizard()} className="px-4 py-2 bg-gray-100 rounded">
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {saving ? 'Processing...' : step < 3 ? 'Next' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {credentials && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Admission Successful - Generated Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded border border-green-200">
                <h4 className="font-bold text-lg mb-2">Student Credentials</h4>
                <p><strong>Login ID:</strong> {credentials.student.loginId}</p>
                <p><strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{credentials.student.password}</code></p>
              </div>
              {credentials.parent && (
                <div className="p-4 bg-white rounded border border-green-200">
                  <h4 className="font-bold text-lg mb-2">Parent Credentials</h4>
                  <p><strong>Login ID:</strong> {credentials.parent.loginId}</p>
                  <p><strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{credentials.parent.password}</code></p>
                </div>
              )}
              <div className="pt-4 flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded">Print Credentials</button>
                <button onClick={resetWizard} className="px-4 py-2 bg-gray-200 rounded">Done</button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showWizard && !showBulk && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Student ID</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Admission No</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Class & Session</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Gender</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const latestEnrollment = student.enrollments?.[0];
                  return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{student.permanentId || student.studentId}</td>
                    <td className="px-4 py-3 font-medium">{student.firstName} {student.lastName}</td>
                    <td className="px-4 py-3">{student.admissionNo}</td>
                    <td className="px-4 py-3">
                      {latestEnrollment ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {latestEnrollment.classSection?.class?.name} - {latestEnrollment.classSection?.section?.name}
                            {latestEnrollment.rollNumber && <span className="ml-2 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs border border-blue-200">Roll: {latestEnrollment.rollNumber}</span>}
                          </span>
                          <span className="text-xs text-gray-500">{latestEnrollment.academicSession?.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-red-500 font-medium italic">Not Enrolled</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><Badge>{student.gender}</Badge></td>
                    <td className="px-4 py-3 text-right flex justify-end gap-3 items-center">
                      <button 
                        onClick={() => { setEnrollTarget(student); setEnrollSessionId(''); setEnrollClassSectionId(''); setEnrollRollNumber(''); }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Enroll to Class
                      </button>
                      <button 
                        onClick={() => { setResetTarget(student); setResetResult(null); setNewPassword(''); }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Update Password
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Update Password</h3>
              <p className="text-sm text-gray-500">For {resetTarget.firstName} {resetTarget.lastName}</p>
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
                    <strong>Note:</strong> For security reasons, the current password is mathematically encrypted (hashed) and cannot be displayed. You can safely override it by setting a new one.
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

      {/* Enroll Student Modal */}
      {enrollTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Enroll Student</h3>
              <p className="text-sm text-gray-500">For {enrollTarget.firstName} {enrollTarget.lastName}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Academic Session</label>
                <select value={enrollSessionId} onChange={e => setEnrollSessionId(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">-- Select Session --</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class & Section</label>
                <select value={enrollClassSectionId} onChange={e => setEnrollClassSectionId(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">-- Select Class --</option>
                  {classSections.map(cs => 
                    <option key={cs.id} value={cs.id}>{cs.class?.name} - Section {cs.section?.name}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Roll Number</label>
                <input value={enrollRollNumber} onChange={e => setEnrollRollNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 101, 12, etc." />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => setEnrollTarget(null)} className="px-4 py-2 bg-gray-200 rounded text-sm font-medium">Cancel</button>
              <button onClick={handleEnrollStudent} disabled={!enrollSessionId || !enrollClassSectionId || enrollSaving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
                {enrollSaving ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}