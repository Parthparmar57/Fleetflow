import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Clock, ChevronRight, User, Truck, X, Edit2, Navigation, Trash2, AlertCircle } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
    'dispatched': 'bg-blue-50 text-blue-700 border-blue-100',
    'in_transit': 'bg-blue-50 text-blue-700 border-blue-100',
    'completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'delayed': 'bg-rose-50 text-rose-700 border-rose-100',
    'cancelled': 'bg-slate-50 text-slate-600 border-slate-100',
    'draft': 'bg-slate-50 text-slate-600 border-slate-100',
    'scheduled': 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[status] || 'bg-slate-50 text-slate-600 border-slate-100')}>
      {displayStatus}
    </span>
  );
};

const TripModal = ({ isOpen, onClose, onSuccess, initialData = null }: any) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    originLocation: '',
    destinationLocation: '',
    cargoWeight: '',
    status: 'draft',
  });
  const { user } = useAuth();
  const isFleetManager = user?.role === 'fleet_manager';

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: initialData.vehicleId?._id || initialData.vehicleId || '',
        driverId: initialData.driverId?._id || initialData.driverId || '',
        originLocation: initialData.originLocation || '',
        destinationLocation: initialData.destinationLocation || '',
        cargoWeight: initialData.cargoWeight?.toString() || '',
        status: initialData.status || 'draft',
      });
    } else {
      setFormData({
        vehicleId: '',
        driverId: '',
        originLocation: '',
        destinationLocation: '',
        cargoWeight: '',
        status: 'draft',
      });
    }
  }, [initialData, isOpen]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      fetchVehiclesAndDrivers();
    }
  }, [isOpen]);

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        fleetService.getVehicles(),
        fleetService.getDrivers(),
      ]);
      setVehicles(vehiclesRes.data.vehicles || vehiclesRes.data || []);
      setDrivers(driversRes.data.drivers || driversRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load vehicles and drivers');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!formData.driverId) newErrors.driverId = 'Driver is required';
    if (!formData.originLocation.trim()) newErrors.originLocation = 'Origin is required';
    if (!formData.destinationLocation.trim()) newErrors.destinationLocation = 'Destination is required';
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
      if (initialData) {
        await fleetService.updateTrip(initialData._id, {
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          originLocation: formData.originLocation,
          destinationLocation: formData.destinationLocation,
          cargoWeight: parseInt(formData.cargoWeight) || 0,
        });
        toast.success('Trip updated successfully!');
      } else {
        await fleetService.createTrip({
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          originLocation: formData.originLocation,
          destinationLocation: formData.destinationLocation,
          cargoWeight: parseInt(formData.cargoWeight) || 0,
          status: formData.status,
        });
        toast.success('Trip created successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save trip');
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
            <h2 className="text-lg font-bold text-slate-900">{initialData ? 'Edit Trip' : 'Create New Trip'}</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Assignment Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {/* Vehicle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Vehicle *</label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none bg-white",
                  errors.vehicleId ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                )}
              >
                <option value="">Select Vehicle</option>
                {vehicles.sort((a, b) => (a.status === 'available' ? -1 : 1)).map(v => (
                  <option key={v._id} value={v._id}>
                    {v.status === 'available' ? '🟢' : '🔴'} {v.name}
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="text-[10px] text-rose-500 font-medium">{errors.vehicleId}</p>}
            </div>

            {/* Driver */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Driver *</label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none bg-white",
                  errors.driverId ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                )}
              >
                <option value="">Select Driver</option>
                {drivers.sort((a, b) => (a.status === 'on_duty' ? -1 : 1)).map(d => (
                  <option key={d._id} value={d._id}>
                    {d.status === 'on_duty' ? '🟢' : '🔴'} {d.name}
                  </option>
                ))}
              </select>
              {errors.driverId && <p className="text-[10px] text-rose-500 font-medium">{errors.driverId}</p>}
            </div>

            {/* Origin */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Origin *</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="originLocation"
                  value={formData.originLocation}
                  onChange={handleChange}
                  placeholder="e.g. New York"
                  className={cn(
                    "w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                    errors.originLocation ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                  )}
                />
              </div>
              {errors.originLocation && <p className="text-[10px] text-rose-500 font-medium">{errors.originLocation}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Destination *</label>
              <div className="relative">
                <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={handleChange}
                  placeholder="e.g. Chicago"
                  className={cn(
                    "w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                    errors.destinationLocation ? "border-rose-500 bg-rose-50/50" : "border-slate-200"
                  )}
                />
              </div>
              {errors.destinationLocation && <p className="text-[10px] text-rose-500 font-medium">{errors.destinationLocation}</p>}
            </div>

            {/* Cargo Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Cargo (kg)</label>
              <input
                type="number"
                name="cargoWeight"
                value={formData.cargoWeight}
                onChange={handleChange}
                placeholder="Weight in kg"
                readOnly={isFleetManager}
                className={cn(
                  "w-full px-3 py-2 rounded-xl border text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all",
                  isFleetManager ? "bg-slate-50 opacity-70 border-slate-200" : "border-slate-200"
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border text-sm border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none bg-white"
              >
                <option value="draft">Draft</option>
                <option value="dispatched">Dispatched</option>
              </select>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditor = user?.role === 'fleet_manager' || user?.role === 'dispatcher';

  const handleDelete = async (id: string) => {
    try {
      await fleetService.deleteTrip(id);
      toast.success('Trip deleted successfully');
      fetchTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete trip');
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const response = await fleetService.getTrips();
      setTrips(response.data.trips || response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load trips');
      console.error('Error fetching trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      // Clean up state after opening modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const calculateProgress = (trip: any) => {
    if (trip.progress !== undefined) return trip.progress;
    if (trip.status === 'completed') return 100;
    if (trip.status === 'draft' || trip.status === 'scheduled') return 0;
    return 50; // Default for dispatched/in_transit
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Trips</h1>
          <p className="text-slate-500 mt-1">Monitor active assignments and schedule new routes.</p>
        </div>
        {isEditor && (
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-md text-nowrap">
            <Plus size={16} />
            New Trip
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.length > 0 ? (
            trips.map((trip) => {
              const progress = calculateProgress(trip);
              const etaTime = trip.eta ? formatTime(trip.eta) : 'TBD';

              return (
                <motion.div
                  key={trip._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group"
                >
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{trip.tripId}</span>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      {isEditor && trip.status === 'draft' && (
                        <button 
                          onClick={() => {
                            setEditingTrip(trip);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {isEditor && (trip.status === 'draft' || trip.status === 'cancelled') && (
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: trip._id })}
                          className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-0.5 h-8 bg-slate-100" />
                        <div className="w-2 h-2 rounded-full border-2 border-primary" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Origin</p>
                          <p className="text-sm font-semibold text-slate-900">{trip.originLocation}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</p>
                          <p className="text-sm font-semibold text-slate-900">{trip.destinationLocation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <Truck size={14} className="text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle</p>
                          <p className="text-xs font-semibold text-slate-700 truncate">{trip.vehicleId?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <User size={14} className="text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Driver</p>
                          <p className="text-xs font-semibold text-slate-700 truncate">{trip.driverId?.name || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Progress</span>
                        <span className="font-bold text-slate-900">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={cn(
                            "h-full rounded-full",
                            trip.status === 'delayed' ? 'bg-rose-500' : 'bg-primary'
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={14} />
                        <span>ETA: {etaTime}</span>
                      </div>
                      {trip.status === 'dispatched' && (
                        <Link 
                          to={`/app/trips/${trip._id}/track`}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Navigation size={12} />
                          Track Live
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center text-slate-500">
              <p>No trips found</p>
            </div>
          )}
        </div>
      )}

      <TripModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrip(null);
        }}
        onSuccess={fetchTrips}
        initialData={editingTrip}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete Trip"
        type="danger"
      />
    </motion.div>
  );
}
