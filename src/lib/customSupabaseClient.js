import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shprfkwdeosdcuboeygh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocHJma3dkZW9zZGN1Ym9leWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzE4OTUsImV4cCI6MjA2NTg0Nzg5NX0.8HSlNc5SyGi6tUpOBCEKgHdVw1Ro0qHmTlLEklfIUKc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);