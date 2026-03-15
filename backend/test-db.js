import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

dns.setServers(['1.1.1.1', '8.8.8.8']); // Using manual DNS to test Atlas resolution

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri);
  
  try {
    console.log('Resolving host...');
    const host = uri.split('@')[1].split('/')[0].split('?')[0];
    const addresses = await dns.promises.resolve(host, 'SRV').catch(err => {
        console.log('SRV resolve failed, trying A record...');
        return dns.promises.resolve(host);
    });
    console.log('Resolved addresses:', addresses);

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
