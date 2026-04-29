import { useState } from 'react';
import { Search, Plus, UserPlus, FileEdit } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients.js';

const MOCK_DOCTORS = [
  { id: 'u1', name: 'Dr. Aisha Nair', workload: '12 patients' },
  { id: 'u2', name: 'Dr. Sarah Lee', workload: '8 patients' },
  { id: 'u4', name: 'Dr. Rahul Patel', workload: '15 patients' },
];

export default function SupervisorPatients() {
  const { patients, loading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModal, setAssignModal] = useState({ isOpen: false, patient: null });

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading patients...</div>;
  }

  // Ensure patients array exists
  const safePatients = patients || [];
  
  const filteredPatients = safePatients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (doctorId) => {
    // In a real app, this would dispatch an API call.
    // For now, we'll just close the modal and pretend it updated.
    alert(`Assigned ${assignModal.patient.name} to doctor ID: ${doctorId}`);
    setAssignModal({ isOpen: false, patient: null });
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Directory</h1>
          <p className="text-slate-500 mt-1">Manage patients and their clinician assignments.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-slate-500">Filter:</span>
            <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Unassigned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                <th className="pb-3 px-4 font-medium">Patient Name</th>
                <th className="pb-3 px-4 font-medium">Status</th>
                <th className="pb-3 px-4 font-medium">Assigned SLP</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">No patients found.</td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{patient.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        patient.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        patient.status === 'Discharged' ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {patient.assignedDoctorId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">Dr. Aisha Nair</span> {/* Mock resolution */}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => setAssignModal({ isOpen: true, patient })}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                        title="Assign SLP"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <FileEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Assign Clinician</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select an SLP for <span className="font-semibold text-slate-700">{assignModal.patient?.name}</span>
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {MOCK_DOCTORS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleAssign(doc.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
                >
                  <div>
                    <p className="font-bold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Current workload: {doc.workload}</p>
                  </div>
                  <span className="text-indigo-600 font-medium text-sm">Assign →</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button 
                onClick={() => setAssignModal({ isOpen: false, patient: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
