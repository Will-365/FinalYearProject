import { useState, useRef, useEffect } from 'react';
import { Recycle, Check, Eye, EyeOff, ChevronLeft, AlertTriangle, Shield } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface LoginPageProps {
  onBackToHome?: () => void;
  onShowSignup?: () => void;
}

const trustBullets = [
  'Join 50,000+ residents already making a difference',
  'Earn rewards for every kg of waste you recycle',
  'Real-time pickup tracking across Kigali'
];

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

  // OTP Logic
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

  const inpSx = (err?: string) => ({
    width: '100%', height: '48px', borderRadius: '8px',
    border: err ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
    fontSize: '0.9rem', color: '#0d1f13', padding: '0 14px',
    outline: 'none' as const, transition: 'all 0.2s ease',
    boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none'
  });

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '45% 55%', background: '#ffffff', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, #0a1a0f 0%, #14532d 60%, #0d1f13 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px' }}>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900)',
          backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'luminosity', opacity: 0.18, zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Recycle style={{ width: 32, height: 32, color: '#4ade80' }} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Green Care</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Rwanda</div>
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2,
              letterSpacing: '-0.025em', maxWidth: 280, marginBottom: 28 }}>
              Turning Rwanda&apos;s waste into tomorrow&apos;s wealth.
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trustBullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check style={{ width: 12, height: 12, color: '#4ade80' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: 20 }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>
              &ldquo;Neza cyane! The app made waste pickup in Kimironko so easy and I earned 3,400 RWF last month.&rdquo;
            </p>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
              — Uwase Claudine, Resident · Gasabo District
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background: '#ffffff', padding: '48px 52px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          @media (max-width: 767px) {
            .login-split { grid-template-columns: 1fr !important; }
            .login-left { display: none !important; }
            .login-right { padding: 32px 24px !important; }
          }
        `}</style>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%', animation: shakeCard ? 'shake 0.4s ease' : 'none' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            {onBackToHome && (
              <button onClick={onBackToHome} style={{ display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Home
              </button>
            )}
          </div>

          {!showOtp ? (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d1f13', marginBottom: 8 }}>
                {adminMode ? 'Admin Portal' : 'Welcome back'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: adminMode ? 16 : 32 }}>
                {adminMode ? 'Sign in with your administrator credentials' : 'Sign in to your GreenCare account'}
              </p>
              {adminMode && (
                <div style={{ background: '#0f172a', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Shield style={{ color: '#4ade80', width: 22, height: 22, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>Restricted access — operations & compliance staff only</span>
                </div>
              )}

              {apiError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeIn 0.2s' }}>
                  <AlertTriangle style={{ color: '#ef4444', width: 20, height: 20, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#991b1b', fontSize: '0.875rem', marginTop: 1 }}>{apiError}</div>
                  <button type="button" onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>✕</button>
                </div>
              )}
              
              {needsVerification && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeIn 0.2s' }}>
                  <AlertTriangle style={{ color: '#d97706', width: 20, height: 20, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#92400e', fontSize: '0.875rem', marginTop: 1 }}>
                    Your email isn't verified yet.
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={handleTriggerResend} style={{ background: 'none', border: 'none', padding: 0, color: '#d97706', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                        Resend verification code →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                    style={inpSx(errors.email)}
                    onFocus={e => { if (!errors.email) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; }}}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = errors.email ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none'; }} />
                  {errors.email && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
                </div>

                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                    style={inpSx(errors.password)}
                    onFocus={e => { if (!errors.password) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; }}}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = errors.password ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                  {errors.password && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{errors.password}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div onClick={() => setRememberMe(!rememberMe)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid #e5e7eb',
                        background: rememberMe ? '#16a34a' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {rememberMe && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#374151' }}>Remember me</span>
                  </label>
                  <button type="button" style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isLoading}
                  style={{ width: '100%', padding: 14, border: 'none', borderRadius: 8,
                    background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s ease' }}>
                  {isLoading && <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  {isLoading ? 'Signing in...' : adminMode ? 'Sign In as Admin' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => { setAdminMode(!adminMode); setApiError(null); setNeedsVerification(false); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: adminMode ? '#6b7280' : '#0f172a', fontWeight: 600, background: adminMode ? 'none' : '#f1f5f9', border: 'none', cursor: 'pointer', padding: adminMode ? 0 : '8px 14px', borderRadius: 8 }}
                >
                  {!adminMode && <Shield style={{ width: 16, height: 16 }} />}
                  {adminMode ? '← Back to resident login' : 'Admin Portal'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#6b7280' }}>
                Don&apos;t have an account?{' '}
                {onShowSignup ? (
                  <button type="button" onClick={onShowSignup} style={{ color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Create one
                  </button>
                ) : (
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Create one</span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.2s ease', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: 32 }}>
                We sent a 6-digit code to <span style={{ fontWeight: 700, color: '#0d1f13' }}>{email}</span>
              </p>
              
              {apiError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
                  <AlertTriangle style={{ color: '#ef4444', width: 20, height: 20, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#991b1b', fontSize: '0.875rem', marginTop: 1 }}>{apiError}</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, animation: shakeOtp ? 'shake 0.4s ease' : 'none' }}>
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
                      width: 48, height: 56, borderRadius: 8, border: '1.5px solid #e5e7eb',
                      fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', color: '#0d1f13',
                      background: digit ? '#f0fdf4' : '#fff', transition: 'all 0.2s ease', outline: 'none'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              <div style={{ marginBottom: 32, fontSize: '0.9rem', color: timeLeft < 120 ? '#ef4444' : '#6b7280', fontWeight: timeLeft < 120 ? 600 : 400 }}>
                {timeLeft > 0 ? `Code expires in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : <span style={{ color: '#ef4444' }}>Code expired.</span>}
              </div>

              <button type="button" onClick={verifyOtpSubmit} disabled={isLoading || timeLeft === 0}
                style={{ width: '100%', padding: 14, border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: (isLoading || timeLeft === 0) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || timeLeft === 0) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {isLoading && <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Didn't receive it?{' '}
                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0}
                  style={{ background: 'none', border: 'none', padding: 0,
                    color: resendCooldown > 0 ? '#9ca3af' : '#16a34a', fontWeight: 600,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer' }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
              
              <div style={{ marginTop: 24 }}>
                <button type="button" onClick={() => setShowOtp(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
