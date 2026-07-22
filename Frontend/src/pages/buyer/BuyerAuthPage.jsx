import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyerService';
import { Leaf, Eye, EyeOff, Phone, Lock, User, MapPin, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro','Rusizi'];

export function BuyerAuthPage({ onSuccess }) {
  const { buyerLogin } = useAuth();
  const [mode, setMode] = useState('login'); // login | register | forgot | otp | reset
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePhone = (p) => /^\+250[0-9]{9}$/.test(p.replace(/[\s\-()]/g, ''));

  const getFieldError = (name, value, extra = {}) => {
    if (name === 'fullName') {
      if (!String(value || '').trim()) return 'Full name is required';
    }
    if (name === 'phone') {
      const cleaned = String(value || '').replace(/[\s\-()]/g, '');
      if (!cleaned) return 'Phone is required';
      if (!cleaned.startsWith('+250')) return 'Phone number must start with +250';
      if (!validatePhone(value)) return 'Enter a valid number e.g. +250792397681';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (String(value).length < 6) return 'Password must be at least 6 characters';
    }
    if (name === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (value !== (extra.password ?? password)) return 'Passwords do not match';
    }
    if (name === 'otp') {
      if (!value || String(value).length !== 6) return 'Enter the 6-digit OTP';
    }
    if (name === 'newPassword') {
      if (!value || String(value).length < 6) return 'Password must be at least 6 characters';
    }
    return '';
  };

  const setFieldError = (name, message) => {
    setErrors(prev => {
      if (message) return { ...prev, [name]: message };
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFieldBlur = (name, value, extra) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldError(name, getFieldError(name, value, extra));
  };

  const handleFieldChange = (name, value, setter) => {
    setter(value);
    if (touched[name] || errors[name]) {
      setFieldError(name, getFieldError(name, value, name === 'confirmPassword' ? { password } : undefined));
    }
    if (name === 'password' && (touched.confirmPassword || errors.confirmPassword)) {
      setFieldError('confirmPassword', getFieldError('confirmPassword', confirmPassword, { password: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    const phoneErr = getFieldError('phone', phone);
    const passwordErr = getFieldError('password', password);
    if (phoneErr) errs.phone = phoneErr;
    if (passwordErr) errs.password = passwordErr;
    setTouched(prev => ({ ...prev, phone: true, password: true }));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await buyerLogin(phone, password);
      toast.success('Welcome back!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    const fullNameErr = getFieldError('fullName', fullName);
    const phoneErr = getFieldError('phone', phone);
    const passwordErr = getFieldError('password', password);
    const confirmErr = getFieldError('confirmPassword', confirmPassword);
    if (fullNameErr) errs.fullName = fullNameErr;
    if (phoneErr) errs.phone = phoneErr;
    if (passwordErr) errs.password = passwordErr;
    if (confirmErr) errs.confirmPassword = confirmErr;
    setTouched(prev => ({ ...prev, fullName: true, phone: true, password: true, confirmPassword: true }));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await buyerService.register({ fullName, phone, password, preferredDistrict: district || undefined });
      if (!res) throw { message: 'Registration failed' };
      toast.success('Buyer account registered successfully!');
      // Auto-login after register
      await buyerLogin(phone, password);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const phoneErr = getFieldError('phone', phone);
    setTouched(prev => ({ ...prev, phone: true }));
    if (phoneErr) { setErrors({ phone: phoneErr }); return; }
    setLoading(true);
    try {
      await buyerService.forgotPassword({ phone });
      toast.success('OTP sent to your phone');
      setMode('otp');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const errs = {};
    const otpErr = getFieldError('otp', otp);
    const newPasswordErr = getFieldError('newPassword', newPassword);
    if (otpErr) errs.otp = otpErr;
    if (newPasswordErr) errs.newPassword = newPasswordErr;
    setTouched(prev => ({ ...prev, otp: true, newPassword: true }));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await buyerService.resetPassword({ phone, otp, newPassword });
      toast.success('Password reset! Please log in.');
      setMode('login');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  );

  const inputClass = (hasIcon, err) =>
    `w-full h-11 rounded-xl border ${err ? 'border-red-400' : 'border-gray-200'} ${hasIcon ? 'pl-10 pr-4' : 'px-4'} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 shadow-lg mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GreenCare Shop</h1>
          <p className="text-sm text-gray-500 mt-1">Eco products from recycled waste</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sign In</h2>
              <Field label="Phone Number" icon={Phone} error={errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => handleFieldChange('phone', e.target.value, setPhone)}
                  onBlur={e => handleFieldBlur('phone', e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className={inputClass(true, errors.phone)}
                />
              </Field>
              <Field label="Password" icon={Lock} error={errors.password}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => handleFieldChange('password', e.target.value, setPassword)}
                  onBlur={e => handleFieldBlur('password', e.target.value)}
                  placeholder="Enter password"
                  className={inputClass(true, errors.password) + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
              <button type="button" onClick={() => setMode('forgot')}
                className="text-sm text-emerald-600 hover:underline">
                Forgot password?
              </button>
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-emerald-600 font-semibold hover:underline">Register</button>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Account</h2>
              <Field label="Full Name" icon={User} error={errors.fullName}>
                <input type="text" value={fullName}
                  onChange={e => handleFieldChange('fullName', e.target.value, setFullName)}
                  onBlur={e => handleFieldBlur('fullName', e.target.value)}
                  placeholder="Your full name" className={inputClass(true, errors.fullName)} />
              </Field>
              <Field label="Phone Number" icon={Phone} error={errors.phone}>
                <input type="tel" value={phone}
                  onChange={e => handleFieldChange('phone', e.target.value, setPhone)}
                  onBlur={e => handleFieldBlur('phone', e.target.value)}
                  placeholder="+250 7XX XXX XXX" className={inputClass(true, errors.phone)} />
              </Field>
              <Field label="Password" icon={Lock} error={errors.password}>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => handleFieldChange('password', e.target.value, setPassword)}
                  onBlur={e => handleFieldBlur('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputClass(true, errors.password) + ' pr-10'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
              <Field label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
                <input type="password" value={confirmPassword}
                  onChange={e => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                  onBlur={e => handleFieldBlur('confirmPassword', e.target.value)}
                  placeholder="Repeat password" className={inputClass(true, errors.confirmPassword)} />
              </Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred District (optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Select district...</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-emerald-600 font-semibold hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500">We'll send an OTP to your phone.</p>
              <Field label="Phone Number" icon={Phone} error={errors.phone}>
                <input type="tel" value={phone}
                  onChange={e => handleFieldChange('phone', e.target.value, setPhone)}
                  onBlur={e => handleFieldBlur('phone', e.target.value)}
                  placeholder="+250 7XX XXX XXX" className={inputClass(true, errors.phone)} />
              </Field>
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send OTP
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold">Enter OTP</h2>
                <p className="text-sm text-gray-500 mt-1">Sent to {phone}</p>
              </div>
              <Field label="6-Digit OTP" error={errors.otp}>
                <input type="text" value={otp}
                  onChange={e => handleFieldChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6), setOtp)}
                  onBlur={e => handleFieldBlur('otp', e.target.value)}
                  placeholder="000000" className={inputClass(false, errors.otp) + ' text-center text-xl font-bold tracking-[0.5em]'} />
              </Field>
              <Field label="New Password" icon={Lock} error={errors.newPassword}>
                <input type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={e => handleFieldChange('newPassword', e.target.value, setNewPassword)}
                  onBlur={e => handleFieldBlur('newPassword', e.target.value)}
                  placeholder="New password"
                  className={inputClass(true, errors.newPassword)} />
              </Field>
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
