
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// We need the service role key to query pg_policies usually, or just try with anon if it works (unlikely for system catalogs).
// But wait, I don't have the service role key in env vars usually.
// Let's try to use the anon key and see if we can query via rpc if available, or just try to query the table directly to see if it fails.

// Actually, I can't query pg_policies with anon key usually.

// However, I can try to reproduce the error with a simple query.
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function test() {
  console.log('Testing users table access...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Error selecting users:', error);
  } else {
    console.log('Success selecting users:', data);
  }

  console.log('Testing update...');
  // We need a user session to test update properly, which is hard here.
  // But the error 42P17 might happen even on select if the recursive policy is on select.
}

test();
