import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // Validate request method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({
        error: 'Invalid email'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data, error } = await supabase.from('users').select('auth_user_id').eq('email', email).single();
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    const isMigratingUser = !!data && data.auth_user_id === null;
    return new Response(JSON.stringify({
      isMigratingUser
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
