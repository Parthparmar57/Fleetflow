import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Save, 
  Download, 
  Trash2, 
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { fleetService } from '../services/api';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = ({ children, className, title, subtitle, footer }: any) => (
  <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", className)}>
    {(title || subtitle) && (
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
        {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className="p-8 flex-1">{children}</div>
    {footer && <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">{footer}</div>}
  </div>
);

const Toggle = ({ enabled, onChange, label, description }: any) => (
  <div className="flex items-center justify-between py-4 group">
    <div className="flex-1">
      <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button 
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-11 h-6 rounded-full transition-all relative flex items-center px-1",
        enabled ? "bg-primary" : "bg-slate-200 hover:bg-slate-300"
      )}
    >
      <div className={cn(
        "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
        enabled ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
);

export default function Settings() {
  const { user, updateUser, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: ''
  });

  // Settings State
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    sms: false
  });
  
  const [workspaceSettings, setWorkspaceSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    theme: 'light'
  });

  // Security State
  const [securityForm, setSecurityForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || ''
      });
      
      if (user.notificationSettings) {
        setNotifSettings(user.notificationSettings);
      }
      
      if (user.workspaceSettings) {
        setWorkspaceSettings(user.workspaceSettings);
      }
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fleetService.updateProfile(profileForm);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    setIsLoading(true);
    try {
      const response = await fleetService.updateSettings({
        notificationSettings: notifSettings,
        workspaceSettings: workspaceSettings
      });
      // Refresh user to get latest settings
      await checkAuth();
      toast.success('Preferences saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    setIsLoading(true);
    try {
      await fleetService.changePassword({
        oldPassword: securityForm.oldPassword,
        newPassword: securityForm.newPassword
      });
      setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fleetService.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `fleetflow_data_${user?.id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? You will be logged out immediately.')) {
      try {
        await fleetService.deleteAccount();
        toast.success('Account deactivated');
        window.location.href = '/login';
      } catch (error) {
        toast.error('Failed to deactivate account');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'workspace', label: 'Workspace', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Personal Workspace</h1>
          <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2">
            Control your presence and preferences at FleetFlow.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => activeTab === 'profile' ? handleProfileSave({ preventDefault: () => {} } as any) : handleSettingsSave()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {activeTab === 'security' ? 'Update Password' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white/50 backdrop-blur-xl p-3 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <div className="space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-300 text-sm font-bold",
                    activeTab === tab.id 
                      ? "bg-white text-primary shadow-lg shadow-slate-100 border border-slate-100 scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
                  )}>
                    <tab.icon size={18} />
                  </div>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-nav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card 
                  title="Professional Identity" 
                  subtitle="Manage how you appear to others in the fleet network."
                >
                  <div className="space-y-8">
                    {/* Avatar Preview */}
                    <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="w-24 h-24 rounded-3xl bg-white border-2 border-primary/20 shadow-inner overflow-hidden p-1.5">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileForm.name || 'User'}`} 
                          alt="Avatar" 
                          className="w-full h-full rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900">Dynamic Avatar</p>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                          Your avatar is generated based on your name. Change your profile name to update your look.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Display Name</label>
                        <div className="relative">
                          <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Contact Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="email" 
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="tel" 
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Primary Location</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Short Bio</label>
                        <div className="relative">
                          <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
                          <textarea 
                            rows={3}
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none"
                            placeholder="Tell us a bit about your role..."
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 text-right font-bold">{profileForm.bio.length}/200 characters</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card 
                  title="Communication Pulse" 
                  subtitle="Define which alerts require your immediate attention."
                >
                  <div className="space-y-2 divide-y divide-slate-50">
                    <Toggle 
                      enabled={notifSettings.email} 
                      onChange={(val: boolean) => setNotifSettings({...notifSettings, email: val})}
                      label="Email Intelligence"
                      description="Comprehensive logs, weekly summaries, and critical system alerts."
                    />
                    <Toggle 
                      enabled={notifSettings.push} 
                      onChange={(val: boolean) => setNotifSettings({...notifSettings, push: val})}
                      label="Real-time Desktop Alerts"
                      description="Instant notifications for trip status changes and safety warnings."
                    />
                    <Toggle 
                      enabled={notifSettings.sms} 
                      onChange={(val: boolean) => setNotifSettings({...notifSettings, sms: val})}
                      label="High-Priority SMS"
                      description="Urgent maintenance and personnel safety alerts directly to your phone."
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card 
                  title="Credential Vault" 
                  subtitle="Secure your account by updating your passwords regularly."
                >
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Current Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type={showPwd.old ? "text" : "password"}
                          value={securityForm.oldPassword}
                          onChange={(e) => setSecurityForm({...securityForm, oldPassword: e.target.value})}
                          className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPwd({...showPwd, old: !showPwd.old})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPwd.old ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                          <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type={showPwd.new ? "text" : "password"}
                            value={securityForm.newPassword}
                            onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="Min. 8 chars"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPwd({...showPwd, new: !showPwd.new})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                          <CheckCircle2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type={showPwd.confirm ? "text" : "password"}
                            value={securityForm.confirmPassword}
                            onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                            placeholder="Repeat password"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPwd({...showPwd, confirm: !showPwd.confirm})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'workspace' && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card 
                  title="Global Configuration" 
                  subtitle="Localized experience for different regions and workflows."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800">Interface Language</label>
                      <select 
                        value={workspaceSettings.language}
                        onChange={(e) => setWorkspaceSettings({...workspaceSettings, language: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800">Regional Timezone</label>
                      <select 
                        value={workspaceSettings.timezone}
                        onChange={(e) => setWorkspaceSettings({...workspaceSettings, timezone: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none"
                      >
                        <option value="UTC">UTC (Universal)</option>
                        <option value="EST">EST (New York)</option>
                        <option value="PST">PST (Los Angeles)</option>
                        <option value="IST">IST (New Delhi)</option>
                      </select>
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                       <p className="text-sm font-bold text-slate-800 mb-4">Visual Theme</p>
                       <div className="grid grid-cols-3 gap-4">
                          {['light', 'dark', 'system'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setWorkspaceSettings({...workspaceSettings, theme: t})}
                              className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                workspaceSettings.theme === t 
                                  ? "border-primary bg-primary/5 text-primary" 
                                  : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                              )}
                            >
                              <div className={cn(
                                "w-full h-8 rounded-lg",
                                t === 'light' ? "bg-white border border-slate-200" : t === 'dark' ? "bg-slate-900" : "bg-linear-to-r from-white to-slate-900"
                              )} />
                              <span className="text-xs font-black uppercase tracking-tighter">{t}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-8">
                  <Card 
                    title="Export Archive" 
                    subtitle="Request a full JSON snapshot of your data for external auditing."
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900 italic">Snapshot Generation</p>
                        <p className="text-xs text-slate-500">Includes profile, logs, and workspace metadata.</p>
                      </div>
                      <button 
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:opacity-90 shadow-lg shadow-slate-200 transition-all uppercase tracking-widest"
                      >
                        <Download size={14} />
                        Request Export
                      </button>
                    </div>
                  </Card>

                  <Card 
                    title="Deactivation Zone" 
                    className="border-rose-100 bg-rose-50/20"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Permanent Deactivation</h4>
                          <p className="text-xs text-rose-700/70 mt-1 leading-relaxed">
                            Deactivating your account will freeze all active trips and revoke access to your dashboard. This process is reversible only by contacting a system administrator.
                          </p>
                        </div>
                        <button 
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all uppercase tracking-widest"
                        >
                          <Trash2 size={14} />
                          Deactivate Workspace
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
