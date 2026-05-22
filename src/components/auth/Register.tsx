import React, { useState } from 'react';
import { getErrorMessage } from '../../services/errorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const registerSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4 py-12 relative overflow-hidden">
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
            Create <span className="text-neon-cyan font-bold">Account</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-wide font-medium mt-1">
            Join Ledger.OS to manage your finances
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="John"
                    className="input pl-11"
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName?.message && (
                  <p className="mt-1 text-xs text-neon-pink">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Doe"
                    className="input pl-11"
                    {...register('lastName')}
                  />
                </div>
                {errors.lastName?.message && (
                  <p className="mt-1 text-xs text-neon-pink">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="input pl-11 pr-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword?.message && (
                <p className="mt-1 text-xs text-neon-pink">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded bg-white/5 border border-white/10 text-neon-cyan focus:ring-neon-cyan/50"
              />
              <span className="ml-2 text-xs text-white/60">
                I agree to the{' '}
                <button
                  type="button"
                  className="text-neon-cyan hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="text-neon-cyan hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-neon-cyan hover:underline">
            Sign in here
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-white/20">
          © 2024 Ledger.OS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
