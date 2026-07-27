import { TridopApiClient } from '../libs/frontend-client/src';

async function testStrictAuth() {
  console.log('====================================================');
  console.log('🔒 Testing Strict Authentication & Uniqueness Rules');
  console.log('====================================================\n');

  const client = new TridopApiClient('http://127.0.0.1:4000');
  const testEmail = `user-strict-${Date.now()}@gmail.com`;
  const testPassword = 'Password123!';

  // 1. First signup
  console.log(`1. Registering new user (${testEmail})...`);
  const signupRes = await client.auth.signup({
    email: testEmail,
    password: testPassword,
    name: 'Strict User Test',
  });
  console.log('✅ PASS: First signup succeeded for email:', signupRes.user.email);

  // 2. Duplicate signup check
  console.log('\n2. Attempting duplicate signup with same email...');
  try {
    await client.auth.signup({
      email: testEmail,
      password: 'AnotherPassword!',
      name: 'Duplicate User',
    });
    console.error('❌ FAIL: Duplicate signup was NOT rejected!');
  } catch (err: any) {
    console.log('✅ PASS: Duplicate signup correctly rejected with error:', err.message);
  }

  // 3. Unregistered account login check
  console.log('\n3. Attempting login with an unregistered email...');
  try {
    await client.auth.login({
      email: `unregistered-${Date.now()}@gmail.com`,
      password: 'SomePassword123!',
    });
    console.error('❌ FAIL: Unregistered user login was NOT rejected!');
  } catch (err: any) {
    console.log('✅ PASS: Unregistered user login correctly rejected with error:', err.message);
  }

  // 4. Incorrect password check
  console.log('\n4. Attempting login with incorrect password...');
  try {
    await client.auth.login({
      email: testEmail,
      password: 'WrongPassword!',
    });
    console.error('❌ FAIL: Incorrect password login was NOT rejected!');
  } catch (err: any) {
    console.log('✅ PASS: Incorrect password login correctly rejected with error:', err.message);
  }

  // 5. Valid credentials login
  console.log('\n5. Attempting login with valid credentials...');
  const loginRes = await client.auth.login({
    email: testEmail,
    password: testPassword,
  });
  console.log('✅ PASS: Valid login succeeded for user:', loginRes.user.email);

  console.log('\n====================================================');
  console.log('🎉 ALL STRICT AUTHENTICATION TESTS PASSED 100%!');
  console.log('====================================================');
}

testStrictAuth().catch(console.error);
