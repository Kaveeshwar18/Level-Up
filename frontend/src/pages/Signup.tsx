import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        name,
        email,
        password,
        confirmPassword
      });
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Try using a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11131E] flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background abstract shapes matching mockup */}
      {/* Diagonal Capsule */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[340px] bg-[#1A1C29]/70 rounded-[100px] rotate-[-35deg] pointer-events-none -z-10 shadow-inner"></div>
      
      {/* Circle shape */}
      <div className="absolute top-[63%] left-[20%] w-24 h-24 bg-[#1C1F2E]/90 rounded-full pointer-events-none -z-10 shadow-lg"></div>
      
      {/* Soft gradient glows */}
      <div className="absolute top-[15%] left-[10%] w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-[120px] pointer-events-none -z-20"></div>
      <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none -z-20"></div>
      
      {/* Muted background crossmarks */}
      <div className="absolute top-[20%] left-[26%] text-[#25293A] text-xl font-bold select-none opacity-40 pointer-events-none -z-10">+</div>
      <div className="absolute top-[40%] left-[19%] text-[#25293A] text-2xl font-bold select-none opacity-30 pointer-events-none -z-10">+</div>
      <div className="absolute bottom-[22%] right-[26%] text-[#25293A] text-xl font-bold select-none opacity-45 pointer-events-none -z-10">+</div>
      
      {/* Main card */}
      <div className="w-full max-w-[400px] z-10 flex flex-col items-center">
        <div className="w-full bg-[#1C1F2D] border border-white/[0.03] p-10 rounded-[28px] shadow-2xl text-center flex flex-col items-center">
          
          {/* Logo */}
          <h1 
            onClick={() => navigate('/')}
            className="text-3xl font-black text-white tracking-tighter mb-8 cursor-pointer select-none hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            level up
          </h1>

          {error && (
            <div className="mb-6 p-3.5 w-full rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-2xs font-bold text-left leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Full Name */}
            <div className="text-left">
              <label className="text-[9px] font-black text-[#5B6382] tracking-widest uppercase mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#25293A] border-none rounded-xl text-white placeholder-slate-600 text-xs py-3.5 px-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-[#282D42] transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="text-left">
              <label className="text-[9px] font-black text-[#5B6382] tracking-widest uppercase mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#25293A] border-none rounded-xl text-white placeholder-slate-600 text-xs py-3.5 px-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-[#282D42] transition-all"
              />
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="text-[9px] font-black text-[#5B6382] tracking-widest uppercase mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="•••••••• (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#25293A] border-none rounded-xl text-white placeholder-slate-600 text-xs py-3.5 px-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-[#282D42] transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <label className="text-[9px] font-black text-[#5B6382] tracking-widest uppercase mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#25293A] border-none rounded-xl text-white placeholder-slate-600 text-xs py-3.5 px-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-[#282D42] transition-all"
              />
            </div>

            {/* Get Started Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white hover:bg-slate-100 active:scale-95 text-black py-3 px-8 rounded-full font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all w-48 mt-6 shadow-md shadow-white/5 disabled:opacity-50"
            >
              <span>{isLoading ? 'CREATING...' : 'GET STARTED'}</span>
              <span className="w-4.5 h-4.5 rounded-full bg-[#38BDF8] flex items-center justify-center text-white font-extrabold text-[8px] flex-shrink-0 pl-[1px]">
                ▶
              </span>
            </button>
          </form>
        </div>

        {/* Link below the card */}
        <Link
          to="/login"
          className="text-[9px] font-black text-[#5B6382] hover:text-slate-300 tracking-widest uppercase mt-8 block transition-all"
        >
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};
export default Signup;
