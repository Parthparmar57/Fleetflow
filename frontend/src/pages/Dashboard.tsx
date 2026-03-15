import React, { useEffect, useState } from 'react';
import {
  Truck,
  TrendingUp,
  Wrench,
  Users,
  MapPin,
  AlertCircle,
  Plus,
  Filter,
  UserPlus,
  Calendar,
  Route,
  Fuel
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fleetService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QUICK_ACTIONS = [
  { label: 'Add Driver', icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Onboard a new operator', path: '/app/drivers', roles: ['safety_officer'] },
  { label: 'Add Trip', icon: Route, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Create a new assignment', path: '/app/trips', roles: ['fleet_manager', 'dispatcher'] },
  { label: 'Add Vehicle', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Register a new asset', path: '/app/vehicles', roles: ['fleet_manager'] },
  { label: 'Schedule Service', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Plan maintenance', path: '/app/maintenance', roles: ['fleet_manager'] },
];

const Card = ({ children, className, title, subtitle, action }: any) => (
  <div className={cn("glass-card rounded-[2.5rem] overflow-hidden", className)}>
    {(title || action) && (
      <div className="px-8 py-6 border-b border-white/40 flex items-center justify-between bg-white/30">
        <div>
          {title && <h3 className="font-black text-slate-900 tracking-tight text-lg">{title}</h3>}
          {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'In Transit': 'bg-blue-50 text-blue-700 border-blue-100',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Delayed': 'bg-rose-50 text-rose-700 border-rose-100',
    'Available': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'In Shop': 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[status] || 'bg-slate-50 text-slate-600 border-slate-100')}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expiringLicenses, setExpiringLicenses] = useState<any[]>([]);
  const [fleetAnalytics, setFleetAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [metricsRes, tripsRes] = await Promise.all([
          fleetService.getDashboardMetrics({ period: activeFilter }),
          fleetService.getTrips({ status: 'dispatched', limit: 5 })
        ]);

        setDashboardMetrics(metricsRes.data);
        setRecentTrips(tripsRes.data.trips || []);

        if (user?.role === 'safety_officer' || user?.role === 'fleet_manager') {
          const expiringRes = await fleetService.getExpiringLicenses();
          setExpiringLicenses(expiringRes.data || []);
        }

        if (user?.role === 'financial_analyst' || user?.role === 'fleet_manager') {
          const fleetRes = await fleetService.getFleetAnalytics({ period: activeFilter });
          setFleetAnalytics(fleetRes.data);
        }
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeFilter]);

  const stats = dashboardMetrics ? [
    {
      label: 'Active Fleet',
      value: dashboardMetrics.activeFleet?.value || 0,
      change: dashboardMetrics.activeFleet?.change || '0%',
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Utilization',
      value: `${dashboardMetrics.utilizationRate?.value || 0}%`,
      change: dashboardMetrics.utilizationRate?.change || '0%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Maintenance Alerts',
      value: dashboardMetrics.maintenanceAlerts?.value || 0,
      change: dashboardMetrics.maintenanceAlerts?.change || '0%',
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Pending Cargo',
      value: dashboardMetrics.pendingCargo?.value || 0,
      change: dashboardMetrics.pendingCargo?.change || '0%',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
  ] : [];

  const financialStats = fleetAnalytics ? [
    {
      label: 'Operational Cost',
      value: `$${fleetAnalytics.costs?.totalOperational?.toLocaleString() || 0}`,
      change: fleetAnalytics.costs?.operationalChange || '0%',
      icon: TrendingUp,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      label: 'Cost per KM',
      value: `$${fleetAnalytics.costs?.costPerKm || 0}`,
      change: fleetAnalytics.costs?.costPerKmChange || '0%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Fuel Efficiency',
      value: `${fleetAnalytics.fuel?.efficiency || 0} km/L`,
      change: fleetAnalytics.fuel?.change || '0%',
      icon: Fuel,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Total Fuel Spend',
      value: `$${fleetAnalytics.fuel?.totalCost?.toLocaleString() || 0}`,
      change: fleetAnalytics.fuel?.costChange || '0%',
      icon: Fuel,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ] : [];

  const displayStats = user?.role === 'financial_analyst' ? financialStats : stats;

  const filterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  const vehicleStatusData = dashboardMetrics ? [
    { 
      label: 'Available', 
      count: dashboardMetrics.statusDistribution?.available || 0, 
      color: 'bg-emerald-500', 
      percent: dashboardMetrics.totalVehicles > 0 
        ? (dashboardMetrics.statusDistribution?.available / dashboardMetrics.totalVehicles) * 100 
        : 0 
    },
    { 
      label: 'On Trip', 
      count: dashboardMetrics.statusDistribution?.onTrip || 0, 
      color: 'bg-blue-500', 
      percent: dashboardMetrics.totalVehicles > 0 
        ? (dashboardMetrics.statusDistribution?.onTrip / dashboardMetrics.totalVehicles) * 100 
        : 0 
    },
    { 
      label: 'In Maintenance', 
      count: dashboardMetrics.statusDistribution?.inMaintenance || 0, 
      color: 'bg-amber-500', 
      percent: dashboardMetrics.totalVehicles > 0 
        ? (dashboardMetrics.statusDistribution?.inMaintenance / dashboardMetrics.totalVehicles) * 100 
        : 0 
    },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your fleet today.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Filter size={16} />
              {filterOptions.find(o => o.value === activeFilter)?.label}
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setActiveFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50",
                      activeFilter === option.value ? "text-primary font-bold bg-primary/5" : "text-slate-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(user?.role === 'fleet_manager' || user?.role === 'dispatcher') && (
            <button 
              onClick={() => navigate('/app/trips', { state: { openModal: true } })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus size={16} />
              New Trip
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayStats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:scale-[1.02] transition-all duration-300 cursor-pointer group border-white/40">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg)}>
                      <stat.icon className={stat.color} size={28} />
                    </div>
                    <div className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter",
                      stat.change.startsWith('+') ? "text-emerald-700 bg-emerald-100/50" : "text-rose-700 bg-rose-100/50"
                    )}>
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUICK_ACTIONS.filter(a => !a.roles || a.roles.includes(user?.role || '')).map((action, idx) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  onClick={() => navigate(action.path || '#', { state: { openModal: true } })}
                  className="flex items-center gap-5 p-5 glass-card rounded-[2.5rem] border-white/40 shadow-soft hover:shadow-premium hover:translate-y-[-4px] active:scale-[0.98] transition-all text-left group w-full"
                >
                  <div className={cn("p-4 rounded-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner", action.bg)}>
                    <action.icon className={cn(action.color, "group-hover:text-white")} size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{action.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              className="lg:col-span-2"
              title="Fleet Activity"
              subtitle="Vehicle status distribution"
            >
              <div className="space-y-6 mt-4">
                {vehicleStatusData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.count} vehicles</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn("h-full rounded-full", item.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Maintenance Alert" subtitle="Critical vehicles">
              <div className="space-y-3 mt-4">
                {dashboardMetrics?.maintenanceAlerts?.value > 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900">{dashboardMetrics.maintenanceAlerts.value} vehicles</p>
                    <p className="text-[10px] text-amber-700 mt-1">Require immediate service</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-900">✓ All Good</p>
                    <p className="text-[10px] text-emerald-700 mt-1">No maintenance required</p>
                  </div>
                )}
              </div>
            </Card>

            {(user?.role === 'safety_officer' || user?.role === 'fleet_manager') && (
              <Card title="Safety Alerts" subtitle="Expiring licenses (30 days)">
                <div className="space-y-3 mt-4">
                  {expiringLicenses.length > 0 ? expiringLicenses.map((driver) => (
                    <div key={driver._id} className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-rose-900">{driver.name}</p>
                        <p className="text-[10px] text-rose-600">Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}</p>
                      </div>
                      <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                        <AlertCircle size={14} />
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-900">✓ Compliance Clear</p>
                      <p className="text-[10px] text-emerald-700 mt-1">No licenses expiring soon</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <Card
            title="Recent Trips"
            subtitle="Real-time monitoring of active assignments"
          >
            <div className="hidden md:block overflow-x-auto -mx-6">
              {recentTrips.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-y border-slate-100">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trip ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{trip.tripId}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{trip.vehicleId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{trip.driverId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-slate-400" />
                            {trip.originLocation} → {trip.destinationLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={trip.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No recent trips found
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 -mx-2">
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <div key={trip._id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900">{trip.tripId}</p>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle / Driver</p>
                        <p className="text-xs font-semibold text-slate-700 mt-1 truncate">{trip.vehicleId?.name || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{trip.driverId?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-700">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{trip.originLocation} → {trip.destinationLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500">No recent trips found</div>
              )}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
