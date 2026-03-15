import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Search, Filter, Edit2, Trash2, Calendar, DollarSign, Truck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fleetService } from '../services/api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ExpenseModal = ({ isOpen, onClose, onSuccess, expense = null }: any) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: '',
    odometerReading: '',
    notes: '',
    status: 'pending',
    taxDeductible: false,
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicleId: expense.vehicleId?._id || expense.vehicleId || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        liters: expense.liters?.toString() || '',
        cost: expense.cost?.toString() || '',
        odometerReading: expense.odometerReading?.toString() || '',
        notes: expense.notes || '',
        status: expense.status || 'pending',
        taxDeductible: expense.taxDeductible || false,
      });
    } else {
      setFormData({
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        liters: '',
        cost: '',
        odometerReading: '',
        notes: '',
        status: 'pending',
        taxDeductible: false,
      });
    }
  }, [expense, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await fleetService.getVehicles();
      setVehicles(response.data.vehicles || response.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!formData.liters || isNaN(Number(formData.liters)) || Number(formData.liters) <= 0) newErrors.liters = 'Valid liters required';
    if (!formData.cost || isNaN(Number(formData.cost)) || Number(formData.cost) <= 0) newErrors.cost = 'Valid cost required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: formData.vehicleId,
        date: formData.date,
        liters: Number(formData.liters),
        cost: Number(formData.cost),
        odometerReading: Number(formData.odometerReading) || 0,
        notes: formData.notes,
        status: formData.status,
        taxDeductible: formData.taxDeductible,
      };

      if (expense) {
        await fleetService.updateFuelExpense(expense._id, payload);
        toast.success('Expense record updated!');
      } else {
        await fleetService.createFuelExpense(payload);
        toast.success('Fuel expense record added!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{expense ? 'Edit Fuel Expense' : 'Add Fuel Expense'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Vehicle *</label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className={cn(
                "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                errors.vehicleId ? "border-rose-500" : "border-slate-200"
              )}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.licenseplate})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Odometer Reading</label>
              <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} placeholder="Reading in KM" className="w-full px-4 py-2 rounded-lg border border-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Liters *</label>
              <input type="number" name="liters" value={formData.liters} onChange={handleChange} placeholder="0.00" className={cn("w-full px-4 py-2 rounded-lg border", errors.liters ? "border-rose-500" : "border-slate-200")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Cost ($) *</label>
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="0.00" className={cn("w-full px-4 py-2 rounded-lg border", errors.cost ? "border-rose-500" : "border-slate-200")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Audit Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                <option value="pending">Pending</option>
                <option value="audited">Audited</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input 
                type="checkbox" 
                id="taxDeductible" 
                name="taxDeductible" 
                checked={formData.taxDeductible} 
                onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))} 
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <label htmlFor="taxDeductible" className="text-sm font-semibold text-slate-900">Tax Deductible</label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-lg border border-slate-200 resize-none" placeholder="Add any details..." />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function FuelExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const { user } = useAuth();
  
  const isFinancialAnalyst = user?.role === 'financial_analyst';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        fleetService.getFuelExpenses(),
        fleetService.getFleetExpenseSummary()
      ]);
      setExpenses(expensesRes.data.expenses || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fleetService.deleteFuelExpense(id);
      toast.success('Record deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fuel & Expenses</h1>
          <p className="text-slate-500 mt-1">Track fuel consumption and operational costs across the fleet.</p>
        </div>
        {isFinancialAnalyst && (
          <button onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-opacity">
            <Plus size={18} />
            Add Expense
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Fuel size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Liters</p>
                <h3 className="text-2xl font-bold text-slate-900">{summary?.totalLiters?.toLocaleString() || 0} L</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Fuel Cost</p>
                <h3 className="text-2xl font-bold text-slate-900">${summary?.totalFuelCost?.toLocaleString() || 0}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Truck size={24} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Vehicles</p>
                <h3 className="text-2xl font-bold text-slate-900">{summary?.vehicleCount || 0}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Fuel Transactions</h3>
            </div>
            <div className="hidden md:block overflow-x-auto">
              {expenses.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tax</th>
                      {isFinancialAnalyst && <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-900">{exp.vehicleId?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{exp.liters} L</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">${exp.cost}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            exp.status === 'audited' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            exp.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {exp.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {exp.taxDeductible ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                              <DollarSign size={10} /> TAX LOG
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">NON-TAX</span>
                          )}
                        </td>
                        {isFinancialAnalyst && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setSelectedExpense(exp); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary"><Edit2 size={16} /></button>
                              <button onClick={() => setDeleteConfirm({ isOpen: true, id: exp._id })} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-500">No expense logs available</div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <div key={exp._id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{exp.vehicleId?.name || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        exp.status === 'audited' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        exp.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {exp.status || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                        <p className="text-sm font-medium text-slate-700">{exp.liters} Liters</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
                        <p className="text-sm font-black text-slate-900">${exp.cost}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax Status</p>
                        {exp.taxDeductible ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <DollarSign size={10} /> ELIGIBLE FOR TAX DEDUCTION
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">NOT TAX DEDUCTIBLE</span>
                        )}
                      </div>
                    </div>

                    {isFinancialAnalyst && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => { setSelectedExpense(exp); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => setDeleteConfirm({ isOpen: true, id: exp._id })} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl">
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">No expense logs available</div>
              )}
            </div>
          </div>
        </>
      )}

      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} expense={selectedExpense} />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, id: null })} onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)} title="Delete Record" message="Permanently remove this fuel record?" confirmText="Delete" type="danger" />
    </motion.div>
  );
}
