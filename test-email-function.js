const testEmailFunction = async () => {
  try {
    const response = await fetch('https://vvwkuqnotnilsbcswfqu.supabase.co/functions/v1/send-email-notification', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2t1cW5vdG5pbHNiY3N3ZnF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY3NjI0MCwiZXhwIjoyMDQ5MjUyMjQwfQ.jUrJ7rKRQUjQdEHk5sQV_4NJc3W9J7kcjPaVBUEBrB4',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '01f60769-4786-4dc0-8c33-35c55c7e9406',
        title: 'Test notification from script',
        message: 'This is a test message to check email delivery',
        type: 'message',
        data: { test: true }
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (!response.ok) {
      console.error('Function call failed:', result);
    } else {
      console.log('Function call successful:', result);
    }
  } catch (error) {
    console.error('Error testing function:', error);
  }
};

testEmailFunction(); 