import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Package,
  Activity
} from 'lucide-react';
import { fleetService, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';

// Fix for default marker icons in Leaflet with Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Truck Icon
const truckIcon = L.divIcon({
  html: `<div class="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.035-2.735A1 1 0 0 0 18.06 9H15"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
        </div>`,
  className: 'custom-truck-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to recenter map when location changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export default function TripTracking() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [history, setHistory] = useState<[number, number][]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fleetService.getTrip(id!);
        const tripData = response.data.trip;
        setTrip(tripData);
        
        if (tripData.currentLocation) {
          setCurrentPos([tripData.currentLocation.lat, tripData.currentLocation.lng]);
        } else {
          // Fallback to origin or a default center
          setCurrentPos([40.7128, -74.0060]); // NYC fallback
        }

        if (tripData.trackingHistory) {
          setHistory(tripData.trackingHistory.map((h: any) => [h.lat, h.lng]));
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();

    // Setup Socket.io
    const socketSession = io(SOCKET_URL);
    socketRef.current = socketSession;

    socketSession.on('connect', () => {
      socketSession.emit('join_trip', id);
    });

    socketSession.on('location_update', (data: any) => {
      const newPos: [number, number] = [data.location.lat, data.location.lng];
      setCurrentPos(newPos);
      setHistory(prev => [...prev, newPos]);
    });

    return () => {
      socketSession.emit('leave_trip', id);
      socketSession.disconnect();
    };
  }, [id]);

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/trips" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Tracking: {trip?.tripId}</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${trip?.status === 'dispatched' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              Status: <span className="capitalize font-medium text-slate-700">{trip?.status}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map View */}
        <div className="lg:col-span-3 h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden z-0">
          {currentPos && (
            <MapContainer center={currentPos} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={currentPos} icon={truckIcon}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-800">{trip?.vehicleId?.name}</p>
                    <p className="text-xs text-slate-500">{trip?.vehicleId?.licenseplate}</p>
                  </div>
                </Popup>
              </Marker>
              {history.length > 1 && (
                <Polyline positions={history} color="#6366f1" weight={4} opacity={0.6} dashArray="10, 10" />
              )}
              <RecenterMap position={currentPos} />
            </MapContainer>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Trip Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vehicle</p>
                  <p className="text-sm font-bold text-slate-800">{trip?.vehicleId?.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{trip?.vehicleId?.licenseplate}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Driver</p>
                  <p className="text-sm font-bold text-slate-800">{trip?.driverId?.name}</p>
                  <p className="text-xs text-slate-500">ID: {trip?.driverId?.licenseNumber}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cargo</p>
                  <p className="text-sm font-bold text-slate-800">{trip?.cargoWeight} kg</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex gap-3 mb-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
                    <div className="w-px h-full bg-slate-200 my-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="space-y-4 -mt-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Origin</p>
                      <p className="text-sm font-bold text-slate-800">{trip?.originLocation}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
                      <p className="text-sm font-bold text-slate-800">{trip?.destinationLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                <Navigation size={18} />
                Open in Google Maps
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full translate-x-12 -translate-y-12"></div>
            <div className="relative z-10">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Time Elapsed</p>
              <h4 className="text-2xl font-bold flex items-center gap-2">
                <Clock size={24} />
                02:45:12
              </h4>
              <p className="text-indigo-100 text-xs mt-4">Estimated arrival at 04:30 PM</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
