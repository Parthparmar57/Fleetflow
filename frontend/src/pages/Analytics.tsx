import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Fuel, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fleetService } from '../services/api';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Card = ({ children, className, title, subtitle }: any) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-slate-100">
        {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default function Analytics() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [fuelData, setFuelData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpiStats, setKpiStats] = useState<any>({
    avgTripCost: '$0.00',
    fuelCostPerKm: '$0.00',
    idleTime: '0 vehicles',
    fleetGrowth: '0 total',
    fleetRoi: '0%'
  });

  const handleExport = () => {
    try {
      let csv = "Metric,Value\n";
      csv += `Avg Trip Cost,${kpiStats.avgTripCost}\n`;
      csv += `Fuel Cost / KM,${kpiStats.fuelCostPerKm}\n`;
      csv += `Idle Time,${kpiStats.idleTime}\n`;
      csv += `Fleet Growth,${kpiStats.fleetGrowth}\n\n`;

      csv += "Month,Expenses,Fuel,Maintenance\n";
      chartData.forEach(d => {
        csv += `${d.name},${d.expenses || 0},${d.fuel || 0},${d.maintenance || 0}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "fleet_analytics_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch fleet analytics, trend data, and fuel data in parallel
        const [fleetRes, trendsRes, expensesRes] = await Promise.all([
          fleetService.getFleetAnalytics().catch(() => ({ data: null })),
          fleetService.getExpenseTrends(6).catch(() => ({ data: { trends: [] } })),
          fleetService.getFuelExpenses().catch(() => ({ data: { expenses: [] } }))
        ]);

        // 1. Process Fleet KPI Stats
        if (fleetRes.data) {
          const fleetData = fleetRes.data;
          
          // Avg Trip Cost: total Operational / Total completed trips
          const completedTrips = fleetData.trips?.completed || 0;
          const totalOpsCost = fleetData.costs?.totalOperational || 0;
          const avgTripCostNum = completedTrips > 0 ? (totalOpsCost / completedTrips) : 0;
          
          // Fuel Cost / KM
          const costPerKmNum = fleetData.costs?.costPerKm || 0;
          
          // Active Fleet
          const activeVehicles = fleetData.fleet?.activeVehicles || 0;
          const totalVehiclesNum = fleetData.fleet?.totalVehicles || 0;
          const idleVehiclesNum = totalVehiclesNum - activeVehicles;

          // Fleet ROI
          const totalAcquisition = fleetData.costs?.totalAcquisitionCost || 0;
          const roiNum = totalAcquisition > 0 ? (((completedTrips * 150) - totalOpsCost) / totalAcquisition * 100) : 0; // Estimation: $150 revenue per trip

          setKpiStats({
            avgTripCost: `$${avgTripCostNum.toFixed(2)}`,
            fuelCostPerKm: `$${costPerKmNum.toFixed(2)}`,
            idleTime: `${idleVehiclesNum} vehicles`,
            fleetGrowth: `${totalVehiclesNum} total`,
            fleetRoi: `${roiNum.toFixed(1)}%`
          });
        }

        // 2. Process Monthly Financial Trends (Bar Chart)
        if (trendsRes.data?.trends && trendsRes.data.trends.length > 0) {
          // The backend returns it descending by time, we want ascending for chart reading left-to-right
          const sortedTrends = [...trendsRes.data.trends].reverse();
          const mappedChartData = sortedTrends.map((t: any) => {
            const dateObj = new Date(t.month + '-01'); // Force parse YYYY-MM
            const monthName = dateObj.toLocaleString('default', { month: 'short' });
            return {
              name: monthName,
              revenue: 0, // Using expenses for both bars since we don't have revenue model yet, or just log expenses
              expenses: t.totalCost || 0,
              fuel: t.fuelCost || 0,
              maintenance: t.maintenanceCost || 0
            };
          });
          setChartData(mappedChartData);
        } else {
          setChartData([
            { name: 'Jan', expenses: 0, fuel: 0, maintenance: 0 }
          ]);
        }

        // 3. Process Fuel Consumption by Vehicle (Pie Chart)
        if (expensesRes.data?.expenses) {
          const expensesList = expensesRes.data.expenses;
          const vehicleFuelMap = new Map();

          // Aggregate liters consumed per vehicle
          expensesList.forEach((exp: any) => {
            if (exp.vehicleId && exp.vehicleId.name) {
              const name = exp.vehicleId.name;
              const liters = exp.liters || 0;
              const current = vehicleFuelMap.get(name) || 0;
              vehicleFuelMap.set(name, current + liters);
            }
          });

          const mappedFuelData = Array.from(vehicleFuelMap.entries()).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(2))
          }));
          
          // Sort by highest consumption and grab top 5
          mappedFuelData.sort((a, b) => b.value - a.value);
          const topFuelData = mappedFuelData.slice(0, 5);

          if (topFuelData.length > 0) {
            setFuelData(topFuelData);
          } else {
            setFuelData([{ name: 'No Data', value: 1 }]);
          }
        }

        setError('');
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
            <p className="text-slate-500 mt-1">Deep dive into your fleet performance and financial metrics.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-500 mt-1">Deep dive into your fleet performance and financial metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2" title="Revenue vs Expenses" subtitle="Monthly financial overview">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="maintenance" name="Maintenance Cost" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fuel" name="Fuel Cost" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fuel Efficiency" subtitle="Consumption by vehicle">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fuelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {fuelData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}L</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Trip Cost', value: kpiStats.avgTripCost, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Fuel Cost / KM', value: kpiStats.fuelCostPerKm, icon: Fuel, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fleet ROI', value: kpiStats.fleetRoi, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Fleet Growth', value: kpiStats.fleetGrowth, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
