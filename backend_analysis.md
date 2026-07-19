# TridopAI Backend Codebase Analysis

This document provides a comprehensive, production-ready analysis of the backend codebase for **Tridop-AI-Studio**. It outlines the structure, security requirements, environment configurations, and database models of the microservices mesh proxied through the **API Gateway** (`api-gateway`), as well as identifying several bugs/gaps in the current implementation.

---

## 1. All API Endpoints

All client requests enter through the `api-gateway` (default port `4000`) and are proxied to their respective downstream services via Redis microservice transporters.

### Feature Group: Authentication (`/auth`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/auth/signup` | Register a new user account | no | None |
| `POST` | `/auth/login` | Login and receive JWT access & refresh tokens | no | None |
| `POST` | `/auth/refresh` | Rotate JWT access token using a refresh token | no | None |
| `DELETE` | `/auth/logout` | Invalidate all active sessions for the current user | yes | None |

### Feature Group: Users & Categories (`/users`, `/categories`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/users/me` | Retrieve the current user's profile | yes | None |
| `PATCH` | `/users/me` | Perform partial updates on the user's profile | yes | None |
| `GET` | `/users/me/business-profile` | Get the business profile for the current user | yes | None |
| `POST` | `/users/me/business-profile` | Create or update the user's business profile | yes | None |
| `GET` | `/categories` | Retrieve business categories and default onboarding features | no | None |

### Feature Group: AI Generation (`/ai`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/ai/prompt` | Send a raw prompt to the AI model | yes | None |
| `POST` | `/ai/generate` | Queue an async job to generate site blocks (deducts 1 credit) | yes | None |
| `GET` | `/ai/generate/:jobId` | Fetch status of the async site generation job | yes | None |
| `POST` | `/ai/suggest-domains` | Get 5 domain name suggestions for a business | yes | None |
| `POST` | `/ai/prefill` | Prefill landing page copy and block layouts from a profile | yes | None |
| `POST` | `/ai/assist-copy` | Rewrite website copy with a specific tone and instructions | yes | None |
| `POST` | `/ai/generate-image` | Generate a stock image from a prompt (Vertex AI Imagen 3) | yes | None |
| `POST` | `/ai/generate-legal` | Generate Terms of Service and Privacy Policy content | yes | None |
| `POST` | `/ai/stream` | Trigger an AI stream response for a session | yes | None |
| `GET` | `/ai/stream` | Server-Sent Events stream for live prompt generations | yes | None |
| `GET` | `/ai/quota` | Get user monthly AI credits usage details | yes | None |

### Feature Group: Sites & Post-Generation CRUD (`/sites`)
> [!NOTE]
> Every route here is protected by the `SiteOwnershipGuard` (which verifies the logged-in user actually owns the `siteId` being modified/accessed).

| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/sites` | Create a new site configuration | yes | None |
| `GET` | `/sites` | List all sites owned by the active user | yes | None |
| `GET` | `/sites/:id` | Get site configuration details by ID | yes | None |
| `PUT` | `/sites/:id` | Update site settings or block placements | yes | None |
| `DELETE` | `/sites/:id` | Delete a site permanently | yes | None |
| `GET` | `/sites/:id/blocks` | Retrieve all blocks associated with a site | yes | None |
| `PUT` | `/sites/:id/blocks/:blockId` | Update visible content & visibility of a specific block | yes | None |
| `POST` | `/sites/:id/versions` | Save a new snapshot version of the site | yes | None |
| `GET` | `/sites/:id/versions` | Retrieve saved version history for a site | yes | None |
| `POST` | `/sites/:id/versions/:versionId/restore` | Rollback site back to a saved version | yes | None |
| `POST` | `/sites/:id/clone` | Clone a website configuration | yes | None |
| `POST` | `/sites/:id/export` | Export the website configuration to static HTML/CSS files | yes | None |
| `GET` | `/sites/meta/counts` | Get aggregate site counts | yes | None |
| `GET` | `/sites/:id/ab-tests` | Retrieve running A/B tests for a site | yes | None |
| `POST` | `/sites/:id/ab-tests` | Create a new A/B testing campaign | yes | None |
| `PUT` | `/sites/:id/ab-tests/:testId` | Update an existing A/B test setup | yes | None |
| `GET` | `/sites/templates/all` | Get all design templates (*Broken: Order collision*) | yes | None |
| `POST` | `/sites/:id/apply-template` | Apply a design template onto the site | yes | None |
| `POST` | `/sites/:id/upload-image` | Upload an image asset for a site (*Stubbed/Throws error*) | yes | None |
| `POST` | `/sites/:id/records/:schemaType` | Create a dynamic schema database record | yes | None |
| `GET` | `/sites/:id/records/:schemaType` | List dynamic schema database records | yes | None |
| `PUT` | `/sites/:id/records/:schemaType/:recordId` | Update a dynamic schema database record | yes | None |
| `DELETE` | `/sites/:id/records/:schemaType/:recordId` | Delete a dynamic schema database record | yes | None |

### Feature Group: Commerce (`/commerce`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/commerce/products` | Add a new product to a site's store | yes | None |
| `GET` | `/commerce/products/site/:siteId` | Retrieve products belonging to a site | yes | None |
| `POST` | `/commerce/bookings` | Book a client appointment slot | yes | None |
| `GET` | `/commerce/orders/site/:siteId` | Fetch all checkout orders for a site | yes | None |
| `PUT` | `/commerce/orders/:id/status` | Update a store order status (e.g. "fulfilled") | yes | None |
| `POST` | `/commerce/inventory/sync` | Manually sync product stock count | yes | None |
| `POST` | `/commerce/checkout` | Initialize a Paystack checkout redirect link | yes | None |

### Feature Group: Analytics (`/analytics`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/analytics/dashboard/site/:siteId` | Get traffic analytics dashboard (*Broken: Protected send*) | yes | None |

### Feature Group: Deployments (`/deploy`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/deploy/trigger` | Trigger a static export and build (*Broken: Client mismatch*) | yes | None |
| `GET` | `/deploy/status/:siteId` | Check last deployment status (*Broken: Client mismatch*) | yes | None |
| `GET` | `/deploy/:jobId/stream` | Server-Sent Events stream for live build logs | yes | None |

### Feature Group: Domains (`/domains`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/domains/search` | Check domain availability (*Broken: Client mismatch*) | yes | None |
| `POST` | `/domains/register` | Link a custom domain to a site (*Broken: Client mismatch*) | yes | None |
| `GET` | `/domains/site/:siteId` | List domains linked to a site (*Broken: Client mismatch*) | yes | None |

### Feature Group: Real-Time Alerts (`/notifications`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/notifications/stream` | Server-Sent Events stream for live engagement alerts | yes | None |

### Feature Group: Platform Administration (`/owner`)
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/owner/dashboard` | Get platform MRR, active users, and site counts (*Broken*) | yes | `admin`, `owner` |
| `GET` | `/owner/users` | List all registered business owners (*Broken*) | yes | `admin`, `owner` |
| `PUT` | `/owner/users/:id/suspend` | Suspend a business owner's account access (*Broken*) | yes | `admin`, `owner` |
| `PUT` | `/owner/users/:id/unsuspend` | Lift a business owner's account suspension (*Broken*) | yes | `admin`, `owner` |
| `POST` | `/owner/users/:id/impersonate` | Issue a JWT impersonation access token (*Broken*) | yes | `admin`, `owner` |
| `GET` | `/owner/sites` | List all platform-hosted site configurations (*Broken*) | yes | `admin`, `owner` |
| `PUT` | `/owner/kill-switch` | Toggle platform-wide kill switch maintenance mode (*Broken*) | yes | `admin`, `owner` |

### Infrastructure & Health
| METHOD | Route | What it does | Auth required (yes/no) | Role required (if any) |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/health` | Check API Gateway health status | no | None |

---

## 2. Authentication System

* **Login Flow**: 
  The system uses stateless JSON Web Token (JWT) credentials. Upon executing a successful signup or login, the backend returns both an access token and a refresh token.
* **Login Request Body Structure**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
* **Success Response Body Structure**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
* **Token Attachment**: 
  For all protected paths, you must attach the token in the HTTP `Authorization` header as a Bearer token:
  `Authorization: Bearer <accessToken>`
* **Token Lifetime**:
  * Access Token: **15 minutes** (`15m`)
  * Refresh Token: **7 days** (`7d`)
* **Refresh Token System**: 
  Yes. You can rotate tokens using `POST /auth/refresh`.
  * **Request Body**:
    ```json
    {
      "refreshToken": "your_refresh_token_string"
    }
    ```
  * **Response**: `{ accessToken, refreshToken }`
* **Error Response Cases (Status Code `401 Unauthorized`)**:
  * **Missing Token**: Returns `"No auth token"` (thrown in `JwtGuard`).
  * **Expired/Invalid Token**: Returns `"Invalid or expired token"`.
  * **Suspended User**: Returns `"Account is suspended"`.

---

## 3. Request and Response Format

* **Successful Response Envelope**: 
  Successful API responses do **not** use a top-level wrapper object (such as `{ success, data, message }`). They return the raw data structure directly.
  * *Example (GET `/users/me`)*:
    ```json
    {
      "id": "e9a03ca2-e0fb-4d43-8f0a-fae12a647d3e",
      "email": "user@example.com",
      "role": "user",
      "oauthProvider": "local",
      "oauthId": null,
      "isSuspended": false,
      "createdAt": "2026-07-18T12:00:00.000Z",
      "updatedAt": "2026-07-18T12:00:00.000Z"
    }
    ```
* **Error Response Envelope**: 
  All errors are captured by a global shared filter (`SharedExceptionFilter`), producing a standard JSON envelope:
  ```json
  {
    "statusCode": 401,
    "message": "Invalid or expired token",
    "error": "Unauthorized",
    "traceId": "b182a39c-4f...",
    "timestamp": "2026-07-18T13:33:52.000Z"
  }
  ```
* **Common HTTP Status Codes**:
  * `200 OK` / `201 Created` / `204 No Content` for successes.
  * `400 Bad Request` for validation failures (e.g. class-validator rejects input).
  * `401 Unauthorized` for missing/invalid auth or suspended user.
  * `402 Payment Required` returned by `/ai/generate` when the user has insufficient AI generation credits.
  * `403 Forbidden` returned by `SiteOwnershipGuard` if you attempt to access resources of a site you do not own.
  * `404 Not Found` for missing database entries.
  * `503 Service Unavailable` returned when the platform kill-switch is active or when hitting stubbed gateway proxies.
  * `500 Internal Server Error` for downstream microservice crashes.

---

## 4. User Roles

* **Roles Available**:
  * `'user'`: Standard business owner account.
  * `'owner'`: Platform administrator account (and is the role name targeted by the admin panel).
* **Permissions Matrix**:
  * `'user'`: Can perform site actions, add store products, manage appointments, query custom domains, stream AI blocks.
  * `'owner'`: Can access `/owner/*` admin endpoints (impersonation, users lists, suspension, and the platform kill-switch).
* **Storage Location**:
  * **Database**: `users` PostgreSQL table, `role` column (defaults to `'user'`).
  * **JWT**: Decoded payload contains `JwtPayload.role`.
* **Enforcement Mechanism**:
  * Enforced using `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('admin', 'owner')` decorators on route controllers.
  * > [!WARNING]
    > **Implementation Bug:** `JwtAuthGuard` and `RolesGuard` are imported from `@libs/common` in the controller, but they are **not** exported or defined in the shared library, which causes compile failures.

---

## 5. Database Models and Schemas

The database architecture is a hybrid: relational transactional data is in **PostgreSQL** (TypeORM), and layout configs and logs are in **MongoDB** (Mongoose).

### A. Relational Databases (PostgreSQL Tables)

#### **Schema: `identity`**
* **`users`**
  * `id`: `uuid` (Primary Key, Auto)
  * `email`: `varchar(320)` (Required, Unique, Indexed)
  * `passwordHash`: `varchar` (Optional/Nullable, Hidden from default selects)
  * `role`: `varchar` (Required, Default: `'user'`)
  * `oauthProvider`: `varchar` (Required, Default: `'local'`)
  * `oauthId`: `varchar` (Optional/Nullable)
  * `isSuspended`: `boolean` (Required, Default: `false`)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`sessions`**
  * `id`: `uuid` (Primary Key, Auto)
  * `userId`: `uuid` (Required, Foreign Key to `users.id`, Cascades delete)
  * `refreshTokenHash`: `varchar` (Required, Hidden from default selects)
  * `userAgent`: `varchar` (Optional/Nullable)
  * `ip`: `varchar` (Optional/Nullable)
  * `expiresAt`: `timestamptz` (Required)
  * `createdAt`: `timestamp` (Required, Auto)

#### **Schema: `commerce`**
* **`products`**
  * `id`: `uuid` (Primary Key)
  * `siteId`: `varchar` (Required)
  * `name`: `varchar` (Required)
  * `price`: `number` (Required)
  * `currency`: `varchar` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
* **`bookings`**
  * `id`: `uuid` (Primary Key)
  * `siteId`: `varchar` (Required)
  * `startTime`: `timestamp` (Required)
  * `endTime`: `timestamp` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
* **`carts`**
  * `id`: `uuid` (Primary Key)
  * `siteId`: `varchar` (Required)
  * `customerId`: `varchar` (Optional/Nullable)
  * `items`: `jsonb` (Required, Default: `[]`)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`orders`**
  * `id`: `uuid` (Primary Key)
  * `siteId`: `varchar` (Required)
  * `customerId`: `varchar` (Optional/Nullable)
  * `status`: `varchar` (Required)
  * `totalPrice`: `number` (Required)
  * `currency`: `varchar` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`order_items`**
  * `id`: `uuid` (Primary Key)
  * `orderId`: `uuid` (Required)
  * `productId`: `uuid` (Required)
  * `quantity`: `number` (Required)
  * `unitPrice`: `number` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
* **`inventory`**
  * `id`: `uuid` (Primary Key)
  * `productId`: `uuid` (Required)
  * `quantity`: `number` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)

#### **Schema: `deploy`**
* **`live_sites`**
  * `id`: `uuid` (Primary Key)
  * `siteId`: `varchar` (Required)
  * `domain`: `varchar` (Required)
  * `hasCustomDomain`: `boolean` (Required, Default: `false`)
  * `deployedAt`: `timestamp` (Required, Auto)

#### **Schema: `domains`**
* **`domains`**
  * `id`: `uuid` (Primary Key)
  * `domain`: `varchar` (Required)
  * `siteId`: `varchar` (Required)
  * `type`: `varchar` (Required)
  * `createdAt`: `timestamp` (Required, Auto)

#### **Schema: `billing`**
* **`plans`**
  * `id`: `uuid` (Primary Key)
  * `name`: `varchar` (Required, Unique)
  * `tier`: `PlanTier` (Required)
  * `priceMonthly`: `number` (Required)
  * `priceYearly`: `number` (Required)
  * `stripePriceIdMonthly`: `varchar` (Optional)
  * `stripePriceIdYearly`: `varchar` (Optional)
  * `paystackPlanCodeMonthly`: `varchar` (Optional)
  * `paystackPlanCodeYearly`: `varchar` (Optional)
  * `features`: `jsonb` (Required, Default: `{}`)
  * `isActive`: `boolean` (Required, Default: `true`)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`subscriptions`**
  * `id`: `uuid` (Primary Key)
  * `userId`: `uuid` (Required, Unique)
  * `planId`: `uuid` (Required)
  * `status`: `SubscriptionStatus` (Required)
  * `stripeSubscriptionId`: `varchar` (Optional)
  * `paystackSubscriptionCode`: `varchar` (Optional)
  * `currentPeriodEnd`: `timestamp` (Optional)
  * `cancelAtPeriodEnd`: `boolean` (Required, Default: `false`)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`payments`**
  * `id`: `uuid` (Primary Key)
  * `userId`: `uuid` (Required)
  * `subscriptionId`: `uuid` (Required)
  * `amount`: `number` (Required)
  * `currency`: `varchar` (Required)
  * `provider`: `varchar` (Required, Default: `'paystack'`)
  * `providerPaymentId`: `varchar` (Required, Unique)
  * `status`: `'succeeded' | 'failed' | 'refunded'` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
* **`referrals`**
  * `id`: `uuid` (Primary Key)
  * `referrerId`: `uuid` (Required)
  * `referredUserId`: `uuid` (Required)
  * `referralCode`: `varchar` (Required, Unique)
  * `status`: `'pending' | 'rewarded' | 'expired'` (Required)
  * `rewardAmount`: `number` (Optional)
  * `createdAt`: `timestamp` (Required, Auto)
* **`processed_webhook_events`**
  * `id`: `uuid` (Primary Key)
  * `provider`: `varchar` (Required)
  * `eventId`: `varchar` (Required, Unique)
  * `processedAt`: `timestamp` (Required, Auto)
* **`coupons`**
  * `id`: `uuid` (Primary Key)
  * `code`: `varchar` (Required, Unique)
  * `discountType`: `'percent' | 'fixed'` (Required)
  * `discountValue`: `number` (Required)
  * `maxUses`: `number` (Optional)
  * `usedCount`: `number` (Required, Default: `0`)
  * `expiresAt`: `timestamp` (Optional)
  * `isActive`: `boolean` (Required, Default: `true`)
  * `createdAt`: `timestamp` (Required, Auto)
* **`agencies`**
  * `id`: `uuid` (Primary Key)
  * `ownerUserId`: `uuid` (Required, Unique)
  * `name`: `varchar` (Required)
  * `logoUrl`: `varchar` (Optional)
  * `marginPercent`: `number` (Required, Default: `20`)
  * `createdAt`: `timestamp` (Required, Auto)
  * `updatedAt`: `timestamp` (Required, Auto)
* **`agency_clients`**
  * `id`: `uuid` (Primary Key)
  * `agencyId`: `uuid` (Required, Foreign Key to `agencies.id`)
  * `clientUserId`: `uuid` (Required, Unique)
  * `isActive`: `boolean` (Required, Default: `true`)
  * `joinedAt`: `timestamp` (Required, Auto)

#### **Schema: `owner`**
* **`feature_flags`**
  * `id`: `varchar` (Primary Key)
  * `enabled`: `boolean` (Required, Default: `false`)
* **`flagged_content`**
  * `id`: `uuid` (Primary Key)
  * `content`: `varchar` (Required)
  * `status`: `varchar` (Required, Default: `'pending'`)
  * `createdAt`: `timestamp` (Required, Auto)
* **`owner_action_log`**
  * `id`: `uuid` (Primary Key)
  * `action`: `varchar` (Required)
  * `createdAt`: `timestamp` (Required, Auto)
* **`platform_settings`**
  * `killSwitchActive`: `boolean` (Required, Default: `false`)
  * `featureFlags`: `jsonb` (Required, Default: `{}`)
  * `updatedAt`: `timestamp` (Required, Auto)

---

### B. Document Collections (MongoDB via Mongoose)

*Timestamps (`createdAt`, `updatedAt`) are automatically managed on all schemas.*

#### **Database: `identity_db`**
* **`business_profiles`** (Collection: `business_profiles`)
  * `userId`: `String` (Required, Unique, Indexed)
  * `businessName`: `String` (Required)
  * `category`: `String` (Optional)
  * `industry`: `String` (Optional)
  * `selectedFeatures`: `[String]` (Optional)
  * `description`: `String` (Optional)
  * `phone`: `String` (Optional)
  * `address`: `String` (Optional)
  * `logoUrl`: `String` (Optional)
  * `websiteUrl`: `String` (Optional)
  * `paystackSubaccountCode`: `String` (Optional)
  * `bankCode`: `String` (Optional)
  * `accountNumber`: `String` (Optional)

#### **Database: `sites_db`**
* **`site_schemas`** (Collection: `site_schemas`)
  * `siteId`: `String` (Required)
  * `ownerId`: `String` (Required)
  * `slug`: `String` (Required, Unique)
  * `status`: `String` (Required, Default: `'Draft'`)
  * `blocks`: `[Schema.Types.Mixed]` (Required, Default: `[]`)
  * `pages`: `[Schema.Types.Mixed]` (Required, Default: `[]`)
  * `globalSettings`: `Schema.Types.Mixed` (Required, Default: `{}`)
* **`blocks`** (Collection: `blocks`)
  * `siteId`: `String` (Required)
  * `blockId`: `String` (Required)
  * `type`: `String` (Required)
  * `data`: `Schema.Types.Mixed` (Required, Default: `{}`)
  * `version`: `Number` (Required)
* **`dynamic_records`** (Collection: `dynamic_records`)
  * `siteId`: `String` (Required)
  * `schemaType`: `String` (Required)
  * `data`: `Schema.Types.Mixed` (Required, Default: `{}`)
* **`version_snapshots`** (Collection: `version_snapshots`)
  * `siteId`: `String` (Required)
  * `versionNumber`: `Number` (Required)
  * `createdBy`: `String` (Required)
  * `snapshotData`: `Schema.Types.Mixed` (Required)
  * `commitMessage`: `String` (Optional)
* **`templates`** (Collection: `templates`)
  * `slug`: `String` (Required, Unique)
  * `name`: `String` (Required)
  * `category`: `String` (Required)
  * `defaultBlocks`: `Schema.Types.Mixed` (Required)
  * `globalSettings`: `Schema.Types.Mixed` (Required, Default: `{}`)
* **`ab_tests`** (Collection: `ab_tests`)
  * `siteId`: `String` (Required)
  * `name`: `String` (Required)
  * `status`: `String` (Required)
  * `variantId`: `String` (Required)
  * `weight`: `Number` (Required)
  * `blocksOverride`: `Schema.Types.Mixed` (Required)
  * `results`: `Schema.Types.Mixed` (Required, Default: `{}`)

#### **Database: `engagement_db`**
* **`contacts`**
  * `siteId`: `String` (Required)
  * `name`: `String` (Required)
  * `email`: `String` (Optional)
  * `phone`: `String` (Optional)
  * `lifetimeValue`: `Number` (Required, Default: `0`)
* **`form_submissions`**
  * `siteId`: `String` (Required)
  * `contactId`: `String` (Optional)
  * `formName`: `String` (Required)
  * `data`: `Schema.Types.Mixed` (Optional)
* **`message_threads`**
  * `siteId`: `String` (Required)
  * `contactId`: `String` (Optional)
  * `channel`: `String` (Required)
  * `messages`: `[Schema.Types.Mixed]` (Required, Default: `[]`)
* **`reviews`**
  * `siteId`: `String` (Required)
  * `contactId`: `String` (Optional)
  * `rating`: `Number` (Required)
  * `content`: `String` (Required)
  * `source`: `String` (Required)
* **`reviews_cache`** (Collection: `reviews_cache`)
  * `siteId`: `String` (Required)
  * `source`: `String` (Required)
  * `reviews`: `[Schema.Types.Mixed]` (Required, Default: `[]`)

---

## 6. Environment Variables

Variables are grouped by their operational category.

### Category: Shared Infrastructure
* `REDIS_URL`: Endpoint URI for the central message broker (Default: `redis://localhost:6379`).
* `NODE_ENV`: Application running stage (`development` / `production`).
* `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry tracing collector URL (`http://localhost:4318/v1/traces`).

### Category: HTTP Gateways
* `PORT`: Server port of the `api-gateway` (Default: `4000`).
* `ALLOWED_ORIGIN`: CORS origin filter value (Default: `http://localhost:3000`).

### Category: Auth & JWT Keys
* `JWT_ACCESS_SECRET`: Shared secret used to sign/verify short-lived access JWT tokens.
* `JWT_REFRESH_SECRET`: Encryption key used to sign/verify long-lived refresh tokens.

### Category: Relational DB Configurations (PostgreSQL URLs)
* `IDENTITY_POSTGRES_URL`: PostgreSQL connection string restricted to the `identity` schema.
* `SITES_POSTGRES_URL`: PostgreSQL connection string restricted to the `sites` schema.
* `OWNER_POSTGRES_URL`: PostgreSQL connection string restricted to the `owner` schema.
* `DEPLOY_POSTGRES_URL`: PostgreSQL connection string restricted to the `deploy` schema.
* `DOMAINS_POSTGRES_URL`: PostgreSQL connection string restricted to the `domains` schema.
* `BILLING_POSTGRES_URL`: PostgreSQL connection string restricted to the `billing` schema.
* `COMMERCE_POSTGRES_URL`: PostgreSQL connection string restricted to the `commerce` schema.

### Category: Document DB Configurations (MongoDB URIs)
* `MONGODB_URI`: Primary Mongoose connection URI (Defaults to `mongodb://localhost:27017/identity_db`).
* `MONGO_URL`: Target MongoDB database names mapped dynamically inside the `sites` (`sites_db`), `engagement` (`engagement_db`), and `ai` (`ai_db`) services.

### Category: Integrations & Payments
* `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Configs for Google OAuth Sign-in integration.
* `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: Configs for GitHub OAuth Sign-in integration.
* `PAYSTACK_SECRET_KEY`: Private token to initialize checkouts and subaccounts.
* `GEMINI_API_KEY`: API token to hook into Google Gemini text models.
* `GEMINI_MODEL_PRO` / `GEMINI_MODEL_FLASH`: Models mapping strings overrides.
* `POSTHOG_PROJECT_ID` / `POSTHOG_PERSONAL_API_KEY`: Configuration targets to run queries on PostHog events database.

---

## 7. Middleware

* **Global Middlewares**:
  * **`KillSwitchMiddleware`**: Blocks every request globally returning `503 Service Unavailable` if the Redis key `platform:killSwitch` is evaluated as `'true'`. Bypasses only `/health` and `/owner/*`.
* **Auth Middlewares**:
  * **`AuthenticateJWTMiddleware`**: Automatically extracts the Bearer token, performs signature verification using the shared secret `JWT_ACCESS_SECRET`, and appends the decoded payload to the request object (`req.user`).
  * **Exceptions**: `auth/signup`, `auth/login`, `auth/refresh`, `categories`, `health`, `api` (Swagger UI), and `api-json`.
* **Rate Limiting**:
  * Global NestJS throttlers prevent spam:
    * **Global routes**: Limit of `100` calls per `60` seconds.
    * **AI prompt/generation routes**: Tighter limit of `20` calls per `60` seconds.
* **CORS Settings**:
  * Restricts incoming browser requests to `process.env.ALLOWED_ORIGIN` (defaulting to `http://localhost:3000`) and allows cookies and authorization headers with `credentials: true`.

---

## 8. File Uploads

* **Upload Functionality**: Partially stubbed.
* **Endpoint**: `POST /sites/:id/upload-image`
* **JSON Body**: `{ fileData: string }` (Takes Base64 encoded payload)
* **Accepted File Types & Sizes**: No validations are done in the gateway layer.
* **Storage Location**: Intended to be uploaded to AWS S3.
* **Actual Backend Behavior**: The `sites-service` microservice handler `uploads.image` throws a hardcoded error:
  `Error: AWS_S3_BUCKET not configured for image uploads`
* **Response contract**: Currently returns a `500` error with the above error message.

---

## 9. Real-Time Features

The architecture rejects traditional WebSockets in favor of unidirectional **Server-Sent Events (SSE)** streams.

1. **AI Content Streaming (`GET /ai/stream`)**:
   * Subscribes to the Redis channel `ai:stream:{userId}`.
   * Streams text chunks as: `data: {message}\n\n`.
   * Sends an empty comment heartbeat `: keep-alive\n\n` every 15 seconds to prevent timeout.
2. **Build and Deployment Log Streaming (`GET /deploy/:jobId/stream`)**:
   * Subscribes to the Redis channel `deploy:stream:{jobId}`.
   * Streams live CLI build strings.
   * Heartbeat sends `: keep-alive\n\n` every 15 seconds.
3. **Real-time Notifications (`GET /notifications/stream`)**:
   * Subscribes to the Redis channel `engagement:notifications:{userId}`.
   * Streams live form submissions, customer contacts, or review sync events.
   * Heartbeat sends `: keep-alive\n\n` every 15 seconds.

---

## 10. Third-Party Services

* **Google Generative AI SDK**:
  * Used for copywriting, block layout generation, and legal policy creation. Uses the `@google/generative-ai` SDK with `GEMINI_API_KEY`.
* **Vertex AI (Imagen 3)**:
  * Used for generating matching stock imagery.
* **Paystack Payments API**:
  * Used by `billing-service` and `commerce-service` to initialize user payments, generate redirect payment links, and register seller subaccounts (charging a 5% commission).
* **Cloudflare for SaaS**:
  * Used inside the `domains-service` to dynamically verify custom CNAME redirects and register SSL certificates.
* **PostHog**:
  * Queried by `analytics-service` to fetch pageviews and daily active visitors.

---

## 11. Critical Gaps & Bugs in the Codebase

Several architectural bugs were identified that prevent the backend from compiling or operating correctly:

### A. The "Protected Method" Client Call Bug (Critical Compilation Failure)
All services wrappers (e.g. `AnalyticsClient`, `EngagementClient`, `OwnerClient`, `BillingClient`) inherit from `BaseServiceClient`.
In `BaseServiceClient`, the `send` method is declared `protected`:
```typescript
protected async send<TResult, TPayload extends Record<string, unknown>>(...)
```
However, in the API Gateway proxy files, the code directly calls `.send()` on these client wrappers:
```typescript
// Throws a TypeScript compiler error - method is protected
return this.analyticsClient.send('analytics.dashboard.get', { siteId });
```
This is a compile-time block. The client classes must be updated to export custom public wrapper methods, or `send` must be exposed.

### B. Missing Client Methods (Runtime Failures)
The gateway proxy calls functions that were never declared in the client packages:
* **Domains**: `DomainsProxy` calls `domainsClient.search`, `domainsClient.register`, and `domainsClient.listDomains`. However, `DomainsClient` only has `updateLookup` and `provisionSubdomain`.
* **Deployments**: `DeployProxy` calls `deployClient.triggerDeployment` and `deployClient.getDeploymentStatus`. However, `DeployClient` only has `triggerDeploy` and `getStatus`.

### C. Missing Owner/Admin Guards
The `OwnerProxy` (`owner.proxy.ts`) imports the following decorators and guards from `@libs/common`:
```typescript
import { JwtAuthGuard, RolesGuard, Roles } from '@libs/common';
```
These guards **do not exist** in the `@libs/common` shared library (only the basic `JwtGuard` exists). Consequently, the admin panel proxy will fail to compile.

### D. Route Ordering Collision (Sites vs. Templates)
In `sites.proxy.ts`, the route `GET /sites/templates/all` is declared *after* the generic `GET /sites/:id` handler. In NestJS, this means the router will capture the request on the `:id` pattern, treating `"templates"` as the website ID and crash. To fix this, the template route must be declared first.

### E. Domains Controller Dependency Bug
In `DomainsController` (`domains.controller.ts`), the `verifyDns` message handler references:
```typescript
const cnameTarget = this.config.get<string>('PROXY_CNAME_TARGET', 'proxy.tridopai.app');
```
However, the `ConfigService` (referenced as `this.config`) is never injected into the controller's constructor. Calling this handler will immediately throw:
`TypeError: Cannot read properties of undefined (reading 'get')`

### F. Empty/Stubbed Downstream Services
* **Billing**: The `BillingProxy` completely blocks every billing route by throwing a `503 Service Unavailable` ("billing-service not yet deployed") directly at the gateway layer.
* **Templates & Uploads**: The template listings (`templates.list`/`templates.apply`) and upload patterns (`uploads.image`) inside the `sites-service` are stubbed to throw hardcoded errors.
