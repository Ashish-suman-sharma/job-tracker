import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInterviews } from '../api';

export default function Interviews() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const res = await getInterviews();
      setJobs(res.data);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
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
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Interviews</h1>
      <p className="text-gray-600 mb-6">Jobs with Interview or Shortlisted status</p>

      {jobs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">🎉 No interviews scheduled yet!</p>
          <p className="text-gray-400 mt-2">Keep applying – you got this!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-gray-900">{job.companyName}</h3>
                  <p className="text-gray-600">{job.role || 'No role specified'}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded ${
                  job.status === 'Interview' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {job.status}
                </span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {job.interviewDate && (
                  <div className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                    📅 Interview: {new Date(job.interviewDate).toLocaleDateString()}
                  </div>
                )}
                <div className="text-gray-500">
                  Applied: {new Date(job.appliedDate).toLocaleDateString()}
                </div>
                {job.platform !== 'Unknown' && (
                  <div className="text-gray-500">🌐 {job.platform}</div>
                )}
              </div>

              {job.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  📝 {job.notes.slice(0, 150)}{job.notes.length > 150 ? '...' : ''}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Prep Tips */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="font-medium text-yellow-900 mb-3">💡 Interview Prep Tips</h2>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• Research the company's recent news and culture</li>
          <li>• Prepare your STAR stories for behavioral questions</li>
          <li>• Review the job description and match your experience</li>
          <li>• Prepare thoughtful questions to ask the interviewer</li>
        </ul>
      </div>
    </div>
  );
}
