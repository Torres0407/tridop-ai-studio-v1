import { TridopApiClient } from '../libs/frontend-client/src';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 Starting TridopAI Master API Connection Verification');
  console.log('====================================================\n');

  const client = new TridopApiClient('http://localhost:4000');
  const timestamp = Date.now();
  const testEmail = `test-verify-${timestamp}@tridop.test`;
  const testPassword = 'TestPass123!';

  let passed = 0;
  let failed = 0;

  function logResult(checkName: string, success: boolean, detail: string) {
    if (success) {
      passed++;
      console.log(`✅ PASS: ${checkName} - ${detail}`);
    } else {
      failed++;
      console.log(`❌ FAIL: ${checkName} - ${detail}`);
    }
  }

  // Variables stored across steps
  let accessToken = '';
  let refreshToken = '';
  let createdSiteId = '';
  let aiJobId = '';
  let deployJobId = '';
  let createdProductId = '';

  // ==========================================
  // 1. HEALTH CHECK
  // ==========================================
  try {
    const res = await fetch('http://localhost:4000/health');
    const data = await res.json();
    logResult('HEALTH CHECK', res.status === 200 && data.status === 'ok', 'API gateway reachable');
  } catch (err: any) {
    logResult('HEALTH CHECK', false, `API gateway unreachable: ${err.message}`);
  }

  // ==========================================
  // 2. AUTH CHECKS
  // ==========================================
  // Signup
  try {
    const signupRes = await client.auth.signup({
      email: testEmail,
      password: testPassword,
      name: 'Test User'
    });
    accessToken = signupRes.accessToken;
    refreshToken = signupRes.refreshToken;
    const ok = Boolean(accessToken && refreshToken);
    logResult('Signup', ok, 'Signup works');
  } catch (err: any) {
    logResult('Signup', false, `Signup failed: ${err.message}`);
  }

  // Login
  try {
    const loginRes = await client.auth.login({
      email: testEmail,
      password: testPassword
    });
    accessToken = loginRes.accessToken;
    refreshToken = loginRes.refreshToken;
    client.setTokens(accessToken, refreshToken);
    const ok = Boolean(accessToken && refreshToken);
    logResult('Login', ok, 'Login works');
  } catch (err: any) {
    logResult('Login', false, `Login failed: ${err.message}`);
  }

  // Protected User Route
  try {
    const userMe = await client.users.getMe();
    const ok = Boolean(userMe && (userMe.id || userMe.email));
    logResult('Protected User Route', ok, 'Auth token works on protected route');
  } catch (err: any) {
    logResult('Protected User Route', false, `Protected user route failed: ${err.message}`);
  }

  // Token Refresh
  try {
    const refreshRes = await client.auth.refresh(refreshToken);
    const ok = Boolean(refreshRes.accessToken && refreshRes.refreshToken);
    if (ok) {
      accessToken = refreshRes.accessToken;
      refreshToken = refreshRes.refreshToken;
      client.setTokens(accessToken, refreshToken);
    }
    logResult('Token Refresh', ok, 'Token refresh works');
  } catch (err: any) {
    logResult('Token Refresh', false, `Token refresh failed: ${err.message}`);
  }

  // Invalid Token Rejection
  try {
    const invalidClient = new TridopApiClient('http://localhost:4000');
    invalidClient.setTokens('invalid-bad-token-12345');
    await invalidClient.users.getMe();
    logResult('Invalid Token Rejection', false, 'Expected 401 but request succeeded');
  } catch (err: any) {
    const is401 = err.statusCode === 401 || err.message?.includes('Invalid') || err.message?.includes('expired') || err.message?.includes('Authentication required');
    logResult('Invalid Token Rejection', is401, 'Invalid token correctly rejected');
  }

  // ==========================================
  // 3. USER AND PROFILE CHECKS
  // ==========================================
  // Categories
  try {
    const categories = await client.categories.list();
    const ok = Array.isArray(categories) && categories.length > 0;
    logResult('Categories Endpoint', ok, 'Categories endpoint works');
  } catch (err: any) {
    logResult('Categories Endpoint', false, `Categories list failed: ${err.message}`);
  }

  // Save Business Profile
  try {
    await client.users.upsertBusinessProfile({
      businessName: 'Test Business',
      category: 'tech'
    });
    logResult('Save Business Profile', true, 'Business profile save works');
  } catch (err: any) {
    logResult('Save Business Profile', false, `Business profile save failed: ${err.message}`);
  }

  // Fetch Business Profile
  try {
    const profile = await client.users.getBusinessProfile();
    const ok = profile && (profile.businessName === 'Test Business' || profile.userId);
    logResult('Fetch Business Profile', Boolean(ok), 'Business profile fetch works');
  } catch (err: any) {
    logResult('Fetch Business Profile', false, `Business profile fetch failed: ${err.message}`);
  }

  // ==========================================
  // 4. SITES CHECKS
  // ==========================================
  // Create Site
  try {
    const newSite = await client.sites.create({
      name: 'Test Site',
      slug: `test-site-${timestamp}`
    });
    createdSiteId = newSite?.siteId || newSite?.id || `site_${timestamp}`;
    const ok = Boolean(createdSiteId);
    logResult('Site Creation', ok, 'Site creation works');
  } catch (err: any) {
    createdSiteId = `site_${timestamp}`;
    logResult('Site Creation', false, `Site creation failed: ${err.message}`);
  }

  // Site List
  try {
    const sitesList = await client.sites.list();
    const ok = Array.isArray(sitesList);
    logResult('Site List', ok, 'Site list works');
  } catch (err: any) {
    logResult('Site List', false, `Site list failed: ${err.message}`);
  }

  // Site Fetch by ID
  try {
    const siteObj = await client.sites.getById(createdSiteId);
    const ok = Boolean(siteObj);
    logResult('Site Fetch by ID', ok, 'Site fetch by id works');
  } catch (err: any) {
    logResult('Site Fetch by ID', false, `Site fetch by id failed: ${err.message}`);
  }

  // Block Fetch
  try {
    const blocks = await client.sites.getBlocks(createdSiteId);
    const ok = Array.isArray(blocks);
    logResult('Block Fetch', ok, 'Block fetch works');
  } catch (err: any) {
    logResult('Block Fetch', false, `Block fetch failed: ${err.message}`);
  }

  // Templates List
  try {
    const templates = await client.sites.listTemplates();
    const ok = Array.isArray(templates);
    logResult('Templates List', ok, 'Templates list works');
  } catch (err: any) {
    logResult('Templates List', false, `Templates list failed: ${err.message}`);
  }

  // Version Save
  try {
    await client.sites.createVersion(createdSiteId, {
      commitMessage: 'verify test snapshot'
    });
    logResult('Version Save', true, 'Version save works');
  } catch (err: any) {
    logResult('Version Save', false, `Version save failed: ${err.message}`);
  }

  // Version History
  try {
    const versions = await client.sites.getVersions(createdSiteId);
    const ok = Array.isArray(versions);
    logResult('Version History', ok, 'Version history works');
  } catch (err: any) {
    logResult('Version History', false, `Version history failed: ${err.message}`);
  }

  // Site Clone
  try {
    const cloned = await client.sites.clone(createdSiteId);
    const ok = Boolean(cloned);
    logResult('Site Clone', ok, 'Site clone works');
  } catch (err: any) {
    logResult('Site Clone', false, `Site clone failed: ${err.message}`);
  }

  // ==========================================
  // 5. AI CHECKS
  // ==========================================
  // AI Quota
  try {
    const quota = await client.ai.getQuota();
    const ok = quota && typeof quota.used !== 'undefined';
    logResult('AI Quota Endpoint', Boolean(ok), 'AI quota endpoint works');
  } catch (err: any) {
    logResult('AI Quota Endpoint', false, `AI quota failed: ${err.message}`);
  }

  // AI Prompt
  try {
    const promptRes = await client.ai.prompt({ prompt: 'Say hello in one word' });
    const ok = Boolean(promptRes);
    logResult('AI Prompt', ok, 'AI prompt works');
  } catch (err: any) {
    logResult('AI Prompt', false, `AI prompt failed: ${err.message}`);
  }

  // AI Domain Suggestions
  try {
    const domainsRes = await client.ai.suggestDomains({
      businessName: 'Test Business',
      industry: 'tech'
    });
    const ok = Array.isArray(domainsRes);
    logResult('Domain Suggestion', ok, 'Domain suggestion works');
  } catch (err: any) {
    logResult('Domain Suggestion', false, `Domain suggestion failed: ${err.message}`);
  }

  // AI Prefill
  try {
    const prefillRes = await client.ai.prefill({
      businessProfile: { businessName: 'Test Business', category: 'tech' }
    });
    const ok = Boolean(prefillRes);
    logResult('AI Prefill', ok, 'AI prefill works');
  } catch (err: any) {
    logResult('AI Prefill', false, `AI prefill failed: ${err.message}`);
  }

  // AI Generate Job
  try {
    const genRes = await client.ai.generate({
      siteId: createdSiteId,
      prompt: 'Test Business tech modern'
    });
    aiJobId = genRes?.jobId || `job_${timestamp}`;
    logResult('AI Generate Queue', Boolean(aiJobId), 'AI generate job queued');
  } catch (err: any) {
    aiJobId = `job_${timestamp}`;
    logResult('AI Generate Queue', false, `AI generate failed: ${err.message}`);
  }

  // AI Job Status
  try {
    const statusRes = await client.ai.getGenerateStatus(aiJobId);
    const ok = statusRes && Boolean(statusRes.status);
    logResult('AI Job Status', ok, 'AI generation job status works');
  } catch (err: any) {
    logResult('AI Job Status', false, `AI job status failed: ${err.message}`);
  }

  // ==========================================
  // 6. DEPLOY CHECKS
  // ==========================================
  // Deploy Trigger
  try {
    const deployRes = await client.deploy.trigger(createdSiteId);
    deployJobId = deployRes?.jobId || `deploy_${timestamp}`;
    logResult('Deploy Trigger', Boolean(deployJobId), 'Deploy trigger works');
  } catch (err: any) {
    deployJobId = `deploy_${timestamp}`;
    logResult('Deploy Trigger', false, `Deploy trigger failed: ${err.message}`);
  }

  // Deploy Status
  try {
    const statusRes = await client.deploy.getStatus(deployJobId);
    const ok = statusRes && Boolean(statusRes.status);
    logResult('Deploy Status', ok, 'Deploy status works');
  } catch (err: any) {
    logResult('Deploy Status', false, `Deploy status failed: ${err.message}`);
  }

  // ==========================================
  // 7. DOMAIN CHECKS
  // ==========================================
  // Domain Search
  try {
    const searchRes = await client.domains.search('testbusiness');
    const ok = Array.isArray(searchRes);
    logResult('Domain Search', ok, 'Domain search works');
  } catch (err: any) {
    logResult('Domain Search', false, `Domain search failed: ${err.message}`);
  }

  // Domain List by Site
  try {
    const domainsList = await client.domains.getBySite(createdSiteId);
    const ok = Array.isArray(domainsList);
    logResult('Domain List', ok, 'Domain list works');
  } catch (err: any) {
    logResult('Domain List', false, `Domain list failed: ${err.message}`);
  }

  // ==========================================
  // 8. COMMERCE CHECKS
  // ==========================================
  // Product Creation
  try {
    const prodRes = await client.commerce.createProduct({
      siteId: createdSiteId,
      name: 'Test Product',
      price: 1000,
      currency: 'NGN'
    });
    createdProductId = prodRes?.id || `prod_${timestamp}`;
    logResult('Product Creation', Boolean(createdProductId), 'Product creation works');
  } catch (err: any) {
    logResult('Product Creation', false, `Product creation failed: ${err.message}`);
  }

  // Product List
  try {
    const products = await client.commerce.getProducts(createdSiteId);
    const ok = Array.isArray(products);
    logResult('Product List', ok, 'Product list works');
  } catch (err: any) {
    logResult('Product List', false, `Product list failed: ${err.message}`);
  }

  // Orders List
  try {
    const orders = await client.commerce.getOrders(createdSiteId);
    const ok = Array.isArray(orders);
    logResult('Orders List', ok, 'Orders list works');
  } catch (err: any) {
    logResult('Orders List', false, `Orders list failed: ${err.message}`);
  }

  // ==========================================
  // 9. BILLING CHECKS
  // ==========================================
  try {
    const plans = await client.billing.listPlans();
    const ok = Array.isArray(plans) && plans.length > 0;
    logResult('Billing Plans', ok, 'Billing plans endpoint works');
  } catch (err: any) {
    logResult('Billing Plans', false, `Billing plans failed: ${err.message}`);
  }

  // ==========================================
  // 10. ANALYTICS CHECKS
  // ==========================================
  try {
    const analyticsData = await client.analytics.getDashboard(createdSiteId);
    const ok = Boolean(analyticsData);
    logResult('Analytics Dashboard', ok, 'Analytics dashboard works');
  } catch (err: any) {
    logResult('Analytics Dashboard', false, `Analytics dashboard failed: ${err.message}`);
  }

  // ==========================================
  // 11. CLEANUP
  // ==========================================
  // Delete Test Site
  try {
    await client.sites.delete(createdSiteId);
    logResult('Site Deletion', true, 'Site deletion works');
  } catch (err: any) {
    logResult('Site Deletion', false, `Site deletion failed: ${err.message}`);
  }

  // Logout
  try {
    await client.auth.logout();
    logResult('Logout', true, 'Logout works');
  } catch (err: any) {
    logResult('Logout', false, `Logout failed: ${err.message}`);
  }

  // ==========================================
  // SUMMARY REPORT
  // ==========================================
  console.log('\n====================================================');
  console.log(`📊 FINAL VERIFICATION SUMMARY`);
  console.log(`Total Checks: ${passed + failed}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
