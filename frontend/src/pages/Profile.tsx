import React, { useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import authService from '../services/auth';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { User, Mail, Calendar, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Simple size check (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 2MB.');
      return;
    }

    setIsUploading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // Send image to backend
      const updatedUser = await authService.uploadAvatar(file);
      // Update global Zustand store
      setUser(updatedUser);
      setSuccessMsg('Profile picture updated successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">User Profile</h1>
        <p className="text-slate-400 text-xs mt-1">Manage your account details and upload profile avatars.</p>
      </div>

      <GlassCard className="border border-white/10 relative overflow-hidden">
        {/* Floating background blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar upload area */}
          <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-primary to-accent p-[2px] relative shadow-2xl transition-transform duration-300 group-hover/avatar:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-4xl text-primary-light">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Upload Overlay */}
              <div className="absolute inset-[2px] bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white mb-1.5" />
                <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">Upload</span>
              </div>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
          </div>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </div>

        {/* Detailed Form (Read-Only fields representing details) */}
        <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-[38px] w-4 h-4 text-slate-500" />
            <Input
              label="Full Name"
              type="text"
              readOnly
              value={user?.name || ''}
              className="pl-11 bg-slate-950/20 text-slate-400 border-white/5 cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-[38px] w-4 h-4 text-slate-500" />
            <Input
              label="Email Address"
              type="email"
              readOnly
              value={user?.email || ''}
              className="pl-11 bg-slate-950/20 text-slate-400 border-white/5 cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-[38px] w-4 h-4 text-slate-500" />
            <Input
              label="Member Since"
              type="text"
              readOnly
              value={memberSince}
              className="pl-11 bg-slate-950/20 text-slate-400 border-white/5 cursor-not-allowed"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
export default Profile;
