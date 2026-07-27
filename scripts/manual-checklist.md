# TridopAI Manual QA & Connection Verification Checklist

Follow this page-by-page QA checklist in your browser (`http://localhost:5173` or `http://localhost:3000`) to verify all user-facing interactions.

---

## 1. LOGIN MODAL / PAGE (`/login`)

### Step-by-Step Flow:
1. Open the studio application in your browser.
2. Click **Login / Sign In** on the top header or landing page CTA.
3. Enter valid test credentials (e.g. Email: `okuborchinonye@gmail.com`, Password: `password123`).
4. Click **Sign In to Console**.

### What to Look For / Expected Outcomes:
- **Success Case**: Modal closes, JWT token is stored in `localStorage`, avatar initializes with your initials, and you are redirected to `/dashboard`.
- **Wrong Password Case**: A toast error banner displays `"Invalid email or password"`. No redirection occurs.
- **Suspended Account Case**: If an admin has suspended the user account, an error banner displays `"Account suspended. Contact support for reinstatement."`.

---

## 2. SIGNUP MODAL / PAGE (`/signup`)

### Step-by-Step Flow:
1. Click **Get Started Free** or **Create Account**.
2. Enter Full Name (`Chinonye Okubor`), Email (`new-founder@tridop.test`), Password (`TestPass123!`), and Confirm Password (`TestPass123!`).
3. Click **Create Workspace Account**.

### What to Look For / Expected Outcomes:
- **Success Case**: Account is created via `POST /auth/signup`, tokens are saved, and you are routed to the **Onboarding Wizard** (`/onboarding`).
- **Mismatched Passwords Case**: Form validation highlights the password field with `"Passwords do not match"`. Button is disabled until fixed.
- **Duplicate Email Case**: Toast notification displays `"User with this email already exists"`.

---

## 3. LANDING PAGE (`/`)

### Step-by-Step Flow:
1. Navigate to `http://localhost:5173/`.
2. **Slide 2 (Prompt Planner)**: Type `Build a modern logistics dispatch web app for Lagos` into the ambient AI prompt input and click **Synthesize App**.
3. **Slide 3 (Templates Loading)**: Scroll down to view the live business template cards loaded dynamically from `GET /sites/templates/all`.
4. **Slide 4 (CTA Buttons)**: Click **Launch Studio Console** or **Explore Pricing Tiers**.

### What to Look For / Expected Outcomes:
- **Prompt Planner**: Navigates to `/onboarding` prefilled with your prompt text.
- **Templates**: Grid displays pre-designed templates with category tags, preview thumbnails, and "Apply Template" buttons.
- **CTA Buttons**: Route smoothly to signup or pricing without full page reloads.

---

## 4. ONBOARDING WIZARD (`/onboarding`)

### Step-by-Step Flow:
1. **Step 1 (Business Identity)**: Enter Business Name (`Aetheria Logistics`) and Tagline (`Fastest Dispatch in West Africa`). Click **Next**.
2. **Step 2 (Category Grid)**: Select your business domain (`Logistics & Delivery`). Verify categories load via `GET /categories`.
3. **Step 3 (Color & Branding)**: Pick primary/secondary theme colors (`Cyan & Purple`).
4. **Step 4 (Contact Info)**: Fill in WhatsApp number, Phone, and Support Email.
5. **Step 5 (Tone & Vibe)**: Choose design vibe (`Sleek Dark / Futuristic`).
6. **Step 6 (AI Prefill)**: Click **Prefill Layout with AI**.
7. **Step 7 (Account Link)**: Choose **Create Account & Build** or **Log In**.
8. **Step 8 (Completion)**: Site is created via `POST /sites` and you are redirected to `/builder` or `/dashboard`.

### What to Look For / Expected Outcomes:
- **Category Grid**: Backend categories populate smoothly with default feature badges.
- **AI Prefill**: Prefills copy and block layouts automatically.
- **Final Completion**: Creates site record, updates workspace state, and routes to `/builder` with blocks pre-assembled.

---

## 5. RETURN USER DASHBOARD (`/`)

### Step-by-Step Flow:
1. Navigate to the main Dashboard (`/`).
2. Verify project cards load via `GET /sites`.
3. Check the **AI Credits Meter** in top bar (`GET /ai/quota`).
4. Hover over a project card and click the **Actions Menu** (`...`):
   - Click **Open Builder** (`/builder`).
   - Click **Duplicate / Clone** (`POST /sites/:id/clone`).
   - Click **Delete Site** (`DELETE /sites/:id`).
5. Open the User Avatar dropdown menu:
   - Click **Billing & Subscriptions** (`/billing`).
   - Click **Platform Owner Admin** (`/owner`).

### What to Look For / Expected Outcomes:
- **Project Feed**: Renders active projects with thumbnail, domain, last edited time, and status badge.
- **Notification Stream**: Listens to real-time SSE stream (`GET /notifications/stream`).
- **Actions**: Cloning duplicates the project immediately in the UI. Deleting removes the card from view.

---

## 6. BUILDER STUDIO (`/builder`)

### Step-by-Step Flow:
1. Open a site in the Builder (`/builder`).
2. **Canvas Render**: Verify site blocks (Hero, Features, Pricing, Contact) render accurately.
3. **AI Copilot Assistance**: Type `Rewrite hero heading for a luxury brand` in the AI Copilot side drawer and click **Generate**.
4. **Block Property Editing**: Click on any text or button in the canvas to open the inline property editor and update text.
5. **Version Snapshots**: Click **Save Version Snapshot** (`POST /sites/:id/versions`).
6. **Deploy App**: Click **Deploy Web App** (`POST /deploy/trigger`).

### What to Look For / Expected Outcomes:
- **AI Copilot**: Streams generated copy text via `POST /ai/assist-copy`.
- **Property Editor**: Live re-renders changes in real time.
- **Deploy Flow**: Displays a modal showing build steps (`Queued` → `Building` → `Deployed`) and outputs live deployment URL (`https://aetheria.tridop.site`).

---

## 7. PROJECT HISTORY (`/history`)

### Step-by-Step Flow:
1. Click **Project History** in the navigation bar.
2. Verify all past sites load via `GET /sites`.
3. Use the filter tabs: **All Projects**, **Published**, **Drafts**, **Archived**.
4. Click on a project to expand its **Version History Drawer** (`GET /sites/:id/versions`).
5. Click **Restore Version** on a previous snapshot (`POST /sites/:id/versions/:vId/restore`).

### What to Look For / Expected Outcomes:
- **Filter Tabs**: Instantly filters the list without page reload.
- **Version History**: Lists all commits with timestamp and message. Restoring reverts canvas blocks to that snapshot.
