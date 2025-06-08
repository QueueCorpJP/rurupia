// Test script for email notification system
// Run this in browser console to test the email notification flow

const testEmailNotification = async () => {
  console.log('🧪 Testing Email Notification System...');
  
  try {
    // Import the notification service
    const { sendMessageNotification } = await import('./src/utils/notification-service.ts');
    
    // Test with sample data (replace with actual user IDs from your database)
    const testUserId = '01f60769-4786-4dc0-8c33-35c55c7e9406'; // therapist たけし
    const testFromUser = 'テストユーザー';
    const testMessage = 'これはテストメッセージです';
    
    console.log('📧 Sending test notification...');
    
    const result = await sendMessageNotification(testUserId, testFromUser, testMessage);
    
    console.log('✅ Notification result:', result);
    
    // If successful, you should see in the console:
    // 1. "Sending message notification to user..."
    // 2. "Should send email for message notification: true"  
    // 3. "Email notification function response: { success: true }"
    
    // And in Supabase Edge Function logs:
    // === EMAIL NOTIFICATION ===
    // To: user@example.com
    // Subject: 新しいメッセージが届きました
    // Message: テストユーザーさんからメッセージが届きました: これはテストメッセージです
    // Type: message
    // ========================
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Instructions:
// 1. Open browser console on your app
// 2. Copy and paste this function
// 3. Run: testEmailNotification()
// 4. Check console output and Supabase Edge Function logs

console.log('📋 Email notification test script loaded. Run: testEmailNotification()'); 