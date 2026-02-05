import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './test-user';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env\n' +
      'Get the secret key from: Supabase Dashboard → Settings → API'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const exists = existing?.users.some((u) => u.email === TEST_USER_EMAIL);

  if (exists) {
    console.log(`Test user ${TEST_USER_EMAIL} already exists — skipping.`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('Failed to create test user:', error.message);
    process.exit(1);
  }

  console.log(`Created test user: ${TEST_USER_EMAIL}`);
}

main();
