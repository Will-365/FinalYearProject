import { useState, useEffect, useRef } from 'react';
import { Recycle, Home, Truck, Building2, Check, Eye, EyeOff, ChevronLeft, Info, AlertTriangle, Leaf, Recycle as RecycleIcon, Users } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import { GreenCareLogo } from '@/app/components/ui/GreenCareLogo';
import rightImg from '@/images/right.png';

interface AuthPageProps {
  onLogin: (role: string) => void;
  onBackToHome?: () => void;
  onShowLogin?: () => void;
  onBuyerClick?: () => void;
}

type AccountRole = 'resident' | 'collector' | 'business' | null;

interface FormData {
  role: AccountRole;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  streetAddress: string;
}

const rwandaLocations: Record<string, Record<string, Record<string, string[]>>> = {
  "Kigali City": {
    "Gasabo": {
      "Bumbogo": ["Gasura", "Gitwa", "Mwurire", "Ruturusu"],
      "Gikomero": ["Gikomero", "Kabuga", "Murama", "Nyamugari"],
      "Gisozi": ["Gisozi", "Kibagabaga", "Kigarama", "Nyabisindu"],
      "Jabana": ["Jabana", "Kabuga I", "Kabuga II", "Shyogwe"],
      "Jali": ["Gacucu", "Jali", "Kabuye", "Rugunga"],
      "Kacyiru": ["Kamatamu", "Kibaza", "Kacyiru", "Kabutare"],
      "Kimihurura": ["Gisimenti", "Kibaza", "Kimihurura", "Nyarutarama"],
      "Kimironko": ["Bibare", "Kibagabaga", "Kimironko", "Nyabisindu"],
      "Kinyinya": ["Gikumba", "Kinyinya", "Nduba", "Rebero"],
      "Ndera": ["Gasagara", "Kagugu", "Ndera", "Ruturusu"],
      "Nduba": ["Cyeru", "Kabuga", "Nduba", "Rushubi"],
      "Remera": ["Gaculiro", "Kabare", "Nyabisindu", "Rukiri I", "Rukiri II"],
      "Rusororo": ["Bwiza", "Gikumba", "Jabana", "Rusororo"],
      "Ruturusu": ["Bibare", "Gatagara", "Ruturusu", "Shyorongi"]
    },
    "Kicukiro": {
      "Gahanga": ["Gahanga", "Kabuye", "Kibiraro", "Muyange"],
      "Gatenga": ["Gatenga", "Kagarama", "Kanserege", "Niboye"],
      "Gikondo": ["Gikondo", "Kigango", "Kinunga", "Nyenyeri"],
      "Kagarama": ["Gikumba", "Kagarama", "Karama", "Nyanza"],
      "Kanombe": ["Kanombe", "Karenge", "Nyanza", "Yungwe"],
      "Kicukiro": ["Gatare", "Kagarama", "Kicukiro", "Niboye"],
      "Kigarama": ["Bibare", "Kigarama", "Nyarugunga", "Rebero"],
      "Masaka": ["Gatare", "Kabeza", "Masaka", "Nyagasambu"],
      "Niboye": ["Gahanga", "Kibiraro", "Niboye", "Nyenyeri"],
      "Nyarugunga": ["Kabeza", "Kanombe", "Nyarugunga", "Yungwe"]
    },
    "Nyarugenge": {
      "Gitega": ["Akabahizi", "Gihanga", "Gitega", "Kiyovu"],
      "Kanyinya": ["Gikumba", "Kanyinya", "Karama", "Nyakabanda"],
      "Kigali": ["Biryogo", "Kigali", "Mageragere", "Nyamirambo"],
      "Kimisagara": ["Gitega", "Kimisagara", "Nyabugogo", "Rwezamenyo"],
      "Mageragere": ["Gahanga", "Mageragere", "Mburabuturo", "Rusiga"],
      "Muhima": ["Biryogo", "Cyivugiza", "Muhima", "Nyabugogo"],
      "Nyakabanda": ["Gitega", "Nyakabanda", "Nyamirambo", "Rwezamenyo"],
      "Nyamirambo": ["Cyivugiza", "Kimisagara", "Nyamirambo", "Rugarama"],
      "Nyarugenge": ["Biryogo", "Kigali", "Nyarugenge", "Rwampara"],
      "Rwezamenyo": ["Akabahizi", "Nyabugogo", "Rwezamenyo", "Umudugudu"]
    }
  },
  "Northern Province": {
    "Burera": { "Bungwe": ["Bungwe", "Cyabararika", "Gashara", "Kabuye"] },
    "Gakenke": { "Busengo": ["Busengo", "Gashara", "Kabuye", "Kivuruga"] },
    "Gicumbi": { "Byumba": ["Byumba", "Gashara", "Kabuye", "Mukarange"] },
    "Musanze": { "Kinigi": ["Kinigi", "Mukamira", "Musanze", "Nyange"] },
    "Rulindo": { "Base": ["Base", "Buyoga", "Cyinzuzi", "Ntarabana"] }
  },
  "Southern Province": {
    "Gisagara": { "Gikonko": ["Gikonko", "Gishubi", "Kansi", "Muganza"] },
    "Huye": { "Butare": ["Butare", "Gishamvu", "Karama", "Mbazi"] },
    "Kamonyi": { "Gacurabwenge": ["Gacurabwenge", "Karama", "Mugina", "Nyamiyaga"] },
    "Muhanga": { "Kabacuzi": ["Kabacuzi", "Kibangu", "Muhanga", "Nyamabuye"] },
    "Nyamagabe": { "Gasaka": ["Gasaka", "Kaduha", "Kamegeri", "Kitabi"] },
    "Nyanza": { "Busasamana": ["Busasamana", "Kibirizi", "Muyira", "Nyagisozi"] },
    "Nyaruguru": { "Busanze": ["Busanze", "Kibeho", "Mata", "Ngera"] },
    "Ruhango": { "Byimana": ["Byimana", "Kinazi", "Mbuye", "Ntongwe"] }
  },
  "Eastern Province": {
    "Bugesera": { "Gashora": ["Gashora", "Juru", "Kamabuye", "Mwogo"] },
    "Gatsibo": { "Gasange": ["Gasange", "Gitoki", "Kageyo", "Ngarama"] },
    "Kayonza": { "Gahini": ["Gahini", "Kabare", "Mukarange", "Ruramira"] },
    "Kirehe": { "Gahara": ["Gahara", "Kigarama", "Mahama", "Mpanga"] },
    "Ngoma": { "Gashanda": ["Gashanda", "Jarama", "Kazo", "Mugesera"] },
    "Nyagatare": { "Gatunda": ["Gatunda", "Karama", "Matimba", "Rwempasha"] },
    "Rwamagana": { "Fumbwe": ["Fumbwe", "Gahengeri", "Karenge", "Munyaga"] }
  },
  "Western Province": {
    "Karongi": { "Bwishyura": ["Bwishyura", "Gishyita", "Kibuye", "Murundi"] },
    "Ngororero": { "Bwira": ["Bwira", "Gatumba", "Kabaya", "Ngororero"] },
    "Nyabihu": { "Bigogwe": ["Bigogwe", "Jenda", "Karago", "Rambura"] },
    "Nyamasheke": { "Bushekeri": ["Bushekeri", "Cyato", "Kagano", "Mahembe"] },
    "Rubavu": { "Gisenyi": ["Gisenyi", "Mudende", "Nyamyumba", "Rubavu"] },
    "Rusizi": { "Bugarama": ["Bugarama", "Giheke", "Gikundamvura", "Mururu"] },
    "Rutsiro": { "Boneza": ["Boneza", "Gihango", "Kigeyo", "Mukura"] }
  }
};

const roleOptions = [
  { id: 'resident', icon: Home, title: 'Resident', subtitle: 'Schedule pickups and earn recycling rewards' },
  { id: 'collector', icon: Truck, title: 'Waste Collector', subtitle: 'Manage routes and track collection jobs' },
  { id: 'business', icon: Building2, title: 'Business / Organisation', subtitle: 'Manage waste compliance and reporting' }
] as const;

const trustBullets = [
  'Join 50,000+ residents already making a difference',
  'Earn rewards for every kg of waste you recycle',
  'Real-time pickup tracking across Kigali'
];

const inpSx = (err?: string, dis?: boolean) => ({
  width: '100%', height: '48px', borderRadius: '8px',
  border: err ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
  fontSize: '0.9rem', color: dis ? '#9ca3af' : '#0d1f13',
  padding: '0 14px', outline: 'none' as const, transition: 'all 0.2s ease',
  background: dis ? '#f9fafb' : '#ffffff', cursor: dis ? 'not-allowed' as const : 'text' as const,
  boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none'
});

const StepDot = ({ num, label, currentStep }: { num: number; label: string; currentStep: number }) => {
  const active = num === currentStep;
  const done = num < currentStep;
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 700, margin: '0 auto 6px',
        background: active ? '#16a34a' : done ? '#dcfce7' : '#f3f4f6',
        color: active ? '#fff' : done ? '#16a34a' : '#9ca3af', transition: 'all 0.3s' }}>
        {done ? <Check style={{ width: 14, height: 14 }} /> : num}
      </div>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em',
        color: active ? '#0d1f13' : '#9ca3af', fontWeight: active ? 600 : 400 }}>{label}</div>
    </div>
  );
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div style={{ margin: '32px 0 40px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StepDot num={1} label="Account Type" currentStep={currentStep} />
      <div style={{ flex: 1, height: 1, background: currentStep > 1 ? '#16a34a' : '#e5e7eb', margin: '0 8px 20px', transition: 'all 0.3s' }} />
      <StepDot num={2} label="Your Info" currentStep={currentStep} />
      <div style={{ flex: 1, height: 1, background: currentStep > 2 ? '#16a34a' : '#e5e7eb', margin: '0 8px 20px', transition: 'all 0.3s' }} />
      <StepDot num={3} label="Location" currentStep={currentStep} />
      <div style={{ flex: 1, height: 1, background: currentStep > 3 ? '#16a34a' : '#e5e7eb', margin: '0 8px 20px', transition: 'all 0.3s' }} />
      <StepDot num={4} label="Verify Email" currentStep={currentStep} />
    </div>
  </div>
);

const Inp = ({ label, name, type = 'text', placeholder, value, onChange, error, prefix, onBlur }:
  { label: string; name: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string; prefix?: string; onBlur?: (value: string) => void }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {prefix && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>{prefix}</span>}
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}
        style={{...inpSx(error, false), paddingLeft: prefix ? '50px' : '14px'}}
        onFocus={e => { if (!error) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}}
        onBlur={(e) => { if (onBlur) onBlur(e.target.value); }} />
    </div>
    {error && <p id={`${name}-error`} role="alert" style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0 0' }}>{error}</p>}
  </div>
);

const Sel = ({ label, value, onChange, options, disabled, placeholder, error, onBlur }:
  { label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean; placeholder: string; error?: string; onBlur?: () => void }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} onBlur={onBlur}
        style={{ ...inpSx(error, disabled), appearance: 'none' as const, paddingRight: 40, cursor: disabled ? 'not-allowed' as const : 'pointer' as const }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#16a34a', pointerEvents: 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, margin: '4px 0 0 0' }}>{error}</p>}
  </div>
);

export function AuthPage({ onLogin, onBackToHome, onShowLogin }: AuthPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(60);
  const [shakeOtp, setShakeOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    role: null, fullName: '', email: '', phone: '', nationalId: '',
    password: '', confirmPassword: '', agreeToTerms: false,
    province: '', district: '', sector: '', cell: '', village: '', streetAddress: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const provinces = Object.keys(rwandaLocations);
  const districts = formData.province ? Object.keys(rwandaLocations[formData.province] || {}) : [];
  const sectors = formData.district ? Object.keys(rwandaLocations[formData.province]?.[formData.district] || {}) : [];
  const cells = formData.sector ? (rwandaLocations[formData.province]?.[formData.district]?.[formData.sector] || []) : [];

  const getFieldError = (field: string, val: string | boolean, passwordForConfirm = formData.password): string => {
    if (field === 'fullName') {
      const name = (val as string) || '';
      if (!name.trim()) return 'Full name is required';
      if (name.trim().length < 2) return 'Full name must be at least 2 characters';
      if (name.trim().length > 60) return 'Full name must be at most 60 characters';
      if (/[0-9]/.test(name)) return 'Full name must not contain numbers';
      if (/[^a-zA-Z\s'\-.àáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝ]/.test(name)) return 'Full name contains invalid characters';
    }
    if (field === 'email') {
      const email = ((val as string) || '').trim();
      if (!email) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    }
    if (field === 'phone') {
      const phone = ((val as string) || '').replace(/[\s\-()]/g, '');
      if (!phone) return 'Phone number is required';
      if (!phone.startsWith('+250')) return 'Phone number must start with +250';
      // Exact format matching backend: +250XXXXXXXXX (9 digits after country code)
      if (!/^\+250[0-9]{9}$/.test(phone)) {
        return 'Enter a valid number e.g. +250792397681';
      }
    }
    if (field === 'nationalId') {
      const id = ((val as string) || '').replace(/\s/g, '');
      if (!id) return 'National ID is required';
      if (!/^[13][0-9]{15}$/.test(id)) return 'National ID must be 16 digits starting with 1 or 3';
    }
    if (field === 'password') {
      const pass = (val as string) || '';
      if (!pass) return 'Password is required';
      if (pass.length < 8) return 'Password must be at least 8 characters';
      if (!/[a-z]/.test(pass)) return 'Password must include a lowercase letter';
      if (!/[A-Z]/.test(pass)) return 'Password must include an uppercase letter';
      if (!/\d/.test(pass)) return 'Password must include a number';
      if (!/[@$!%*?&]/.test(pass)) return 'Password must include a special character (@$!%*?&)';
    }
    if (field === 'confirmPassword') {
      const confirm = (val as string) || '';
      if (!confirm) return 'Please confirm your password';
      if (confirm !== passwordForConfirm) return 'Passwords do not match';
    }
    if (field === 'agreeToTerms' && !val) return 'You must accept the terms to continue';
    return '';
  };

  const validateField = (field: string, val: string | boolean, passwordForConfirm = formData.password) => {
    const error = getFieldError(field, val, passwordForConfirm);
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return error === '';
  };

  const handleBlur = (field: keyof FormData, value?: string | boolean) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const val = value !== undefined ? value : formData[field];
    validateField(field, val as string | boolean);
  };

  const updateField = (field: keyof FormData, value: string | boolean | AccountRole) => {
    setFormData(p => {
      const next = { ...p, [field]: value };
      return next;
    });
    if (apiError) setApiError(null);

    // Keep showing / updating errors once the user has left the field (or after Continue)
    if (touched[field] || errors[field]) {
      if (field === 'password') {
        const pass = value as string;
        validateField('password', pass);
        if (touched.confirmPassword || errors.confirmPassword) {
          validateField('confirmPassword', formData.confirmPassword, pass);
        }
      } else if (field === 'confirmPassword') {
        validateField('confirmPassword', value as string);
      } else if (field !== 'role') {
        validateField(field, value as string | boolean);
      } else if (errors.role) {
        setErrors(prev => { const n = { ...prev }; delete n.role; return n; });
      }
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[@$!%*?&]/.test(pass)) score++;
    return score;
  };
  
  const pScore = getPasswordStrength(formData.password);

  const validateStep2 = () => {
    const fields = ['fullName', 'email', 'phone', 'nationalId', 'password', 'confirmPassword', 'agreeToTerms'] as const;
    setTouched(prev => {
      const next = { ...prev };
      fields.forEach(f => { next[f] = true; });
      return next;
    });
    let isValid = true;
    fields.forEach(f => {
      if (!validateField(f, formData[f])) isValid = false;
    });
    return isValid;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!formData.province) e.province = 'Please select your province';
    if (!formData.district) e.district = 'Please select your district';
    if (!formData.sector) e.sector = 'Please select your sector';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { 
    if (currentStep === 1 && !formData.role) {
      setErrors({ role: 'Select an account type' });
      return;
    }
    if (currentStep === 2 && !validateStep2()) return;
    
    if (currentStep < 3) setCurrentStep(s => s + 1); 
  };
  
  const back = () => { 
    setApiError(null);
    if (currentStep > 1) setCurrentStep(s => s - 1); 
  };

  const submit = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const location = {
        province: formData.province, district: formData.district, sector: formData.sector,
        cell: formData.cell, village: formData.village, street: formData.streetAddress
      };

      // Backend requires +250XXXXXXXXX (spaces already stripped by validation)
      const phone = formData.phone.replace(/[\s\-()]/g, '');
      
      const res = await authService.register({
        fullName: formData.fullName, email: formData.email, phone,
        nationalId: formData.nationalId.replace(/\s/g, ''), password: formData.password,
        role: formData.role, location
      });
      
      if (res.success) {
        showToast({ type: 'success', title: 'Account created!', message: 'Check your email for a 6-digit verification code.' });
        setCurrentStep(4);
        setTimeLeft(600);
        setResendCooldown(60);
      } else {
        setApiError(res.message || 'Registration failed');
      }
    } catch (err) {
      setApiError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Logic
  useEffect(() => {
    if (currentStep === 4 && timeLeft > 0 && !otpVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, timeLeft, otpVerified]);

  useEffect(() => {
    if (currentStep === 4 && resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, resendCooldown]);

  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setApiError(null);
    
    if (val && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
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
    if (pastedData.length < 6) {
      otpInputRefs[pastedData.length].current?.focus();
    } else {
      otpInputRefs[5].current?.focus();
    }
  };

  const verifyOtpSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setApiError('Please enter all 6 digits');
      setShakeOtp(true);
      setTimeout(() => setShakeOtp(false), 400);
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authService.verifyOTP({ email: formData.email, otp: fullOtp });
      if (res.success) {
        setOtpVerified(true);
        setTimeout(() => {
          if (onShowLogin) onShowLogin();
          else onLogin(formData.role || 'resident');
        }, 2500);
      } else {
        setApiError(res.message || 'Invalid code');
        setShakeOtp(true);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs[0].current?.focus();
        setTimeout(() => setShakeOtp(false), 400);
      }
    } catch (err) {
      setApiError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authService.resendOTP({ email: formData.email });
      if (res.success) {
        showToast({ type: 'success', title: 'Code Sent', message: 'New verification code sent!' });
        setTimeLeft(600);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs[0].current?.focus();
        setApiError(null);
      } else {
        setApiError(res.message);
      }
    } catch (err) {
      setApiError('Failed to resend code');
    }
  };



  return (
    <div className="auth-split" style={{ height: '100vh', display: 'grid', gridTemplateColumns: '45% 55%', background: '#ffffff', overflow: 'hidden' }}>
      {/* LEFT PANEL - clean full-bleed photo only */}
      <div className="auth-left" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: `url(${rightImg})`,
          backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right" style={{ background: '#ffffff', padding: '48px 52px', overflowY: 'auto' }}>
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
            .auth-split { grid-template-columns: 1fr !important; }
            .auth-left { display: none !important; }
            .auth-right { padding: 32px 24px !important; }
          }
        `}</style>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onBackToHome && (
            <button onClick={onBackToHome} style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Home
            </button>
          )}
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <button onClick={onShowLogin} style={{ color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Sign in</button>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} />

        {/* API Error Banner */}
        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeIn 0.2s' }}>
            <AlertTriangle style={{ color: '#ef4444', width: 20, height: 20, flexShrink: 0 }} />
            <div style={{ flex: 1, color: '#991b1b', fontSize: '0.875rem', marginTop: 1 }}>{apiError}</div>
            <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>✕</button>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>How will you use GreenCare?</h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 28 }}>Choose your account type</p>
            {errors.role && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: 12 }}>{errors.role}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roleOptions.map(r => {
                const Icon = r.icon;
                const sel = formData.role === r.id;
                return (
                  <label key={r.id} onClick={() => updateField('role', r.id)} style={{ display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 10, cursor: 'pointer',
                    border: sel ? '1.5px solid #16a34a' : '1.5px solid #e5e7eb',
                    boxShadow: sel ? '0 0 0 3px rgba(22,163,74,0.1)' : 'none',
                    background: sel ? '#f0fdf4' : '#ffffff', transition: 'all 0.2s ease' }}>
                    <input type="radio" name="role" value={r.id} checked={sel} onChange={() => updateField('role', r.id)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                    <Icon style={{ width: 24, height: 24, color: '#16a34a', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0d1f13', fontSize: '0.95rem' }}>{r.title}</div>
                      <div style={{ fontSize: '0.825rem', color: '#6b7280' }}>{r.subtitle}</div>
                    </div>
                    {sel && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 12, height: 12, color: '#fff' }} />
                    </div>}
                  </label>
                );
              })}
            </div>
            <button onClick={next} style={{ width: '100%', padding: 14, background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 32 }}>
              Continue
            </button>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 8 }}>Looking to buy recycled products?</p>
              <button onClick={() => onBuyerClick && onBuyerClick()} style={{ width: '100%', padding: 14, background: '#f0fdf4', color: '#16a34a',
                border: '1.5px solid #16a34a', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                Join as a Buyer
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>Tell us about yourself</h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 28 }}>Your details are secure</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Inp label="Full Name" name="fullName" placeholder="e.g. Uwase Claudine" value={formData.fullName}
                  onChange={v => {
                    // Block digits as user types
                    const cleaned = v.replace(/[0-9]/g, '');
                    if (cleaned.length <= 60) updateField('fullName', cleaned);
                  }}
                  error={errors.fullName} onBlur={(v) => handleBlur('fullName', v)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <Inp label="Email Address" name="email" type="email" placeholder="your@email.com" value={formData.email}
                  onChange={v => updateField('email', v)} error={errors.email} onBlur={(v) => handleBlur('email', v)} />
              </div>
              <Inp label="Phone Number" name="phone" type="tel" placeholder="e.g. +250792397681" value={formData.phone}
                onChange={v => updateField('phone', v)} error={errors.phone} onBlur={(v) => handleBlur('phone', v)} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>National ID Number</label>
                  <div style={{ position: 'relative' }} onMouseEnter={() => setTipVisible(true)} onMouseLeave={() => setTipVisible(false)}>
                    <Info style={{ width: 14, height: 14, color: '#9ca3af', cursor: 'help' }} />
                    {tipVisible && (
                      <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                        marginBottom: 8, padding: '8px 12px', background: '#1f2937', color: '#fff',
                        fontSize: '0.75rem', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 10 }}>
                        Your 16-digit Rwandan National ID
                      </div>
                    )}
                  </div>
                </div>
                <input type="text" name="nationalId" placeholder="1 XXXX X XXXXXXX X XX" value={formData.nationalId}
                  onChange={e => updateField('nationalId', e.target.value)} style={inpSx(errors.nationalId)}
                  aria-invalid={!!errors.nationalId}
                  onFocus={e => { if (!errors.nationalId) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.1)'; }}}
                  onBlur={(e) => handleBlur('nationalId', e.target.value)} />
                {errors.nationalId && <p role="alert" style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0 0' }}>{errors.nationalId}</p>}
              </div>
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <Inp label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password}
                  onChange={v => updateField('password', v)} error={errors.password} onBlur={(v) => handleBlur('password', v)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
                {/* PASSWORD STRENGTH INDICATOR */}
                {formData.password && (
                  <div style={{ marginTop: -8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      <div style={{ height: 4, flex: 1, borderRadius: 2, transition: 'background 0.3s', background: pScore > 0 ? (pScore === 1 ? '#ef4444' : pScore === 2 ? '#f97316' : pScore === 3 ? '#eab308' : '#16a34a') : '#e5e7eb' }} />
                      <div style={{ height: 4, flex: 1, borderRadius: 2, transition: 'background 0.3s', background: pScore > 1 ? (pScore === 2 ? '#f97316' : pScore === 3 ? '#eab308' : '#16a34a') : '#e5e7eb' }} />
                      <div style={{ height: 4, flex: 1, borderRadius: 2, transition: 'background 0.3s', background: pScore > 2 ? (pScore === 3 ? '#eab308' : '#16a34a') : '#e5e7eb' }} />
                      <div style={{ height: 4, flex: 1, borderRadius: 2, transition: 'background 0.3s', background: pScore > 3 ? '#16a34a' : '#e5e7eb' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: 6, color: '#6b7280' }}>
                      <span style={{ fontWeight: 600, color: pScore === 1 ? '#ef4444' : pScore === 2 ? '#f97316' : pScore === 3 ? '#eab308' : pScore === 4 ? '#16a34a' : '#6b7280' }}>
                        {pScore === 0 ? '' : pScore === 1 ? 'Weak' : pScore === 2 ? 'Fair' : pScore === 3 ? 'Good' : 'Strong'}
                      </span>
                      {pScore < 4 && pScore > 0 && ' · ' + (pScore === 1 ? 'Add uppercase letters' : pScore === 2 ? 'Add numbers' : 'Add special characters (!@#$%)')}
                      {pScore === 4 && <span style={{ color: '#16a34a' }}> ✓</span>}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <Inp label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={formData.confirmPassword} onChange={v => updateField('confirmPassword', v)} error={errors.confirmPassword} onBlur={(v) => handleBlur('confirmPassword', v)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: 14, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showConfirmPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 20, cursor: 'pointer' }}>
              <div onClick={() => updateField('agreeToTerms', !formData.agreeToTerms)}
                style={{ width: 18, height: 18, borderRadius: 4, border: '1.5px solid #e5e7eb',
                  background: formData.agreeToTerms ? '#16a34a' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, cursor: 'pointer' }}>
                {formData.agreeToTerms && <Check style={{ width: 12, height: 12, color: '#fff' }} />}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                I agree to the <a href="#" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, margin: '4px 0 0 0' }}>{errors.agreeToTerms}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
              <button onClick={back} style={{ padding: 14, border: '1.5px solid #e5e7eb', borderRadius: 8,
                background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>Back</button>
              <button onClick={next} style={{ padding: 14, border: 'none', borderRadius: 8,
                background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Continue</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>Where are you located?</h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 28 }}>This helps us connect you with local collectors</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Sel label="Province" value={formData.province} onChange={v => { updateField('province', v); setFormData(p => ({ ...p, province: v, district: '', sector: '', cell: '', village: '' })); }}
                options={provinces} placeholder="Select Province" error={errors.province} onBlur={() => { setTouched(p => ({ ...p, province: true })); if (!formData.province) setErrors(p => ({ ...p, province: 'Please select your province' })); }} />
              <Sel label="District" value={formData.district} onChange={v => { updateField('district', v); setFormData(p => ({ ...p, district: v, sector: '', cell: '', village: '' })); }}
                options={districts} disabled={!formData.province} placeholder="Select District" error={errors.district} onBlur={() => { setTouched(p => ({ ...p, district: true })); if (!formData.district) setErrors(p => ({ ...p, district: 'Please select your district' })); }} />
              <Sel label="Sector" value={formData.sector} onChange={v => { updateField('sector', v); setFormData(p => ({ ...p, sector: v, cell: '', village: '' })); }}
                options={sectors} disabled={!formData.district} placeholder="Select Sector" error={errors.sector} onBlur={() => { setTouched(p => ({ ...p, sector: true })); if (!formData.sector) setErrors(p => ({ ...p, sector: 'Please select your sector' })); }} />
              <Sel label="Cell" value={formData.cell} onChange={v => { updateField('cell', v); setFormData(p => ({ ...p, cell: v, village: '' })); }}
                options={cells} disabled={!formData.sector} placeholder="Select Cell" />
              <div style={{ gridColumn: 'span 2' }}>
                <Inp label="Village" name="village" placeholder="e.g. Amahoro Village"
                  value={formData.village} onChange={v => updateField('village', v)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <Inp label="Street / Additional Address (optional)" name="street" placeholder="e.g. KG 11 Ave, House No. 4"
                  value={formData.streetAddress} onChange={v => updateField('streetAddress', v)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
              <button onClick={back} style={{ padding: 14, border: '1.5px solid #e5e7eb', borderRadius: 8,
                background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>Back</button>
              <button onClick={submit} disabled={isLoading}
                style={{ padding: 14, border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading && <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {isLoading ? 'Creating your account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ animation: 'fadeIn 0.2s ease', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
            {otpVerified ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check style={{ width: 32, height: 32 }} strokeWidth={3} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>Email Verified! 🎉</h2>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Welcome to GreenCare Rwanda. Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f13', marginBottom: 8 }}>Check your inbox</h2>
                <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: 32 }}>
                  We sent a 6-digit code to <span style={{ fontWeight: 700, color: '#0d1f13' }}>{formData.email}</span>
                </p>

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

                <button onClick={verifyOtpSubmit} disabled={isLoading || timeLeft === 0}
                  style={{ width: '100%', padding: 14, border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff',
                    fontWeight: 700, fontSize: '0.95rem', cursor: (isLoading || timeLeft === 0) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || timeLeft === 0) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                  {isLoading && <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Didn't receive it?{' '}
                  <button onClick={handleResendOtp} disabled={resendCooldown > 0}
                    style={{ background: 'none', border: 'none', padding: 0,
                      color: resendCooldown > 0 ? '#9ca3af' : '#16a34a', fontWeight: 600,
                      cursor: resendCooldown > 0 ? 'default' : 'pointer' }}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
