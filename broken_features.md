# ❌ Broken Features & Backend Issues Register

Below is the complete register of all identified broken features, compilation errors, runtime crashes, and unimplemented stubs in the backend codebase. Use this as a checklist for what features to build as **mocks only** on the frontend for now.

---

## Summary Table

| Feature / Endpoint | Code/File Reference | Bug Type | Why it's broken | Frontend Action |
| :--- | :--- | :--- | :--- | :--- |
| **Analytics Dashboard**<br>`GET /analytics/dashboard/site/:siteId` | [analytics.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/analytics.proxy.ts) | Compilation Error | Protected method bug — calls `analyticsClient.send` directly, but `send` is a protected member of `BaseServiceClient`. | **Mock UI Only** |
| **Deploy Trigger**<br>`POST /deploy/trigger` | [deploy.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/deploy.proxy.ts) | Compilation Error | Client method name mismatch — calls `deployClient.triggerDeployment` which does not exist (the client implements `triggerDeploy`). | **Mock UI Only** |
| **Deploy Status**<br>`GET /deploy/status/:siteId` | [deploy.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/deploy.proxy.ts) | Compilation Error | Client method name mismatch — calls `deployClient.getDeploymentStatus` which does not exist (the client implements `getStatus`). | **Mock UI Only** |
| **Domain Search & Registration**<br>`POST /domains/search`<br>`POST /domains/register`<br>`GET /domains/site/:siteId` | [domains.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/domains.proxy.ts) | Compilation Error | Client methods do not exist — calls `domainsClient.search`, `register`, and `listDomains` which were never defined in the client wrapper. | **Mock UI Only** |
| **Domain DNS Verification**<br>`domains.verifyDns` message pattern | [domains.controller.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/domains-service/src/domains.controller.ts) | Runtime Crash | Incomplete Dependency Injection — references `this.config.get(...)` but `ConfigService` is not injected into the constructor, resulting in a `TypeError`. | **Mock UI Only** |
| **Campaign Messages**<br>`POST /engagement/messages` | [engagement.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/engagement.proxy.ts) | Compilation Error | Protected method bug — calls `engagementClient.send` directly, which is protected in `BaseServiceClient`. | **Mock UI Only** |
| **Customer Contacts & Forms**<br>`GET /engagement/contacts/site/:siteId`<br>`GET /engagement/forms/site/:siteId` | [engagement.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/engagement.proxy.ts) | Compilation Error | Protected method bug — calls `engagementClient.send` directly, which is protected in `BaseServiceClient`. | **Mock UI Only** |
| **All Billing Routes**<br>`/billing/*` | [billing.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/billing.proxy.ts) | Hardcoded Stub | Entire billing proxy captures all sub-paths and directly throws `503 Service Unavailable`. | **Mock UI Only** |
| **Admin Panel Guarding**<br>`/owner/*` | [owner.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/owner.proxy.ts) | Compilation Error | Missing files/imports — attempts to import `JwtAuthGuard` and `RolesGuard` from `@libs/common` but they are not defined or exported. | **Mock UI Only** |
| **Admin Dashboard Stats**<br>`GET /owner/dashboard` | [owner.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/owner.proxy.ts) | Compilation Error | Protected method bug — calls `ownerClient.send` directly, which is protected. | **Mock UI Only** |
| **Admin User & Site Lists**<br>`GET /owner/users`<br>`GET /owner/sites` | [owner.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/owner.proxy.ts) | Compilation Error | Protected method bug — calls `identityClient.send` and `sitesClient.send` directly, which are protected. | **Mock UI Only** |
| **Admin Impersonation & Suspend**<br>`PUT /owner/users/:id/suspend`<br>`POST /owner/users/:id/impersonate` | [owner.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/owner.proxy.ts) | Compilation Error | Protected method bug — calls `identityClient.send` directly, which is protected. | **Mock UI Only** |
| **Image Upload**<br>`POST /sites/:id/upload-image` | [sites.controller.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/sites-service/src/sites/sites.controller.ts) | Hardcoded Stub | The downstream handler throws `Error: AWS_S3_BUCKET not configured for image uploads`, resulting in a hardcoded `500` error. | **Mock UI Only** |
| **Template Listings**<br>`GET /sites/templates/all` | [sites.proxy.ts](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/sites.proxy.ts) | Routing Collision | Route ordering bug — declared after the dynamic `GET /sites/:id` endpoint. Express/NestJS resolves `"templates"` as the `:id` parameter and crashes. | **Mock UI Only** |

---

## Detailed Explanations

### 1. The Protected `.send()` Bug (TypeScript Compilation Failures)
All client proxies inside `@libs/clients` extend [BaseServiceClient](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/libs/clients/src/baseClient.ts). The `BaseServiceClient` defines `.send()` as a protected helper:
```typescript
protected async send<TResult, TPayload extends Record<string, unknown>>(
  pattern: string,
  payload: TPayload,
  options: SendOptions = {},
): Promise<TResult>
```
Because it is protected, it can only be called from inside class wrappers that extend it. However, the API Gateway proxy controllers call it directly on instance objects from the outside. 
* This affects **Analytics**, **Engagement (contacts/forms/messages)**, and the **Owner Panel (users/sites/impersonate/dashboard)**.

### 2. Client Method Name Mismatch
In [DeployProxy](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/deploy.proxy.ts), the gateway calls:
* `this.deployClient.triggerDeployment(data)`
* `this.deployClient.getDeploymentStatus({ siteId })`

However, in [DeployClient](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/libs/clients/src/deploy.client.ts), the methods are named:
* `triggerDeploy(payload)`
* `getStatus(jobId)`

This mismatch results in compilation errors.

### 3. Non-existent Client Methods
In [DomainsProxy](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/domains.proxy.ts), the gateway delegates to `domainsClient` methods that were never declared in the client file:
* `domainsClient.search(...)`
* `domainsClient.register(...)`
* `domainsClient.listDomains(...)`

The actual [DomainsClient](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/libs/clients/src/domains.client.ts) only implements `updateLookup` and `provisionSubdomain`.

### 4. Router Order Collision (Templates List)
In [SitesProxy](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/api-gateway/src/proxy/sites.proxy.ts), the route handlers are defined in this order:
```typescript
  @Get(':id')
  async getSite(@Param('id') id: string) { ... }

  // ...

  @Get('templates/all')
  async listTemplates() { ... }
```
When you make a request to `GET /sites/templates/all`, NestJS matches it against `GET /sites/:id` first. It assigns `id = "templates"` and proceeds to fetch a site config with that ID, resulting in a database lookup crash.

### 5. Dependency Reference Crash in Domains Controller
In [DomainsController](file:///c:/Users/torre/old/Documents/Projects/Tridop-AI-Studio/apps/domains-service/src/domains.controller.ts) at line 40:
```typescript
  @MessagePattern('domains.verifyDns')
  async verifyDns(@Payload() data: { domain: string }) {
    const cnameTarget = this.config.get<string>('PROXY_CNAME_TARGET', 'proxy.tridopai.app');
    ...
  }
```
`this.config` is references but never declared or injected. NestJS does not wire it up automatically unless it's defined in the class constructor:
```typescript
  constructor(
    private provisionSubdomain: ProvisionSubdomain,
    private cloudflare: CloudflareForSaaS,
    private idempotency: IdempotencyService,
    // missing: private config: ConfigService
  ) {}
```
Calling `verifyDns` will result in a runtime `TypeError` and crash the microservice handler.
