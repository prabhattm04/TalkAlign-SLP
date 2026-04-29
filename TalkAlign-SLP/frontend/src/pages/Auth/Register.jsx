import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const ROLES = [
  { value: 'doctor', label: '🩺 Doctor / SLP' },
  { value: 'parent', label: '👨‍👩‍👧 Parent / Caregiver' },
];

export default function Register() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: 'doctor',
  });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim())      errs.name = 'Full name is required.';
    if (!form.email)            errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)         errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/dashboard');
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
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">TalkAlign</span>
          </Link>
          <p className="text-white/60 text-sm mt-2">Create your free account today.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Account</h2>

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

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="reg-name"
              label="Full Name"
              type="text"
              placeholder="Dr. Aisha Nair"
              icon={User}
              value={form.name}
              onChange={handleChange('name')}
              error={fieldErrors.name}
              autoComplete="name"
            />
            <Input
              id="reg-email"
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
                id="reg-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                icon={Lock}
                value={form.password}
                onChange={handleChange('password')}
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              id="reg-confirm"
              label="Confirm Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat your password"
              icon={Lock}
              value={form.confirm}
              onChange={handleChange('confirm')}
              error={fieldErrors.confirm}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
