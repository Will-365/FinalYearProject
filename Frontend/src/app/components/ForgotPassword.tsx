import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Recycle, ArrowLeft, Mail, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'Reset code sent!');
      setStep(2);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyResetOTP({ email, otp });
      toast.success('Code verified!');
      setStep(3);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully!');
      setStep(4);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'New code sent!');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Recycle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="font-bold text-3xl text-gray-900">Green Care Rwanda</h1>
          <p className="text-gray-600 mt-2">Reset Your Password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-green-600" />
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Create New Password'}
              {step === 4 && 'Password Reset Complete'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter your email to receive a verification code'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a strong password for your account'}
              {step === 4 && 'You can now login with your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send a verification code to this email
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Code sent to {email}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Didn't receive code? Resend
                </Button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Password Reset Successful!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                </div>
                <Button
                  onClick={onBackToLogin}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {step !== 4 && (
          <Button
            type="button"
            variant="link"
            className="w-full text-sm mt-4"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        )}
      </div>
    </div>
  );
}
