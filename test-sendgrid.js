// Simple test function to call the edge function and see detailed response
// Run this in the browser console on your admin page

async function testSendGridConfiguration() {
  console.log('🧪 Testing SendGrid configuration...');
  
  try {
    const { supabaseAdmin } = await import('/src/integrations/supabase/admin-client.ts');
    
    console.log('Calling send-email-notification function...');
    const { data, error } = await supabaseAdmin.functions.invoke('send-email-notification', {
      body: {
        userId: null, // Use null to trigger fallback email
        title: 'SendGrid Configuration Test',
        message: 'This is a test to check if SendGrid is properly configured.',
        type: 'test',
        data: {
          fallbackEmail: 'einar.private@gmail.com',
          isApproved: true,
          userName: 'Test User'
        }
      }
    });
    
    console.log('📧 Function response:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('❌ Error calling function:', error);
    } else if (data && data.success) {
      console.log('✅ Function returned success:', data.message);
    } else {
      console.log('⚠️ Function completed but success is unclear:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Also create a function to test admin client initialization
async function testAdminClient() {
  console.log('🔧 Testing admin client...');
  try {
    const { supabaseAdmin } = await import('/src/integrations/supabase/admin-client.ts');
    console.log('✅ Admin client imported successfully');
    
    // Test a simple database operation
    const result = await supabaseAdmin.from('profiles').select('id').limit(1);
    console.log('Database test result:', result);
    
  } catch (error) {
    console.error('❌ Admin client test failed:', error);
  }
}

console.log('📋 SendGrid test functions loaded.');
console.log('Run: testSendGridConfiguration() - to test email function');
console.log('Run: testAdminClient() - to test admin client'); 