import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const ROLES = [
  { value: 'doctor', label: '🩺 Doctor / SLP' },
  { value: 'parent', label: '👨‍👩‍👧 Parent' },
  { value: 'supervisor', label: '🏢 Supervisor' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError, user } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', role: 'doctor' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      const result = await login({ email: form.email, password: form.password });
      let defaultDestination = '/dashboard';
      if (result.user.role === 'parent') defaultDestination = '/portal/home';
      if (result.user.role === 'supervisor') defaultDestination = '/supervisor/home';
      
      const destination = location.state?.from?.pathname || defaultDestination;
      navigate(destination, { replace: true });
    } catch {
      // error displayed via context
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (fieldErrors[field]) setFieldErrors((f) => ({ ...f, [field]: undefined }));
    };
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">TalkAlign</span>
          </Link>
          <p className="text-white/60 text-sm mt-2">Welcome back! Please sign in.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h2>

          {/* Role toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            {ROLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: value }))}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  form.role === value
                    ? 'bg-white shadow text-brand-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="doctor@clinic.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange('email')}
              error={fieldErrors.email}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={form.password}
                onChange={handleChange('password')}
                error={fieldErrors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button type="button" className="text-brand-600 hover:text-brand-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
              Create one
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="col-span-full font-medium text-slate-500 mb-1">Demo credentials (pw: password123):</div>
            <div className="text-slate-600 font-mono">doctor@talkalign.com</div>
            <div className="text-slate-600 font-mono">parent@talkalign.com</div>
            <div className="text-slate-600 font-mono col-span-full">admin@talkalign.com (Supervisor)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
