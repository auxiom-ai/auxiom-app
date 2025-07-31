import { SQSClient, SendMessageCommand } from 'npm:@aws-sdk/client-sqs';
Deno.serve(async (req)=>{
  // Validate request
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  // Parse request body
  const { userId, keywords } = await req.json();
  // Validate inputs
  if (!userId || !Array.isArray(keywords) || keywords.length === 0) {
    return new Response(JSON.stringify({
      error: 'Invalid input. Requires userId and non-empty keywords array.'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  // Configure AWS SQS Client
  const sqs = new SQSClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
      secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
    }
  });
  // Prepare SQS message
  const messageBody = JSON.stringify({
    action: "e_represent_user",
    payload: {
      user_id: userId,
      keywords: keywords
    }
  });
  try {
    // Send message to SQS
    await sqs.send(new SendMessageCommand({
      QueueUrl: Deno.env.get('SQS_URL'),
      MessageBody: messageBody
    }));
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error sending SQS message:", error);
    return new Response(JSON.stringify({
      error: "Failed to send keywords to SQS.",
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
