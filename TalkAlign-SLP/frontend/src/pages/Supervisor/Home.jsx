import { Users, Stethoscope, CalendarDays, FileText, ArrowUpRight } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients.js';

export default function SupervisorHome() {
  const { patients } = usePatients();
  
  // Simulated clinic data
  const stats = [
    { label: 'Total Patients', value: patients?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%' },
    { label: 'Active Doctors', value: 4, icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Stable' },
    { label: 'Sessions This Week', value: 38, icon: CalendarDays, color: 'text-teal-600', bg: 'bg-teal-100', trend: '+5%' },
    { label: 'Pending Reviews', value: 7, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', trend: '-2' },
  ];

  const recentActivity = [
    { id: 1, action: 'Session Completed', subject: 'Dr. Aisha Nair', detail: 'with Aarav Sharma', time: '10 mins ago', status: 'success' },
    { id: 2, action: 'New Patient Registered', subject: 'System', detail: 'Rohan Verma added to waitlist', time: '1 hour ago', status: 'info' },
    { id: 3, action: 'Schedule Updated', subject: 'Dr. Sarah Lee', detail: 'Moved 3 sessions', time: '2 hours ago', status: 'warning' },
    { id: 4, action: 'SOAP Note Finalized', subject: 'Dr. Aisha Nair', detail: 'for Sara Mehta', time: 'Yesterday', status: 'success' },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Clinic Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening across the clinic today.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          + Schedule Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart area stub */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Clinic Utilization (This Week)</h2>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
            <p className="text-slate-400 font-medium">Chart visualization will go here</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
          </div>
          
          <div className="space-y-6 flex-1">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 relative">
                <div className="absolute top-8 bottom-[-24px] left-[11px] w-px bg-slate-100 last:hidden" />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  activity.status === 'success' ? 'bg-emerald-100' :
                  activity.status === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-emerald-500' :
                    activity.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">{activity.subject}</span> {activity.detail}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
