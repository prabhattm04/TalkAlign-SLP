import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User, Stethoscope } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients.js';

export default function SupervisorSchedule() {
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { patients } = usePatients();

  // Mock appointments
  const appointments = [
    { id: 1, patient: 'Aarav Sharma', doctor: 'Dr. Aisha Nair', time: '09:00 AM', duration: '45m', status: 'Scheduled', day: 'Monday' },
    { id: 2, patient: 'Sara Mehta', doctor: 'Dr. Sarah Lee', time: '11:00 AM', duration: '30m', status: 'In Progress', day: 'Monday' },
    { id: 3, patient: 'Rohan Verma', doctor: 'Dr. Aisha Nair', time: '02:00 PM', duration: '50m', status: 'Scheduled', day: 'Tuesday' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];

  return (
    <div className="space-y-6 page-enter h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Schedule</h1>
          <p className="text-slate-500 mt-1">Manage clinic appointments and clinician schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Book Session
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[600px] overflow-hidden">
        
        {/* Calendar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
            <span className="font-bold text-slate-800 px-2">April 27 - May 1, 2026</span>
            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
          </div>
          
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            {['day', 'week', 'month'].map(v => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${view === v ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid (Week View Mockup) */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <div className="min-w-[800px] h-full flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-6 border-b border-slate-200 bg-white sticky top-0 z-10">
              <div className="p-3 border-r border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">Time</div>
              {days.map(d => (
                <div key={d} className="p-3 border-r border-slate-100 text-center font-semibold text-slate-700">{d}</div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="flex-1 relative pb-10">
              {hours.map(h => (
                <div key={h} className="grid grid-cols-6 border-b border-slate-100 min-h-[100px] group">
                  <div className="border-r border-slate-100 flex items-start justify-center pt-2 text-xs font-medium text-slate-500 bg-white/50">{h}</div>
                  {days.map(d => (
                    <div key={`${d}-${h}`} className="border-r border-slate-100 relative hover:bg-indigo-50/30 transition-colors p-1">
                      {/* Render Appointment if it matches day/time */}
                      {appointments.map(apt => {
                        if (apt.day === d && apt.time === h) {
                          return (
                            <div key={apt.id} className="absolute inset-1 right-2 bg-indigo-50 border border-indigo-200 rounded-lg p-2 shadow-sm cursor-pointer hover:shadow hover:border-indigo-300 transition-all z-10 overflow-hidden">
                              <p className="text-xs font-bold text-indigo-900 leading-tight truncate">{apt.patient}</p>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-medium">
                                <Stethoscope className="w-3 h-3" /> {apt.doctor}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-indigo-500">
                                <Clock className="w-3 h-3" /> {apt.time} ({apt.duration})
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" /> Book Session
              </h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700">
                    <option value="" disabled selected>Select a patient...</option>
                    {patients?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Doctor</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700">
                    <option>Dr. Aisha Nair</option>
                    <option>Dr. Sarah Lee</option>
                    <option>Dr. Rahul Patel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-700" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Appointment Scheduled!');
                  setIsModalOpen(false);
                }}
                className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
