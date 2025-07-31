import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // Ensure the request is a POST method
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  try {
    const { email, auth_user_id } = await req.json();
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
    if (!auth_user_id || typeof auth_user_id !== 'string') {
      return new Response(JSON.stringify({
        error: 'Invalid auth_user_id'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { error } = await supabaseClient.from('users').update({
      'auth_user_id': auth_user_id
    }).eq('email', email);
    if (error) {
      console.log('error: ', error);
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
    console.log('success!');
    return new Response(JSON.stringify({
      success: true
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
