import { Stethoscope } from 'lucide-react';

export default function SupervisorDoctors() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Clinic Staff</h1>
        <p className="text-slate-500 mt-1">Manage Speech-Language Pathologists and their workload.</p>
      </div>

      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
        <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Doctor management coming soon.</p>
      </div>
    </div>
  );
}
