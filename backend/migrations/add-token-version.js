/**
 * Migration: Add tokenVersion field to existing users
 * 
 * This migration adds the tokenVersion field (default: 0) to all existing
 * users in the database. This field is required for the token revocation
 * security feature.
 * 
 * Run with: node migrations/add-token-version.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function migrate() {
  try {
    console.log('🔄 Starting migration: add-token-version');
    console.log('📡 Connecting to database...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find users without tokenVersion field
    const usersWithoutVersion = await User.countDocuments({ 
      tokenVersion: { $exists: false } 
    });

    console.log(`📊 Found ${usersWithoutVersion} users without tokenVersion field`);

    if (usersWithoutVersion === 0) {
      console.log('✅ All users already have tokenVersion field. Nothing to do.');
      await mongoose.disconnect();
      return;
    }

    // Add tokenVersion field to users that don't have it
    const result = await User.updateMany(
      { tokenVersion: { $exists: false } },
      { $set: { tokenVersion: 0 } }
    );

    console.log(`✅ Migration completed successfully`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Modified: ${result.modifiedCount} users`);

    // Verify migration
    const totalUsers = await User.countDocuments();
    const usersWithVersion = await User.countDocuments({ 
      tokenVersion: { $exists: true } 
    });

    console.log(`\n📊 Verification:`);
    console.log(`   - Total users: ${totalUsers}`);
    console.log(`   - Users with tokenVersion: ${usersWithVersion}`);

    if (totalUsers === usersWithVersion) {
      console.log('✅ All users now have tokenVersion field');
    } else {
      console.warn('⚠️  Warning: Some users still missing tokenVersion field');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from database');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
