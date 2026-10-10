'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { Save, Image as ImageIcon } from 'lucide-react';

export default function ReportCardSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: '',
    affiliationText: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    establishedText: '',
    leftLogoUrl: '',
    rightLogoUrl: '',
    watermarkUrl: '',
    principalSignature: '',
    sysAdminSignature: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/report-cards/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setSettings(prev => ({ ...prev, [fieldName]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.post('/report-cards/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Report Card Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure the design and text for the generated PDF report cards.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header Details</CardTitle>
          <p className="text-sm text-slate-500 mt-1">This information will appear at the top of the report card.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">School Name</label>
            <input type="text" name="schoolName" value={settings.schoolName || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. ASHA MODERN SCHOOL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Affiliation Text</label>
              <input type="text" name="affiliationText" value={settings.affiliationText || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. (Affiliated to C.B.S.E., New Delhi)" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Established Text</label>
              <input type="text" name="establishedText" value={settings.establishedText || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. ESTD 1946" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Address</label>
            <input type="text" name="address" value={settings.address || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Civil Lines, Saharanpur - 247001" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact / Phone</label>
              <input type="text" name="contact" value={settings.contact || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Ph: 0132 123456" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
              <input type="text" name="email" value={settings.email || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="info@school.in" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Website</label>
              <input type="text" name="website" value={settings.website || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="http://school.in" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logos & Signatures (Images)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Upload images to be embedded in the PDF (Max 1MB each).</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14}/> Left Logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'leftLogoUrl')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              {settings.leftLogoUrl && <img src={settings.leftLogoUrl} alt="Preview" className="mt-2 max-h-12 object-contain" />}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14}/> Right Logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'rightLogoUrl')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              {settings.rightLogoUrl && <img src={settings.rightLogoUrl} alt="Preview" className="mt-2 max-h-12 object-contain" />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14}/> Background Watermark</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'watermarkUrl')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
            {settings.watermarkUrl && <img src={settings.watermarkUrl} alt="Preview" className="mt-2 max-h-24 object-contain" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14}/> System Admin Signature</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'sysAdminSignature')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              {settings.sysAdminSignature && <img src={settings.sysAdminSignature} alt="Preview" className="mt-2 max-h-12 object-contain" />}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><ImageIcon size={14}/> Principal Signature</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'principalSignature')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              {settings.principalSignature && <img src={settings.principalSignature} alt="Preview" className="mt-2 max-h-12 object-contain" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
