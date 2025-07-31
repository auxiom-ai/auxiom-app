import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // Ensure the request is a POST method
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    // First get the token from the Authorization header
    const token = req.headers.get('Authorization').replace('Bearer ', '');
    // Now we can get the session or user object
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    const { error } = await supabaseClient.auth.admin.deleteUser(user.id);
    if (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Success response
    return new Response(JSON.stringify({
      message: 'User deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Internal Server Error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
