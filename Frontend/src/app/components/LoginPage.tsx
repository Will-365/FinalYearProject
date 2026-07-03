import { useState, useRef, useEffect } from 'react';
import { Check, Eye, EyeOff, ChevronLeft, AlertTriangle, Shield, Leaf } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import greencareLogo from '@/images/greencare-icon.png';

interface LoginPageProps {
  onBackToHome?: () => void;
  onShowSignup?: () => void;
}

export function LoginPage({ onBackToHome, onShowSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // OTP State for inline verification
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [shakeOtp, setShakeOtp] = useState(false);
  const otpInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const { login: authLogin, adminLogin } = useAuth();
  const { showToast } = useToast();
  const [adminMode, setAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setApiError(null);
    setNeedsVerification(false);
    
    try {
      if (adminMode) {
        await adminLogin(email, password);
        showToast({ type: 'success', title: 'Welcome, Admin', message: 'Admin portal access granted' });
      } else {
        const res = await authLogin(email, password);
        showToast({ type: 'success', title: 'Welcome back!', message: `Welcome back, ${res.fullName}!` });
      }
    } catch (err: any) {
      if (err.needsVerification) {
        setNeedsVerification(true);
      } else {
        setApiError(err.message || 'Login failed');
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 400);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerResend = async () => {
    setIsLoading(true);
    try {
      const res = await authService.resendOTP({ email });
      if (res.success) {
        showToast({ type: 'success', title: 'Code Sent', message: 'Verification code sent to your email.' });
        setShowOtp(true);
        setNeedsVerification(false);
        setTimeLeft(600);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setApiError(res.message);
      }
    } catch (err) {
      setApiError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showOtp && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOtp, timeLeft]);

  useEffect(() => {
    if (showOtp && resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOtp, resendCooldown]);

  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setApiError(null);
    if (val && index < 5) otpInputRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputRefs[index - 1].current?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (!pastedData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (pastedData.length < 6) otpInputRefs[pastedData.length].current?.focus();
    else otpInputRefs[5].current?.focus();
  };

  const verifyOtpSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setApiError('Please enter all 6 digits');
      setShakeOtp(true); setTimeout(() => setShakeOtp(false), 400);
      return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authService.verifyOTP({ email, otp: fullOtp });
      if (res.success) {
        showToast({ type: 'success', title: 'Email Verified!', message: 'You can now log in.' });
        setShowOtp(false);
      } else {
        setApiError(res.message);
        setShakeOtp(true);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs[0].current?.focus();
        setTimeout(() => setShakeOtp(false), 400);
      }
    } catch (err) {
      setApiError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    handleTriggerResend();
  };

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '45% 55%', background: '#ffffff', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gc-input {
          width: 100%; height: 52px; border-radius: 12px;
          border: 1.5px solid #e5e7eb; font-size: 0.92rem;
          color: #111827; padding: 0 16px; outline: none;
          transition: all 0.2s ease; background: #f9fafb;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .gc-input:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 4px rgba(22,163,74,0.08); }
        .gc-input.error { border-color: #ef4444; background: #fff; box-shadow: 0 0 0 4px rgba(239,68,68,0.08); }
        .gc-btn-primary {
          width: 100%; padding: 15px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #fff; font-weight: 700; font-size: 0.97rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: all 0.2s ease; font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
          letter-spacing: 0.01em;
        }
        .gc-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #15803d 0%, #166534 100%); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }
        .gc-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .gc-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        @media (max-width: 767px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-left { display: none !important; }
          .login-right { padding: 32px 24px !important; }
        }
      `}</style>

      {/* ─── LEFT PANEL ─── */}
      <div className="login-left" style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #042010 0%, #0a2e16 40%, #05160a 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 44px',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          mixBlendMode: 'luminosity', opacity: 0.12, zIndex: 0,
        }} />

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <img src={greencareLogo} alt="GreenCare" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>GreenCare</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Rwanda</div>
            </div>
          </div>

          {/* Hero text */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 100, padding: '5px 14px', marginBottom: 20,
            }}>
              <Leaf style={{ width: 13, height: 13, color: '#4ade80' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4ade80', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sustainable Future</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900,
              color: '#ffffff', lineHeight: 1.15,
              letterSpacing: '-0.03em', maxWidth: 300, marginBottom: 20,
            }}>
              Turning Rwanda&apos;s<br/>
              <span style={{ color: '#4ade80' }}>waste</span> into<br/>
              tomorrow&apos;s wealth.
            </h1>

            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 280 }}>
              Join Rwanda&apos;s largest eco-community. Recycle, earn rewards, and track your environmental impact in real time.
            </p>
          </div>

          {/* Testimonial */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px 22px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: '#fbbf24', fontSize: '0.85rem' }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
              &ldquo;Neza cyane! The app made waste pickup in Kimironko so easy and I earned 3,400 RWF last month.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#fff',
              }}>U</div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Uwase Claudine</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Resident · Gasabo District</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="login-right" style={{
        background: '#ffffff',
        padding: '0 64px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(22,163,74,0.04) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(22,163,74,0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 400, margin: '0 auto', width: '100%',
          position: 'relative', zIndex: 1,
          animation: shakeCard ? 'shake 0.4s ease' : 'none',
        }}>

          {/* Back link */}
          {onBackToHome && (
            <button onClick={onBackToHome} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.8rem', color: '#9ca3af', background: 'none',
              border: 'none', cursor: 'pointer', marginBottom: 40,
              padding: 0, fontFamily: 'Inter, sans-serif',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <ChevronLeft style={{ width: 15, height: 15 }} /> Back to Home
            </button>
          )}

          {/* Logo on the right panel */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <img src={greencareLogo} alt="GreenCare" style={{ height: 64, objectFit: 'contain', animation: 'float 3s ease-in-out infinite' }} />
          </div>

          {!showOtp ? (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h2 style={{
                  fontSize: '1.85rem', fontWeight: 900, color: '#0d1f13',
                  marginBottom: 8, letterSpacing: '-0.03em',
                }}>
                  {adminMode ? 'Admin Portal' : 'Welcome back'}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>
                  {adminMode ? 'Sign in with administrator credentials' : 'Sign in to your GreenCare account'}
                </p>
              </div>

              {adminMode && (
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 24,
                  display: 'flex', gap: 10, alignItems: 'center',
                  border: '1px solid rgba(74,222,128,0.2)',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield style={{ color: '#4ade80', width: 16, height: 16 }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>Restricted access — operations &amp; compliance staff only</span>
                </div>
              )}

              {apiError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
                  padding: '12px 16px', marginBottom: 20,
                  display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.2s',
                }}>
                  <AlertTriangle style={{ color: '#ef4444', width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, color: '#991b1b', fontSize: '0.85rem' }}>{apiError}</div>
                  <button type="button" onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                </div>
              )}

              {needsVerification && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                  padding: '12px 16px', marginBottom: 20,
                  display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.2s',
                }}>
                  <AlertTriangle style={{ color: '#d97706', width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, color: '#92400e', fontSize: '0.85rem' }}>
                    Your email isn&apos;t verified yet.
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={handleTriggerResend} style={{ background: 'none', border: 'none', padding: 0, color: '#d97706', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
                        Resend verification code →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8, letterSpacing: '0.01em' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                    className={`gc-input${errors.email ? ' error' : ''}`}
                  />
                  {errors.email && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 5 }}>{errors.email}</div>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8, letterSpacing: '0.01em' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                      className={`gc-input${errors.password ? ' error' : ''}`}
                      style={{ paddingRight: 48 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                      display: 'flex', alignItems: 'center', padding: 0,
                    }}>
                      {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                    </button>
                  </div>
                  {errors.password && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 5 }}>{errors.password}</div>}
                </div>

                {/* Remember + Forgot */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div onClick={() => setRememberMe(!rememberMe)} style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: `2px solid ${rememberMe ? '#16a34a' : '#d1d5db'}`,
                      background: rememberMe ? '#16a34a' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                    }}>
                      {rememberMe && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280', userSelect: 'none' }}>Remember me</span>
                  </label>
                  <button type="button" style={{
                    fontSize: '0.82rem', color: '#16a34a', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="gc-btn-primary" style={{ marginTop: 4 }}>
                  {isLoading && (
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  )}
                  {isLoading ? 'Signing in...' : adminMode ? 'Sign In as Admin' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                <span style={{ fontSize: '0.75rem', color: '#d1d5db', fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
              </div>

              {/* Admin toggle */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setAdminMode(!adminMode); setApiError(null); setNeedsVerification(false); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontSize: '0.83rem',
                    color: adminMode ? '#6b7280' : '#374151',
                    fontWeight: 600,
                    background: adminMode ? 'none' : '#f8fafc',
                    border: adminMode ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer', padding: adminMode ? 0 : '9px 18px',
                    borderRadius: 10, fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  {!adminMode && <Shield style={{ width: 15, height: 15, color: '#64748b' }} />}
                  {adminMode ? '← Back to resident login' : 'Admin Portal'}
                </button>
              </div>

              {/* Sign up link */}
              {onShowSignup && (
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#9ca3af' }}>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={onShowSignup} style={{
                    color: '#16a34a', fontWeight: 700, background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Create one
                  </button>
                </p>
              )}
            </div>
          ) : (
            /* ─── OTP Panel ─── */
            <div style={{ animation: 'fadeUp 0.25s ease', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <span style={{ fontSize: '1.8rem' }}>📧</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d1f13', marginBottom: 8, letterSpacing: '-0.02em' }}>Check your inbox</h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>
                We sent a 6-digit code to{' '}
                <span style={{ fontWeight: 700, color: '#0d1f13' }}>{email}</span>
              </p>

              {apiError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
                  <AlertTriangle style={{ color: '#ef4444', width: 18, height: 18, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#991b1b', fontSize: '0.85rem' }}>{apiError}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, animation: shakeOtp ? 'shake 0.4s ease' : 'none' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpInputRefs[i]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: 50, height: 58, borderRadius: 12,
                      border: `1.5px solid ${digit ? '#16a34a' : '#e5e7eb'}`,
                      fontSize: '1.5rem', fontWeight: 800, textAlign: 'center',
                      color: '#0d1f13', background: digit ? '#f0fdf4' : '#f9fafb',
                      transition: 'all 0.2s ease', outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(22,163,74,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = digit ? '#16a34a' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              <div style={{ marginBottom: 28, fontSize: '0.88rem', color: timeLeft < 120 ? '#ef4444' : '#9ca3af', fontWeight: timeLeft < 120 ? 600 : 400 }}>
                {timeLeft > 0
                  ? `Code expires in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : <span style={{ color: '#ef4444' }}>Code has expired. Please resend.</span>}
              </div>

              <button type="button" onClick={verifyOtpSubmit} disabled={isLoading || timeLeft === 0} className="gc-btn-primary" style={{ marginBottom: 16 }}>
                {isLoading && <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div style={{ fontSize: '0.88rem', color: '#9ca3af' }}>
                Didn&apos;t receive it?{' '}
                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0} style={{
                  background: 'none', border: 'none', padding: 0,
                  color: resendCooldown > 0 ? '#d1d5db' : '#16a34a',
                  fontWeight: 700, cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              <div style={{ marginTop: 20 }}>
                <button type="button" onClick={() => setShowOtp(false)} style={{
                  color: '#9ca3af', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.83rem', fontFamily: 'Inter, sans-serif',
                }}>
                  ← Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
