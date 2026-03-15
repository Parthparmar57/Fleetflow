import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  Phone, 
  MapPin, 
  Package, 
  Truck, 
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fleetService } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fleetService.getPersonalStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching personal stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  
  const pieData = stats ? [
    { name: 'Draft', value: stats.statusDistribution.draft },
    { name: 'Dispatched', value: stats.statusDistribution.dispatched },
    { name: 'Completed', value: stats.statusDistribution.completed },
    { name: 'Cancelled', value: stats.statusDistribution.cancelled },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="h-40 bg-linear-to-r from-primary via-primary/80 to-indigo-600 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl relative z-10">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt="Avatar" 
                  className="w-full h-full transition-transform hover:scale-110 duration-500"
                />
              </div>
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 leading-none">{user?.name}</h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
              </p>
            </div>
            <div className="flex gap-3 mb-2">
              <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{user?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{user?.address || 'Not set'}</p>
              </div>
            </div>
          </div>

          {user?.bio && (
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
              "{user.bio}"
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats and Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Analytics */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{stats?.totalTrips || 0}</h3>
                <p className="text-slate-500 font-medium mt-1">Trips Created</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <Package size={20} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{stats?.totalCargoWeight || 0}t</h3>
                <p className="text-slate-500 font-medium mt-1">Cargo Managed</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  <Truck size={20} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{stats?.vehiclesCreated || 0}</h3>
                <p className="text-slate-500 font-medium mt-1">Vehicles Enrolled</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Trip Overview</h3>
                <p className="text-slate-500 text-sm mt-1">Your management performance</p>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                ACTIVE TREND
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Managed', value: stats?.totalTrips || 0 },
                  { name: 'Revenue', value: (stats?.totalTrips || 0) * 120 },
                  { name: 'Capacity', value: stats?.totalCargoWeight || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Profile Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {/* Status Breakdown */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              Success Rate
            </h3>
            <div className="h-48 relative flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                  <AlertCircle size={40} className="text-slate-200" />
                  No data yet
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">
                  {stats?.totalTrips > 0 ? ((stats.statusDistribution.completed / stats.totalTrips) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SUCCESS</span>
              </div>
            </div>
            
            <div className="space-y-3 mt-8">
              {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((label, idx) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {stats ? Object.values(stats.statusDistribution)[idx] : 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Recent Actions
            </h3>
            <div className="space-y-6">
              {stats?.recentTrips?.length > 0 ? stats.recentTrips.map((trip: any) => (
                <div key={trip._id} className="flex gap-4 relative group">
                  <div className="w-px h-full bg-slate-100 absolute left-[19px] top-10 group-last:hidden"></div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">Created Trip {trip.tripId}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(trip.createdAt).toLocaleString()}</p>
                    <div className="mt-2 text-xs font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                      {trip.originLocation} → {trip.destinationLocation}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm italic">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
