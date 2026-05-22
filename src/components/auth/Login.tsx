import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '../../services/errorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const redirectMessage = (location.state as { message?: string })?.message;

  useEffect(() => {
    if (redirectMessage) {
      setError(redirectMessage);
    }
  }, [redirectMessage]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-neon-purple/20 blur-[120px] pointer-events-none animate-float" />
      <div
        className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-neon-cyan/15 blur-[120px] pointer-events-none animate-float"
        style={{ animationDelay: '-2s' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 mb-4">
            <span className="font-display font-bold text-neon-cyan text-2xl">Φ</span>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight text-white">
            <span className="text-neon-cyan font-bold">Ledger</span>Flow
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-wide font-medium mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8">
          {error && (
            <div className="mb-6 bg-neon-pink/10 border border-neon-pink/20 text-neon-pink px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input pl-11"
                  {...register('email')}
                />
              </div>
              {errors.email?.message && (
                <p className="mt-1 text-xs text-neon-pink">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input pl-11 pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="mt-1 text-xs text-neon-pink">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-white/5 border border-white/10 text-neon-cyan focus:ring-neon-cyan/50"
                />
                <span className="text-xs text-white/60">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs font-medium text-neon-cyan hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-neon-cyan hover:underline">
            Sign up here
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-white/20">
          © 2024 Ledger.OS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
