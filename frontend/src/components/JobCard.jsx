import { Link } from 'react-router-dom';

const statusStyles = {
  Applied: 'bg-blue-100 text-blue-800',
  Interview: 'bg-yellow-100 text-yellow-800',
  Shortlisted: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Ghosted: 'bg-gray-100 text-gray-800',
};

export default function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{job.companyName}</h3>
          <p className="text-sm text-gray-600 mt-1">{job.role || 'No role specified'}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusStyles[job.status]}`}>
          {job.status}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <span>📅 {new Date(job.appliedDate).toLocaleDateString()}</span>
        {job.platform !== 'Unknown' && <span>🌐 {job.platform}</span>}
        <span className={job.source === 'Telegram' ? 'text-blue-600' : 'text-gray-600'}>
          {job.source === 'Telegram' ? '📱 Telegram' : '🖥️ Web'}
        </span>
      </div>
    </Link>
  );
}
