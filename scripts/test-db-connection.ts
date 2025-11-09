import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/supabase-types';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing database connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

// Create client without PgBouncer first
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
      console.error('❌ Connection error:', error);
      return;
    }

    console.log('✅ Basic connection successful');
    console.log('Sample data:', data);

    // Test table existence
    console.log('\n2. Testing table existence...');
    const tables = ['profiles', 'games', 'skus', 'orders'];

    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table as any)
        .select('*')
        .limit(1);

      if (tableError) {
        console.error(`❌ Table ${table} error:`, tableError);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    }

    // Test insert
    console.log('\n3. Testing insert...');
    const testProfile = {
      id: 'test-123',
      role: 'USER' as const,
      merchant_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);

      // Try with service role bypass
      console.log('\n4. Trying with service role admin...');
      const supabaseAdmin = createClient<Database>(
        supabaseUrl.replace('.supabase.co', '.supabase.co/admin/v1'),
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('profiles')
        .insert(testProfile)
        .select();

      if (adminError) {
        console.error('❌ Admin insert error:', adminError);
      } else {
        console.log('✅ Admin insert successful:', adminData);
      }
    } else {
      console.log('✅ Insert successful:', insertData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();