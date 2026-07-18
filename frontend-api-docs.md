# TridopAI Frontend API Documentation

This document describes the *actual* backend API exposed through the `api-gateway` based on the current implementation, rather than any previous specs.

## 1. Authentication & Identity (`/auth` & `/users`)
The `identity-service` handles user accounts, JWTs, and OAuth.

### Auth Flow
- **`POST /auth/signup`** (Public)
  - **Body:** `{ email: string, password: string, name?: string }`
  - **Response:** `{ accessToken: string, refreshToken: string }`
- **`POST /auth/login`** (Public)
  - **Body:** `{ email: string, password: string }`
  - **Response:** `{ accessToken: string, refreshToken: string }`
- **`POST /auth/refresh`** (Public)
  - **Body:** `{ refreshToken: string }`
  - **Response:** `{ accessToken: string, refreshToken: string }`
- **`DELETE /auth/logout`** (Requires Bearer Auth)
  - **Response:** `void` (Relies on frontend clearing tokens; backend invalidates session implicitly)

**OAuth:**
Both Google and GitHub OAuth exist in the codebase but are handled purely via message patterns (there are no explicit HTTP routes on the API gateway for `/auth/oauth/google` right now, they appear to be missing from the `AuthProxy` controller!). 
> **Gap Identified:** The proxy controller `AuthProxy` does not expose `@Post('oauth/google')` or `@Post('oauth/github')`, even though `IdentityClient` has methods for them.

### Users & Business Profile
- **`GET /users/me`** (Bearer Auth)
  - **Response:** `User` object (`{ id, email, role, oauthProvider... }`)
- **`PATCH /users/me`** (Bearer Auth)
  - **Body:** `Record<string, unknown>` (Partial user update)
  - **Response:** Updated `User` object
- **`GET /users/me/business-profile`** (Bearer Auth)
  - **Response:** `BusinessProfile` object
- **`POST /users/me/business-profile`** (Bearer Auth)
  - **Body:** `Record<string, unknown>`
  - **Response:** Updated `BusinessProfile` object

## 2. Onboarding & Category Selection (`/categories`)
- **`GET /categories`** (Public)
  - **Response:** `BUSINESS_CATEGORIES` array.
  - **Flow:** This returns the default features for each industry (e.g., `online_booking`, `gallery`). The frontend uses this to pre-fill the feature checklist during onboarding.

## 3. AI Generation (`/ai`)
> **WARNING: Unexpected Free-Text Chat Endpoints Found!**
> The specification stated there should be no free-text prompt or chat editing anywhere. However, the codebase currently exposes:
> - `POST /ai/prompt` (Body: `{ prompt: string }`)
> - `POST /ai/stream` (Body: `{ sessionId: string, prompt: string }`)
> **Frontend Action:** Do not use these if you are adhering to the "no free-text chat" product spec.

- **`POST /ai/prefill`** (Bearer Auth)
  - **Body:** `{ businessProfile: any }`
  - **Response:** Prefilled site block JSON based on the business profile.
- **`POST /ai/generate`** (Bearer Auth)
  - **Body:** `{ siteId: string, prompt: string }` (Note: Uses 'prompt' here too, likely for the initial generation prompt)
  - **Response:** Asynchronous job object. AI quota deduction is currently **stubbed** in the controller.
- **`GET /ai/generate/:jobId`** (Bearer Auth)
  - **Response:** Job status object.
- **`GET /ai/stream`** (Bearer Auth) - **Server-Sent Events (SSE)**
  - Streams AI responses directly from a Redis pub/sub channel (`ai:stream:{userId}`).
  - **Auth:** Standard Bearer token in the request header.
  - **Payload:** Raw strings emitted as `data: {message}\n\n`. Keeps alive via an empty heartbeat every 15 seconds.
- **`POST /ai/assist-copy`** (Bearer Auth)
  - **Body:** `{ text: string, tone?: string, instruction?: string }`
  - **Response:** Rewritten copy string.
- **`POST /ai/generate-legal`** (Bearer Auth)
  - **Body:** `{ businessName: string, contactEmail: string }`
  - **Response:** `{ privacy: string, terms: string }`
- **`GET /ai/quota`** (Bearer Auth)
  - **Response:** Current AI usage limit.

## 4. Sites & Post-Generation Editing (`/sites`)
Every route here is protected by both `ApiBearerAuth` and the custom `SiteOwnershipGuard` (which verifies the logged-in user actually owns the `siteId` being accessed).

- **`POST /sites`** (Bearer Auth)
  - **Body:** `{ config: any }`
  - **Response:** Newly created `SiteSchema` object. 
  - *Note on Frameworks:* The site record structure assumes Next.js, but there is no explicit `framework` field strongly enforced by a DTO validation pipe in the gateway. **Frontend Action:** Assume Next.js and do not show a framework picker UI.
- **`GET /sites`** (Bearer Auth)
  - **Response:** Array of `SiteSchema` objects.
- **`GET /sites/:id`** (Bearer Auth)
  - **Response:** `SiteSchema` object.
- **`PUT /sites/:id`** (Bearer Auth)
  - **Body:** `Record<string, unknown>` (Site configuration)

### The Post-Generation Editing Model
Instead of a conversational AI agent editing the site, editing is broken down into distinct CRUD capabilities:
- **Toggling a feature ON/OFF:** Currently, there is no explicit `/toggle-feature` endpoint. You must `PUT /sites/:id/blocks/:blockId` to update a block's visibility or fetch new generated blocks via `POST /ai/generate` and merge them. To delete, you likely omit it from the site config or set `visible: false`.
- **Direct Field Edits:**
  - **`PUT /sites/:id/blocks/:blockId`** (Bearer Auth)
  - **Body:** `{ content: any, version: number }`
  - **Concurrency Mechanism:** Yes! The `version` parameter enforces optimistic concurrency control.
- **Regenerate Button:** There is no dedicated `/regenerate` endpoint. The frontend must likely call `POST /ai/generate` again or use `POST /ai/assist-copy` for text.

### Site Versions (Snapshots)
- **`POST /sites/:id/versions`** (Body: `{ message: string }`)
- **`GET /sites/:id/versions`**
- **`POST /sites/:id/versions/:versionId/restore`**

### Dynamic Records
- **`POST /sites/:id/records/:schemaType`**
- **`GET /sites/:id/records/:schemaType`**
- **`PUT /sites/:id/records/:schemaType/:recordId`**
- **`DELETE /sites/:id/records/:schemaType/:recordId`**

## 5. Commerce & Business Dashboard (`/commerce`, `/analytics`, `/owner`, `/billing`, `/engagement`)
> **WARNING: Dashboard Endpoints Missing or Stubbed!**
> The specification requested dashboard endpoints for bookings, products, form submissions, synced reviews, and traffic summaries. Here is the *actual* state:
> - **Products:** `POST /commerce/products` and `GET /commerce/products/site/:siteId` are available.
> - **Bookings:** `POST /commerce/bookings` is available to create a booking. **Gap:** There is no `GET /commerce/bookings` to list them!
> - **Form Submissions & Reviews:** Completely missing from the codebase.
> - **Traffic Summary:** The entire `/analytics` endpoint group is stubbed out and hardcoded to return a `503 Service Unavailable` error (`"analytics-service not yet deployed"`). The same applies to the `/owner`, `/billing`, and `/engagement` endpoint groups.

**Note on Notifications:** While the `/engagement` REST proxy is stubbed, there *is* an active SSE stream exposed via `NotificationStreamGateway`:
- **`GET /notifications/stream`** (Bearer Auth)
  - Connects to the Redis pub/sub channel `engagement:notifications:{userId}` to stream real-time engagement alerts to the frontend.

## 6. Domains (`/domains`)
- **`POST /domains/search`** (Bearer Auth)
  - **Body:** `{ query: string }`
- **`POST /domains/register`** (Bearer Auth)
  - **Body:** `any` (likely registration details)
- **`GET /domains/site/:siteId`** (Bearer Auth)
  - **Response:** List of domains attached to the site.

## 7. Deployments (`/deploy`)
- **`POST /deploy/trigger`** (Bearer Auth, SiteOwnershipGuard)
  - **Body:** `{ siteId: string, versionId?: string }`
- **`GET /deploy/status/:siteId`** (Bearer Auth)
- **`GET /deploy/:jobId/stream`** (Bearer Auth) - **Server-Sent Events (SSE)**
  - Similar to the AI stream, this listens to `deploy:stream:{jobId}` in Redis and pushes raw text strings to the client.

## 8. Swagger Disagreements
While `@nestjs/swagger` is installed and `@ApiTags()` / `@ApiOperation()` are heavily used in the API Gateway proxy controllers, **there are no concrete DTO classes attached to the route handlers** (most `Body()` payloads are typed as `any` or inline objects like `{ siteId: string }`).
Because of this, the generated Swagger UI will *not* show accurate request body schemas or response models. It will just show empty objects.

## 9. Pagination & Rate Limiting
- **Pagination:** There are absolutely no pagination parameters (e.g., `?limit=10&page=1`) defined in any of the GET endpoints in the API Gateway. Everything appears to return flat arrays.
- **Rate Limiting:** NestJS Throttler is set up globally.
- **Error Responses:** Errors are funneled through a global exception filter. They generally return standard `{ statusCode, message, error }` JSON shapes. Microservice `RpcException`s are unwrapped so you get true 4xx/5xx HTTP codes.

## 10. Platform Administration (`/owner`)
*(Requires JWT Authentication AND role `admin` or `owner`)*

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/owner/dashboard` | Get platform-wide aggregated stats | None | `{ sites: number, users: number, mrr: number }` (from OwnerService) |
| `GET` | `/owner/users` | List all registered business owners | None | `Array<User>` |
| `PUT` | `/owner/users/:id/suspend` | Suspend a business owner | None | `{}` |
| `PUT` | `/owner/users/:id/unsuspend` | Unsuspend a business owner | None | `{}` |
| `POST` | `/owner/users/:id/impersonate` | Impersonate a business owner | None | `{ accessToken: string }` |
| `GET` | `/owner/sites` | List all websites across the platform | None | `Array<SiteConfig>` |
| `PUT` | `/owner/kill-switch` | Toggle platform kill-switch | `{ active: boolean }` | `{ active: boolean }` |

## 11. Required Environment Variables for Frontend
None of the backend env vars are strictly required by the frontend except knowing the API Base URL to hit the gateway. 
- API Gateway defaults to running on port `4000`.
- AI SSE endpoints connect directly to the gateway via `/ai/stream`.

## 12. Health & Infrastructure
- **`GET /health`** (Public)
  - Bound directly to the Express adapter in `main.ts` (not via the unused `HealthController`).
  - **Response:** `{ status: 'ok', service: 'api-gateway' }`
