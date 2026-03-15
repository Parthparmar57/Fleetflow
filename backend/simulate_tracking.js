import axios from 'axios';

const TRIP_ID = process.argv[2]; // Pass MongoDB ID of a dispatched trip
const API_URL = 'http://localhost:5000/api/trips';

if (!TRIP_ID) {
  console.log('Usage: node simulate_tracking.js <TRIP_MONGODB_ID>');
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function simulate() {
  console.log(`🚀 Starting simulation for trip ${TRIP_ID}`);
  
  // NYC to Philly approximate path
  const points = [
    { lat: 40.7128, lng: -74.0060, addr: 'New York, NY' },
    { lat: 40.6501, lng: -74.1724, addr: 'Newark, NJ' },
    { lat: 40.5247, lng: -74.3854, addr: 'Edison, NJ' },
    { lat: 40.2206, lng: -74.7597, addr: 'Trenton, NJ' },
    { lat: 40.0150, lng: -74.9650, addr: 'Bensalem, PA' },
    { lat: 39.9526, lng: -75.1652, addr: 'Philadelphia, PA' },
  ];

  for (const point of points) {
    try {
      console.log(`📍 Moving to ${point.addr}...`);
      await axios.post(`${API_URL}/${TRIP_ID}/location`, {
        lat: point.lat,
        lng: point.lng,
        address: point.addr
      });
      console.log('✅ Update sent');
    } catch (error) {
      console.error('❌ Error sending update:', error.response?.data || error.message);
    }
    await sleep(3000);
  }
  
  console.log('🏁 Simulation complete');
}

simulate();
