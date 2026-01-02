import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, updateJob, deleteJob } from '../api';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await getJob(id);
      setJob(res.data);
      setFormData(res.data);
    } catch (error) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateJob(id, { status: newStatus });
      setJob({ ...job, status: newStatus });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateJob(id, formData);
      setJob(res.data);
      setEditing(false);
      toast.success('Job updated');
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{job.companyName}</h1>
          <p className="text-gray-600">{job.role || 'No role specified'}</p>
        </div>
        <StatusBadge status={job.status} onChange={handleStatusChange} />
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Link</label>
              <input
                type="url"
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {['LinkedIn', 'Company Site', 'Referral', 'Indeed', 'Glassdoor', 'AngelList', 'Other', 'Unknown'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={formData.interviewDate ? formData.interviewDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setFormData(job);
                  setEditing(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applied Date</p>
                <p className="font-medium">{new Date(job.appliedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform</p>
                <p className="font-medium">{job.platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium">{job.source === 'Telegram' ? '📱 Telegram' : '🖥️ Web'}</p>
              </div>
              {job.interviewDate && (
                <div>
                  <p className="text-sm text-gray-500">Interview Date</p>
                  <p className="font-medium">{new Date(job.interviewDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            {job.jobLink && (
              <div>
                <p className="text-sm text-gray-500">Job Link</p>
                <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">
                  {job.jobLink}
                </a>
              </div>
            )}

            {job.contactEmail && (
              <div>
                <p className="text-sm text-gray-500">Contact Email</p>
                <a href={`mailto:${job.contactEmail}`} className="text-primary-600 hover:underline">
                  {job.contactEmail}
                </a>
              </div>
            )}

            {job.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      {job.statusHistory && job.statusHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="font-medium text-gray-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {job.statusHistory.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <div className="flex-1">
                  <span className="font-medium">{entry.status}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(entry.changedAt).toLocaleDateString()}
                  </span>
                  {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
