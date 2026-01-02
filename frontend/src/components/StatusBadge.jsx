export default function StatusBadge({ status, onChange }) {
  const statuses = ['Applied', 'Interview', 'Shortlisted', 'Offer', 'Rejected', 'Ghosted'];
  
  const statusStyles = {
    Applied: 'bg-blue-100 text-blue-800 border-blue-200',
    Interview: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
    Offer: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Ghosted: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  if (onChange) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`px-3 py-1 text-sm font-medium rounded border cursor-pointer ${statusStyles[status]}`}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    );
  }

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded border ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
