import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { email } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Send the confirmation email using Supabase's email service
    const { error } = await supabaseClient.auth.admin.sendRawEmail({
      to: email,
      subject: 'Password Reset Confirmation',
      html: `
        <h1>Password Reset Successful</h1>
        <p>Your password has been successfully reset.</p>
        <p>If you did not request this password reset, please contact support immediately.</p>
        <p>Best regards,<br>Your App Team</p>
      `,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Confirmation email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 