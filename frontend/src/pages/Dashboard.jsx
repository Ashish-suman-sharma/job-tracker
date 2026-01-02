import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getJobs } from '../api';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        getStats(),
        getJobs({ sortBy: 'date', order: 'desc' })
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Applied" value={stats?.total || 0} emoji="📝" color="blue" />
        <StatCard title="Interviews" value={stats?.interview || 0} emoji="💼" color="yellow" />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} emoji="⭐" color="purple" />
        <StatCard title="Offers" value={stats?.offer || 0} emoji="🎉" color="green" />
        <StatCard title="Rejected" value={stats?.rejected || 0} emoji="❌" color="red" />
        <StatCard title="Ghosted" value={stats?.ghosted || 0} emoji="👻" color="gray" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/add"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ➕ Add Job
          </Link>
          <Link
            to="/interviews"
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            💼 View Interviews
          </Link>
          <Link
            to="/jobs"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📋 All Jobs
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-gray-900">Recent Applications</h2>
          <Link to="/jobs" className="text-sm text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        
        {recentJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs tracked yet.</p>
            <Link to="/add" className="text-primary-600 hover:underline mt-2 inline-block">
              Add your first job application →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Telegram Info */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="font-medium text-blue-900 mb-2">📱 Telegram Integration</h2>
        <p className="text-sm text-blue-800">
          Add jobs faster via Telegram! Just message the bot and it will auto-parse your job applications.
          Send <code className="bg-blue-100 px-1 rounded">/link</code> to connect.
        </p>
      </div>
    </div>
  );
}
