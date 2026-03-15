import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit2, Trash2, Mail, Phone, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fleetService } from '../services/api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'on_leave': 'bg-amber-50 text-amber-700 border-amber-100',
    'inactive': 'bg-slate-50 text-slate-600 border-slate-100',
    'on_duty': 'bg-blue-50 text-blue-700 border-blue-100',
    'off_duty': 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[status] || 'bg-slate-50 text-slate-600 border-slate-100')}>
      {displayStatus}
    </span>
  );
};

const DriverModal = ({ isOpen, onClose, onSuccess, initialData = null }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategory: 'truck',
    phone: '',
    status: 'off_duty',
    safetyScore: '100',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        licenseNumber: initialData.licenseNumber || '',
        licenseExpiry: initialData.licenseExpiry ? new Date(initialData.licenseExpiry).toISOString().split('T')[0] : '',
        licenseCategory: initialData.licenseCategory || 'truck',
        phone: initialData.phone || '',
        status: initialData.status || 'off_duty',
        safetyScore: initialData.safetyScore?.toString() || '100',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        licenseNumber: '',
        licenseExpiry: '',
        licenseCategory: 'truck',
        phone: '',
        status: 'off_duty',
        safetyScore: '100',
      });
    }
  }, [initialData, isOpen]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
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
        name: formData.name,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        licenseCategory: formData.licenseCategory,
        phone: formData.phone,
        status: formData.status,
        safetyScore: parseInt(formData.safetyScore) || 100,
      };

      if (initialData) {
        await fleetService.updateDriver(initialData._id, payload);
        toast.success('Driver updated successfully!');
      } else {
        await fleetService.createDriver(payload);
        toast.success('Driver added successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save driver');
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
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Driver' : 'Add New Driver'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                  errors.name ? "border-rose-500" : "border-slate-200"
                )}
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                  errors.email ? "border-rose-500" : "border-slate-200"
                )}
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                  errors.phone ? "border-rose-500" : "border-slate-200"
                )}
              />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">License Number *</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="DL-12345678"
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                  errors.licenseNumber ? "border-rose-500" : "border-slate-200"
                )}
              />
              {errors.licenseNumber && <p className="text-xs text-rose-500">{errors.licenseNumber}</p>}
            </div>

            {/* License Expiry */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">License Expiry Date *</label>
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all",
                  errors.licenseExpiry ? "border-rose-500" : "border-slate-200"
                )}
              />
              {errors.licenseExpiry && <p className="text-xs text-rose-500">{errors.licenseExpiry}</p>}
            </div>

            {/* License Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">License Category</label>
              <select
                name="licenseCategory"
                value={formData.licenseCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              >
                <option value="off_duty">Off Duty</option>
                <option value="on_duty">On Duty</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Safety Score */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Safety Score (0-100)</label>
              <input
                type="number"
                name="safetyScore"
                value={formData.safetyScore}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Driver' : 'Add Driver')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const { user } = useAuth();
  const location = useLocation();

  const isSafetyOfficer = user?.role === 'safety_officer';

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fleetService.getDrivers();
      setDrivers(response.data.drivers || response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load drivers');
      console.error('Error fetching drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fleetService.deleteDriver(id);
      toast.success('Driver deleted successfully');
      fetchDrivers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete driver');
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      // Clean up state after opening modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Drivers</h1>
          <p className="text-slate-500 mt-1">Track driver performance, compliance, and safety.</p>
        </div>
        {isSafetyOfficer && (
          <button
            onClick={() => {
              setSelectedDriver(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-md">
            <Plus size={16} />
            Add Driver
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 w-full sm:w-96 border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all origin-left"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_duty">On Duty</option>
                <option value="off_duty">Off Duty</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            {drivers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">License</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Score</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    {isSafetyOfficer && <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers
                    .filter(d => {
                      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          d.email.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((driver) => (
                    <tr key={driver._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt="" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail size={12} className="text-slate-400" />
                            {driver.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone size={12} className="text-slate-400" />
                            {driver.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{driver.licenseCategory || driver.licenseNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{driver.tripCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                driver.safetyScore > 90 ? "bg-emerald-500" : driver.safetyScore > 80 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${driver.safetyScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{driver.safetyScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={driver.status} />
                      </td>
                      {isSafetyOfficer && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedDriver(driver);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm({ isOpen: true, id: driver._id })}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No drivers found</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {drivers
              .filter(d => {
                const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    d.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).length > 0 ? (
              drivers
                .filter(d => {
                  const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      d.email.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((driver) => (
                  <div key={driver._id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{driver._id}</p>
                        </div>
                      </div>
                      <StatusBadge status={driver.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail size={12} className="text-slate-400" />
                            <span className="truncate max-w-[120px]">{driver.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone size={12} className="text-slate-400" />
                            <span>{driver.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                driver.safetyScore > 90 ? "bg-emerald-500" : driver.safetyScore > 80 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${driver.safetyScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">{driver.safetyScore}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">License</p>
                        <p className="text-sm font-medium text-slate-700 capitalize">{driver.licenseCategory}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trips Completed</p>
                        <p className="text-sm font-bold text-slate-700">{driver.tripCount || 0}</p>
                      </div>
                    </div>

                    {isSafetyOfficer && (
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: driver._id })}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No drivers found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDriver(null);
        }}
        onSuccess={fetchDrivers}
        initialData={selectedDriver}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        title="Remove Driver"
        message="Are you sure you want to remove this driver from the system? This action cannot be undone and will affect their trip history."
        confirmText="Remove Driver"
        type="danger"
      />
    </motion.div>
  );
}
