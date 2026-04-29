import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Initialize Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const usersToCreate = [
  {
    email: 'doctor@test.com',
    password: 'password123',
    name: 'Dr. Prabhat Maurya',
    role: 'doctor', // Using user_role enum
  },
  {
    email: 'parent@test.com',
    password: 'password123',
    name: 'Sam Bahadur',
    role: 'parent', // Note: Corrected from 'doctor' based on the email context
  },
];

async function createUsers() {
  console.log('🚀 Starting user creation via Admin API...\n');

  for (const user of usersToCreate) {
    console.log(`Creating user: ${user.email} (${user.role})...`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: user.name,
        role: user.role,
      },
    });

    if (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`✅ Successfully created ${user.email}`);
      console.log(`   User ID: ${data.user.id}`);
    }
    console.log('--------------------------------------------------');
  }

  console.log('\n🎉 Finished creating users.');
}

createUsers();
