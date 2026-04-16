import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, signupUser } from "../api/authApi";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import {
  LogIn, UserPlus, Mail, Lock, User,
  Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';

const LoginContent = () => {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });

  // Google state
  const [googlePending, setGooglePending] = useState(null);
  const [googleRole, setGoogleRole] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Number', test: (p) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const isPasswordStrong = passwordRules.every(r => r.test(formData.password));

  const redirectByRole = (role) => {
    if (role === 'TEACHER') navigate('/teacher/dashboard');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleEmailBlur = () => {
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (authMode === 'signup' && !isPasswordStrong) {
      setError('Please meet all password requirements.');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (authMode === 'login') {
        response = await loginUser({ email: formData.email, password: formData.password });
      } else {
        response = await signupUser(formData);
      }

      if (response.data.rejected) {
        setError(response.data.message);
        setFormData({ name: '', email: '', password: '', role: '' });
        return;
      }

      if (authMode === 'signup') {
        alert(response.data.message);
        setAuthMode('login');
        return;
      }

      const { token, user } = response.data;
      login(user, token);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        credential: credentialResponse.credential
      });
      if (res.data.newUser) {
        setGooglePending({ ...res.data, credential: credentialResponse.credential });
      } else {
        login(res.data.user, res.data.token);
        redirectByRole(res.data.user.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRoleSubmit = async () => {
    if (!googleRole) return;
    setGoogleLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        name: googlePending.name,
        email: googlePending.email,
        googleId: googlePending.googleId,
        role: googleRole
      });
      login(res.data.user, res.data.token);
      redirectByRole(res.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
      setGooglePending(null);
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setGoogleLoading(true);
      try {
        // Get user info from Google using the access token
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const { name, email, sub } = userInfo.data;

        const res = await axios.post('http://localhost:5000/api/auth/google', {
          name, email, googleId: sub
        });

        if (res.data.newUser) {
          setGooglePending({ name, email, googleId: sub });
        } else {
          login(res.data.user, res.data.token);
          redirectByRole(res.data.user.role);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed')
  });

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">
      <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 blur-[120px] -z-10" />
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
            ExamFlow<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-slate-400 font-medium">Secure Digital Assessments</p>
        </div>

        {/* Google Role Selection Screen */}
        {googlePending ? (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">Welcome, {googlePending.name}!</h3>
              <p className="text-slate-400 text-sm mt-1">{googlePending.email}</p>
              <p className="text-slate-400 font-medium mt-3">Select your role to continue</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['STUDENT', 'TEACHER'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setGoogleRole(r)}
                  className={`py-5 rounded-2xl font-bold text-sm border-2 transition-all ${
                    googleRole === r
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleGoogleRoleSubmit}
              disabled={!googleRole || googleLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {googleLoading ? <Loader2 className="animate-spin" size={20} /> : null}
              <span>{googleLoading ? 'Creating Account...' : 'Continue'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setGooglePending(null); setGoogleRole(''); setError(''); }}
              className="w-full mt-3 py-3 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl relative">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex p-1 bg-slate-800/50 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LogIn size={18} /> <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <UserPlus size={18} /> <span>Signup</span>
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text" required
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Full Name"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="email" required
                    className={`w-full bg-slate-800/50 border rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 ${emailError ? 'border-rose-500' : 'border-slate-700'}`}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={e => { setFormData({...formData, email: e.target.value}); setEmailError(''); }}
                    onBlur={handleEmailBlur}
                  />
                </div>
                {emailError && <p className="text-rose-400 text-xs font-bold mt-1.5 ml-2">{emailError}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Password"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {authMode === 'signup' && formData.password.length > 0 && (
                  <div className="mt-3 space-y-1.5 px-1">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs font-bold transition-colors ${rule.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <span>{rule.test(formData.password) ? '✓' : '✗'}</span>
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {authMode === 'signup' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['STUDENT', 'TEACHER'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({...formData, role})}
                        className={`py-3 rounded-2xl font-bold text-[10px] tracking-tighter border-2 transition-all ${formData.role === role ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin" size={20} /><span>Processing...</span></>
                ) : (
                  <span>{authMode === 'login' ? 'Enter Session' : 'Create Account'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-slate-500 text-sm font-medium">
              <span>{authMode === 'login' ? "New here?" : "Already joined?"}</span>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-bold"
              >
                {authMode === 'login' ? 'Join ExamFlow' : 'Sign in here'}
              </button>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={googleLoading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-slate-800 font-bold text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginContent;
