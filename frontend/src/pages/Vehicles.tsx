import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, Edit2, Trash2, X } from 'lucide-react';
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
    'available': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'on_trip': 'bg-blue-50 text-blue-700 border-blue-100',
    'in_shop': 'bg-amber-50 text-amber-700 border-amber-100',
    'retired': 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[status] || 'bg-slate-50 text-slate-600 border-slate-100')}>
      {displayStatus}
    </span>
  );
};

const VehicleModal = ({ isOpen, onClose, onSuccess, vehicle = null }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    vehicleType: 'truck',
    model: '',
    mileage: '',
    fuelLevel: '100',
    maxCapacityKg: '',
    acquisitionCost: '',
    status: 'available',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        licensePlate: vehicle.licenseplate || '',
        vehicleType: vehicle.vehicleType || 'truck',
        model: vehicle.model || '',
        mileage: vehicle.odometer?.toString() || '0',
        fuelLevel: vehicle.fuelLevel?.toString() || '100',
        maxCapacityKg: vehicle.maxCapacityKg?.toString() || '',
        acquisitionCost: vehicle.acquisitionCost?.toString() || '',
        status: vehicle.status || 'available',
      });
    } else {
      setFormData({
        name: '',
        licensePlate: '',
        vehicleType: 'truck',
        model: '',
        mileage: '',
        fuelLevel: '100',
        maxCapacityKg: '',
        acquisitionCost: '',
        status: 'available',
      });
    }
  }, [vehicle, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Vehicle name is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!formData.maxCapacityKg) newErrors.maxCapacityKg = 'Max capacity is required';
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
        licenseplate: formData.licensePlate,
        vehicleType: formData.vehicleType,
        model: formData.model,
        odometer: parseInt(formData.mileage) || 0,
        fuelLevel: parseInt(formData.fuelLevel) || 100,
        maxCapacityKg: parseInt(formData.maxCapacityKg),
        acquisitionCost: parseInt(formData.acquisitionCost) || 0,
        status: formData.status,
      };

      if (vehicle) {
        await fleetService.updateVehicle(vehicle._id, payload);
        toast.success('Vehicle updated successfully!');
      } else {
        await fleetService.createVehicle(payload);
        toast.success('Vehicle added successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Fleet Asset Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Vehicle Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Volvo FH16"
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                  errors.name ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                )}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">License Plate *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="ABC-1234"
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                  errors.licensePlate ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                )}
              />
              {errors.licensePlate && <p className="text-[10px] text-rose-500 font-medium">{errors.licensePlate}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Asset Type</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none bg-white"
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model Version"
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="Current ODO"
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Capacity (kg) *</label>
              <input
                type="number"
                name="maxCapacityKg"
                value={formData.maxCapacityKg}
                onChange={handleChange}
                placeholder="Max payload"
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                  errors.maxCapacityKg ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                )}
              />
              {errors.maxCapacityKg && <p className="text-[10px] text-rose-500 font-medium">{errors.maxCapacityKg}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Fuel Level (%)</label>
              <input
                type="number"
                name="fuelLevel"
                value={formData.fuelLevel}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none bg-white"
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="in_shop">In Shop</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Acquisition Cost ($)</label>
              <input
                type="number"
                name="acquisitionCost"
                value={formData.acquisitionCost}
                onChange={handleChange}
                placeholder="Purchase value"
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isFleetManager = user?.role === 'fleet_manager';
  const isFinancialAnalyst = user?.role === 'financial_analyst';

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fleetService.getVehicles({ 
        status: statusFilter || undefined,
        type: typeFilter || undefined
      });
      setVehicles(response.data.vehicles || response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, typeFilter]);

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
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Vehicles</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your entire vehicle registry.</p>
        </div>
        {isFleetManager && (
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-md">
            <Plus size={16} />
            Add Vehicle
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
          <div className="p-4 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {['', 'available', 'on_trip', 'in_shop', 'retired'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap border",
                      statusFilter === status
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'All Status'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 w-full sm:w-64 border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or plate..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Truck size={16} />
                    {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'All Types'}
                  </button>

                  {isTypeFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                      {['', 'truck', 'van', 'bike'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setTypeFilter(type);
                            setIsTypeFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50",
                            typeFilter === type ? "text-primary font-bold bg-primary/5" : "text-slate-600"
                          )}
                        >
                          {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All Types'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            {vehicles.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plate</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Odometer</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    {isFinancialAnalyst && <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Value</th>}
                    {isFleetManager && <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.filter(v =>
                    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (v.licenseplate && v.licenseplate.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                            <Truck size={18} className="text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{vehicle.name}</p>
                            <p className="text-xs text-slate-500">{vehicle._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-slate-700">{vehicle.licenseplate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{vehicle.vehicleType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{vehicle.odometer?.toLocaleString() || 0} km</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                vehicle.fuelLevel > 50 ? "bg-emerald-500" : vehicle.fuelLevel > 20 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500">{vehicle.fuelLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      {isFinancialAnalyst && (
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">${vehicle.acquisitionCost?.toLocaleString() || '0'}</span>
                        </td>
                      )}
                      {isFleetManager && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm({ isOpen: true, id: vehicle._id })}
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
                <p>No vehicles found</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {vehicles.filter(v =>
              v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (v.licenseplate && v.licenseplate.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length > 0 ? (
              vehicles.filter(v =>
                v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.licenseplate && v.licenseplate.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((vehicle) => (
                <div key={vehicle._id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Truck size={18} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{vehicle.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 uppercase">{vehicle.licenseplate}</p>
                      </div>
                    </div>
                    <StatusBadge status={vehicle.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Odometer</p>
                      <p className="text-sm font-medium text-slate-700">{vehicle.odometer?.toLocaleString() || 0} km</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Level</p>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              vehicle.fuelLevel > 50 ? "bg-emerald-500" : vehicle.fuelLevel > 20 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{vehicle.fuelLevel}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Type</p>
                      <p className="text-sm font-medium text-slate-700 capitalize">{vehicle.vehicleType}</p>
                    </div>
                    {isFinancialAnalyst && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Value</p>
                        <p className="text-sm font-bold text-emerald-600">${vehicle.acquisitionCost?.toLocaleString() || '0'}</p>
                      </div>
                    )}
                  </div>

                  {isFleetManager && (
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl active:bg-slate-200 transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ isOpen: true, id: vehicle._id })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl active:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No vehicles found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={fetchVehicles}
        vehicle={selectedVehicle}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={async () => {
          if (!deleteConfirm.id) return;
          try {
            await fleetService.deleteVehicle(deleteConfirm.id);
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
          } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete vehicle');
          }
        }}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This will permanently remove it from the fleet records."
        confirmText="Delete Vehicle"
        type="danger"
      />
    </motion.div>
  );
}
