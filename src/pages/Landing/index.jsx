import { Link } from 'react-router-dom';
import {
  Stethoscope,
  FileText,
  Users,
  Mic,
  Heart,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

const features = [
  {
    icon: FileText,
    color: 'from-brand-500 to-brand-700',
    bg: 'bg-brand-50',
    title: 'Automated SOAP Notes',
    desc: 'AI generates structured SOAP notes from session recordings, saving you hours of documentation time.',
  },
  {
    icon: Users,
    color: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50',
    title: 'Patient Management',
    desc: 'Maintain comprehensive patient profiles, session history, and progress tracking in one place.',
  },
  {
    icon: Mic,
    color: 'from-violet-500 to-violet-700',
    bg: 'bg-violet-50',
    title: 'Speech Analysis',
    desc: 'Advanced AI analyzes speech patterns, identifies errors, and tracks improvement over time.',
  },
  {
    icon: Heart,
    color: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50',
    title: 'Caregiver Collaboration',
    desc: 'Share progress reports and home exercises directly with parents and caregivers.',
  },
];

const stats = [
  { value: '3x', label: 'Faster Documentation' },
  { value: '500+', label: 'SLPs Using TalkAlign' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">TalkAlign</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-brand-600 transition-colors font-medium">Features</a>
            <a href="#about" className="text-sm text-slate-600 hover:text-brand-600 transition-colors font-medium">About</a>
            <a href="#contact" className="text-sm text-slate-600 hover:text-brand-600 transition-colors font-medium">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                AI-Powered Speech Therapy
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                AI-Powered{' '}
                <span className="text-gradient">Speech Therapy</span>{' '}
                Assistant
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                TalkAlign automates your clinical documentation, streamlines patient management,
                and lets you focus on what matters most — your patients' progress.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/register">
                  <Button size="lg" variant="primary">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="secondary">
                    Login to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-6">
                {['HIPAA Compliant', 'SOC 2 Certified', 'Free 14-day trial'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50">
                {/* Mock browser bar */}
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 ml-2">
                    app.talkalign.com/dashboard
                  </div>
                </div>

                {/* Dashboard preview */}
                <div className="bg-slate-50 p-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Total Patients', value: '24', color: 'bg-brand-500' },
                      { label: 'Sessions Today', value: '8',  color: 'bg-teal-500' },
                      { label: 'SOAP Notes',     value: '16', color: 'bg-violet-500' },
                    ].map((card) => (
                      <div key={card.label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                        <div className={`w-8 h-8 ${card.color} rounded-lg mb-2 opacity-90`} />
                        <p className="text-xl font-bold text-slate-900">{card.value}</p>
                        <p className="text-xs text-slate-500">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini patient list */}
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-700">Recent Patients</p>
                      <span className="text-xs text-brand-600">View all →</span>
                    </div>
                    {['Aarav Sharma', 'Sara Mehta', 'Rohan Verma'].map((name, i) => (
                      <div key={name} className="flex items-center gap-2.5 py-1.5">
                        <div className={`w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold`}>
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-800">{name}</p>
                          <p className="text-[10px] text-slate-400">Last session: Apr {25 - i * 2}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating SOAP card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-slate-200 p-4 w-48 animate-pulse-slow">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <p className="text-xs font-semibold text-slate-800">SOAP Note</p>
                </div>
                <div className="space-y-1.5">
                  {['Subjective', 'Objective', 'Assessment', 'Plan'].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <p className="text-[10px] text-slate-600">{s}</p>
                      <CheckCircle2 className="w-3 h-3 text-teal-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="bg-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold text-gradient mb-1">{value}</p>
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to deliver <br className="hidden sm:block" />
              <span className="text-gradient">exceptional therapy</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From AI-powered documentation to caregiver collaboration — TalkAlign covers your entire workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-20 gradient-hero">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your practice?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join 500+ SLPs who save 3+ hours per week with TalkAlign.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 shadow-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="glass text-white border-white/20 hover:bg-white/20">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer id="contact" className="bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold">TalkAlign</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#about"   className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#"        className="hover:text-white transition-colors">Privacy</a>
            <a href="#"        className="hover:text-white transition-colors">Terms</a>
          </div>
          <p className="text-slate-500 text-xs">© 2026 TalkAlign. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
