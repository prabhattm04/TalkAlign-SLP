import { Sparkles, TrendingUp, Star } from 'lucide-react';

export default function PortalProgress() {
  const milestones = [
    { title: 'Started Therapy', date: 'March 1, 2026', completed: true },
    { title: 'Mastered /p/ sound', date: 'March 20, 2026', completed: true },
    { title: 'Started /r/ blends', date: 'April 15, 2026', completed: true },
    { title: 'Master /r/ in sentences', date: 'Goal', completed: false },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Progress & Goals
        </h1>
        <p className="text-slate-500 mt-1">See how far we've come together!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">12</p>
          <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-soft text-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-orange-600 fill-orange-200" />
          </div>
          <p className="text-2xl font-bold text-slate-800">4</p>
          <p className="text-xs text-slate-500 font-medium">Practice Streak</p>
        </div>
      </div>

      {/* Accuracy Chart Stub */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Target Accuracy (/r/ sounds)</h2>
        <div className="flex items-end justify-between h-40 gap-2">
          {[40, 45, 55, 60, 75].map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
              <div className="w-full max-w-[40px] bg-purple-50 rounded-t-xl relative flex flex-col justify-end h-full">
                <div 
                  className="w-full bg-gradient-to-t from-purple-400 to-rose-400 rounded-t-xl transition-all duration-1000 group-hover:opacity-80"
                  style={{ height: `${val}%` }}
                />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Wk {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Journey Map</h2>
        <div className="space-y-6 pl-2">
          {milestones.map((m, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-slate-100 pb-2 last:border-0 last:pb-0">
              <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white ${m.completed ? 'bg-green-500' : 'bg-slate-200'}`} />
              <h3 className={`font-bold ${m.completed ? 'text-slate-800' : 'text-slate-400'}`}>{m.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{m.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
