# 🤖 ULTIMATE AI PROMPT TEMPLATE
## Build Production-Ready Full-Stack Web Applications from Scratch

**Version:** 2.0  
**Last Updated:** November 22, 2025  
**Tested With:** GitHub Copilot, Claude, ChatGPT  

---

## 📋 HOW TO USE THIS TEMPLATE

1. **Copy the entire prompt below** (from "START OF PROMPT" to "END OF PROMPT")
2. **Replace all `[PLACEHOLDER]` values** with your specific project details
3. **Paste into your AI assistant** (GitHub Copilot Chat, Claude, ChatGPT, etc.)
4. **Follow the AI's implementation** step-by-step
5. **Test locally** before deploying to production

---

## 🎯 WHAT THIS TEMPLATE DELIVERS

This prompt will guide AI to build a **complete, production-ready full-stack application** including:

✅ **Frontend:** Modern React/Vue/Angular with TypeScript  
✅ **Backend:** Node.js/Express or Python/FastAPI REST API  
✅ **Database:** PostgreSQL/MongoDB/SQLite with proper schema  
✅ **Authentication:** JWT-based secure auth system  
✅ **Real-time Features:** WebSockets or Server-Sent Events  
✅ **API Documentation:** Complete REST API endpoints  
✅ **Cloud Deployment:** Frontend (Vercel/Netlify) + Backend (Render/Railway)  
✅ **UI/UX:** Professional component library (shadcn/ui, Material-UI, etc.)  
✅ **Internationalization:** Multi-language support (optional)  
✅ **Data Export:** CSV/Excel/PDF export capabilities  
✅ **Error Handling:** Comprehensive error management  
✅ **Security:** CORS, rate limiting, input validation  
✅ **IoT Integration:** Hardware device support (optional)  

---

# 🚀 START OF PROMPT

---

## PROJECT CONTEXT

I need you to build a **complete, production-ready full-stack web application** from absolute scratch to deployment. I have **no coding knowledge**, so I need you to:

1. **Create all files and folders** with proper structure
2. **Write all code** with detailed comments
3. **Configure all environments** (development and production)
4. **Set up cloud deployments** on free/affordable platforms
5. **Provide step-by-step instructions** for every action
6. **Test and debug** all functionality
7. **Generate documentation** for maintenance and usage

---

## 🎯 PROJECT SPECIFICATION

### 1. PROJECT OVERVIEW

**Project Name:** `[Your Project Name]`  
**Project Type:** `[e.g., IoT Dashboard, E-commerce, CMS, Social Network, Analytics Platform]`  
**Target Users:** `[e.g., Businesses, Consumers, Administrators, IoT Device Operators]`  
**Primary Goal:** `[e.g., Monitor real-time sensor data, Manage inventory, Track analytics]`

**Detailed Description:**
```
[Provide 3-5 paragraphs describing:
- What problem does this application solve?
- Who are the end users?
- What are the main use cases?
- What makes this application unique?
- What is the expected scale? (10 users? 1000 users? 100k users?)]
```

---

### 2. CORE FEATURES REQUIRED

List all features your application MUST have:

#### **Feature 1:** `[Feature Name]`
- **Description:** `[What does this feature do?]`
- **User Story:** `[As a <user type>, I want to <action>, so that <benefit>]`
- **Acceptance Criteria:**
  - [ ] `[Specific requirement 1]`
  - [ ] `[Specific requirement 2]`
  - [ ] `[Specific requirement 3]`

#### **Feature 2:** `[Feature Name]`
- **Description:** `[What does this feature do?]`
- **User Story:** `[As a <user type>, I want to <action>, so that <benefit>]`
- **Acceptance Criteria:**
  - [ ] `[Specific requirement 1]`
  - [ ] `[Specific requirement 2]`

#### **Feature 3:** `[Feature Name]`
[Continue for all major features...]

**Example Features to Consider:**
- User authentication and authorization
- Real-time data visualization (charts, graphs, tables)
- CRUD operations (Create, Read, Update, Delete)
- File upload/download
- Data export (CSV, Excel, PDF)
- Search and filtering
- Notifications (email, in-app, push)
- Multi-language support
- Dark/light theme toggle
- User profile management
- Admin dashboard
- Analytics and reporting
- Payment integration (Stripe, PayPal)
- Third-party API integrations

---

### 3. TECHNICAL STACK PREFERENCES

**Frontend Framework:** `[React / Vue / Angular / Svelte / Next.js / Nuxt.js]`  
**Frontend Language:** `[TypeScript (recommended) / JavaScript]`  
**UI Component Library:** `[shadcn/ui / Material-UI / Ant Design / Chakra UI / Tailwind CSS]`  
**State Management:** `[Context API / Redux / Zustand / Pinia / Vuex]`

**Backend Framework:** `[Express.js / NestJS / FastAPI / Django / Flask / Ruby on Rails]`  
**Backend Language:** `[Node.js (JavaScript/TypeScript) / Python / Ruby / Go]`  
**API Style:** `[REST API / GraphQL / tRPC]`

**Database:** `[PostgreSQL / MongoDB / MySQL / SQLite / Firebase / Supabase]`  
**Database ORM:** `[Prisma / TypeORM / Sequelize / Mongoose / SQLAlchemy]`

**Authentication:** `[JWT / OAuth 2.0 / Auth0 / Firebase Auth / NextAuth.js / Supabase Auth]`  
**Real-time Communication:** `[WebSockets / Socket.io / Server-Sent Events / Pusher]`

**File Storage:** `[AWS S3 / Cloudinary / Supabase Storage / Firebase Storage / Local Storage]`  
**Email Service:** `[SendGrid / Mailgun / AWS SES / Resend / Nodemailer]`

**Frontend Deployment:** `[Vercel (recommended for React/Next) / Netlify / Cloudflare Pages / AWS Amplify]`  
**Backend Deployment:** `[Render.com (recommended) / Railway / Fly.io / Heroku / AWS EC2 / DigitalOcean]`  
**Database Hosting:** `[Same as backend / Supabase / MongoDB Atlas / PlanetScale / Neon]`

**Additional Tools:**
- **Version Control:** Git + GitHub
- **Package Manager:** npm / yarn / pnpm
- **Build Tool:** Vite / Webpack / Turbopack
- **Testing:** Jest / Vitest / Cypress / Playwright
- **Code Quality:** ESLint / Prettier / Husky

---

### 4. USER ROLES AND PERMISSIONS

Define all user types and their access levels:

#### **Role 1:** `[e.g., Admin]`
**Permissions:**
- [ ] `[e.g., Full access to all features]`
- [ ] `[e.g., Can manage users]`
- [ ] `[e.g., Can configure settings]`
- [ ] `[e.g., Can view analytics]`

#### **Role 2:** `[e.g., Operator]`
**Permissions:**
- [ ] `[e.g., Can view dashboards]`
- [ ] `[e.g., Can create reports]`
- [ ] `[e.g., Cannot delete data]`

#### **Role 3:** `[e.g., Guest/Viewer]`
**Permissions:**
- [ ] `[e.g., Read-only access]`
- [ ] `[e.g., Can export data]`

---

### 5. DATA MODELS AND RELATIONSHIPS

Define all database tables/collections and their relationships:

#### **Model 1:** `[e.g., User]`
```
Fields:
- id: UUID (primary key)
- email: String (unique, required)
- password_hash: String (required)
- name: String (required)
- role: Enum [admin, operator, viewer]
- avatar_url: String (optional)
- created_at: Timestamp
- updated_at: Timestamp

Relationships:
- Has many: [e.g., Readings, Reports, Sessions]
- Belongs to: [e.g., Organization]
```

#### **Model 2:** `[e.g., Device/Product/Post]`
```
Fields:
- id: UUID (primary key)
- name: String (required)
- description: Text (optional)
- status: Enum [active, inactive, maintenance]
- metadata: JSON (optional)
- user_id: UUID (foreign key)
- created_at: Timestamp
- updated_at: Timestamp

Relationships:
- Belongs to: User
- Has many: [e.g., Readings, Comments, Tags]
```

#### **Model 3:** `[e.g., Readings/Orders/Posts]`
```
Fields:
[Define all fields with types and constraints]

Relationships:
[Define foreign keys and relations]
```

[Continue for all data models...]

---

### 6. API ENDPOINTS SPECIFICATION

Define all API routes your application needs:

#### **Authentication Endpoints**
```
POST   /api/auth/register        - Create new user account
POST   /api/auth/login           - Login with email/password
POST   /api/auth/logout          - Logout current session
GET    /api/auth/me              - Get current user profile
PUT    /api/auth/profile         - Update user profile
POST   /api/auth/change-password - Change user password
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password with token
```

#### **Resource Endpoints (Example: Devices)**
```
GET    /api/devices              - List all devices (with pagination, filtering, sorting)
POST   /api/devices              - Create new device
GET    /api/devices/:id          - Get device by ID
PUT    /api/devices/:id          - Update device
DELETE /api/devices/:id          - Delete device
GET    /api/devices/:id/stats    - Get device statistics
```

#### **Data Endpoints (Example: Readings)**
```
POST   /api/readings             - Create new reading (from IoT device)
GET    /api/readings/latest      - Get latest readings
GET    /api/readings             - Get readings with time range filter
DELETE /api/readings             - Bulk delete old readings
```

#### **Analytics Endpoints**
```
GET    /api/analytics/summary    - Get aggregated statistics
GET    /api/analytics/trends     - Get time-series trends
GET    /api/analytics/reports    - Generate custom reports
```

#### **Export Endpoints**
```
GET    /api/export/csv           - Export data as CSV
GET    /api/export/excel         - Export data as Excel
GET    /api/export/pdf           - Export data as PDF
```

#### **Admin Endpoints**
```
GET    /api/admin/users          - List all users
PATCH  /api/admin/users/:id      - Update user role/status
DELETE /api/admin/users/:id      - Delete user
GET    /api/admin/logs           - View system logs
```

#### **Real-time Endpoints**
```
GET    /api/stream               - Server-Sent Events for live updates
WS     /api/ws                   - WebSocket connection
```

[Add all other endpoints your application needs...]

---

### 7. USER INTERFACE PAGES

List all pages/screens your application needs:

#### **Public Pages (No Authentication Required)**
- [ ] **Landing Page** (`/`) - Marketing homepage with features, pricing, CTA
- [ ] **Login Page** (`/login`) - Email/password login form
- [ ] **Register Page** (`/register`) - User signup form
- [ ] **Forgot Password Page** (`/forgot-password`) - Password reset request
- [ ] **About Page** (`/about`) - About the application
- [ ] **Contact Page** (`/contact`) - Contact form
- [ ] **Pricing Page** (`/pricing`) - Pricing plans (if applicable)

#### **Authenticated Pages (Login Required)**
- [ ] **Dashboard Home** (`/dashboard`) - Main overview with key metrics
- [ ] **[Resource] List** (`/dashboard/[resources]`) - Table view with search/filter
- [ ] **[Resource] Detail** (`/dashboard/[resources]/:id`) - Single item view
- [ ] **[Resource] Create** (`/dashboard/[resources]/new`) - Create new item form
- [ ] **[Resource] Edit** (`/dashboard/[resources]/:id/edit`) - Edit item form
- [ ] **Analytics Page** (`/dashboard/analytics`) - Charts and graphs
- [ ] **Reports Page** (`/dashboard/reports`) - Generate and view reports
- [ ] **Settings Page** (`/dashboard/settings`) - User preferences and configuration
- [ ] **Profile Page** (`/dashboard/profile`) - User profile management
- [ ] **Data Export Page** (`/dashboard/export`) - Download data in various formats

#### **Admin Pages (Admin Role Only)**
- [ ] **Admin Dashboard** (`/admin`) - Admin overview
- [ ] **User Management** (`/admin/users`) - Manage all users
- [ ] **System Settings** (`/admin/settings`) - Configure application
- [ ] **Logs & Monitoring** (`/admin/logs`) - View system logs

[Add all other pages your application needs...]

---

### 8. UI/UX REQUIREMENTS

#### **Design System**
- **Color Scheme:** `[e.g., Dark theme by default, Light theme available, Brand colors: #hexcodes]`
- **Typography:** `[e.g., Inter/Roboto/Poppins for body, Montserrat for headings]`
- **Spacing:** `[e.g., 8px base unit, consistent padding/margins]`
- **Border Radius:** `[e.g., 8px for cards, 4px for buttons]`

#### **Responsive Design**
- [ ] **Mobile First:** Works perfectly on 320px+ screens
- [ ] **Tablet Optimized:** Adapted layout for 768px+ screens
- [ ] **Desktop Enhanced:** Full features on 1024px+ screens
- [ ] **4K Ready:** Scales properly on high-resolution displays

#### **Accessibility**
- [ ] **WCAG 2.1 AA Compliant:** Proper contrast ratios
- [ ] **Keyboard Navigation:** All features accessible via keyboard
- [ ] **Screen Reader Support:** Proper ARIA labels
- [ ] **Focus Indicators:** Clear visual focus states

#### **User Experience**
- [ ] **Loading States:** Skeleton screens, spinners, progress bars
- [ ] **Error States:** User-friendly error messages
- [ ] **Empty States:** Helpful messages when no data
- [ ] **Success Feedback:** Toast notifications, success messages
- [ ] **Confirmation Dialogs:** For destructive actions
- [ ] **Form Validation:** Real-time inline validation
- [ ] **Tooltips:** Contextual help for complex features

---

### 9. INTERNATIONALIZATION (i18n)

**Languages Required:**
- [ ] `[e.g., English (en) - Default]`
- [ ] `[e.g., Spanish (es)]`
- [ ] `[e.g., French (fr)]`
- [ ] `[e.g., German (de)]`
- [ ] `[e.g., Japanese (ja)]`
- [ ] `[e.g., Chinese Simplified (zh)]`
- [ ] `[Add all languages you need...]`

**Translation Scope:**
- [ ] All UI elements (buttons, labels, menus)
- [ ] All error messages
- [ ] All validation messages
- [ ] All email templates
- [ ] All notification messages
- [ ] Date/time formatting per locale
- [ ] Number/currency formatting per locale

---

### 10. SECURITY REQUIREMENTS

#### **Authentication Security**
- [ ] **Password Hashing:** bcrypt with salt rounds ≥10
- [ ] **JWT Tokens:** Short-lived access tokens (15min), long-lived refresh tokens (7days)
- [ ] **Token Storage:** HttpOnly cookies or secure localStorage
- [ ] **Password Requirements:** Min 8 chars, uppercase, lowercase, number, special char
- [ ] **Brute Force Protection:** Rate limiting on auth endpoints
- [ ] **Account Lockout:** After 5 failed login attempts

#### **API Security**
- [ ] **CORS:** Whitelist specific origins (no wildcard in production)
- [ ] **Rate Limiting:** Max requests per IP per time window
- [ ] **Input Validation:** Zod/Joi/Yup schema validation
- [ ] **SQL Injection Prevention:** Parameterized queries or ORM
- [ ] **XSS Prevention:** Sanitize user inputs
- [ ] **CSRF Protection:** CSRF tokens for state-changing requests

#### **Data Security**
- [ ] **HTTPS Only:** Force SSL/TLS in production
- [ ] **Environment Variables:** Sensitive data in .env files (never committed)
- [ ] **Database Encryption:** Encrypt sensitive fields at rest
- [ ] **Audit Logs:** Log all critical actions with timestamps

---

### 11. PERFORMANCE REQUIREMENTS

#### **Frontend Performance**
- [ ] **First Contentful Paint:** < 1.5 seconds
- [ ] **Lighthouse Score:** > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] **Bundle Size:** < 500KB initial load
- [ ] **Code Splitting:** Lazy load routes and heavy components
- [ ] **Image Optimization:** WebP format, lazy loading, responsive sizes
- [ ] **Caching:** Service worker for offline support

#### **Backend Performance**
- [ ] **API Response Time:** < 200ms for simple queries, < 1s for complex
- [ ] **Database Queries:** Indexed columns for frequent queries
- [ ] **Pagination:** Max 100 items per page
- [ ] **Caching:** Redis/in-memory cache for frequent reads
- [ ] **Connection Pooling:** Database connection reuse

---

### 12. DEPLOYMENT REQUIREMENTS

#### **Frontend Deployment (Vercel/Netlify)**
- [ ] **Automatic Deploys:** On git push to main branch
- [ ] **Environment Variables:** Configured via platform dashboard
- [ ] **Custom Domain:** `[e.g., app.yourdomain.com]` (if you have one)
- [ ] **SSL Certificate:** Auto-provisioned by platform
- [ ] **CDN:** Global edge network for fast loading

#### **Backend Deployment (Render/Railway)**
- [ ] **Automatic Deploys:** On git push to main branch
- [ ] **Environment Variables:** Configured via platform dashboard
- [ ] **Health Checks:** Endpoint to verify server is running
- [ ] **Persistent Storage:** For database files or uploads
- [ ] **Auto-Scaling:** If needed for high traffic

#### **Database Deployment**
- [ ] **Hosted Database:** Managed service or self-hosted
- [ ] **Automatic Backups:** Daily backups with 7-day retention
- [ ] **Connection Security:** SSL/TLS encrypted connections

#### **CI/CD Pipeline**
- [ ] **GitHub Actions:** Automated testing on pull requests
- [ ] **Linting:** ESLint/Prettier checks before merge
- [ ] **Type Checking:** TypeScript compilation check
- [ ] **Build Verification:** Ensure build succeeds before deploy

---

### 13. IoT/HARDWARE INTEGRATION (If Applicable)

**Hardware Device:** `[e.g., ESP32, Raspberry Pi, Arduino, Custom sensor]`  
**Communication Protocol:** `[e.g., HTTP REST API, MQTT, WebSocket, Serial]`  
**Data Transmission Frequency:** `[e.g., Every 5 seconds, Every minute, On event]`

**Sensor Data Format:**
```json
{
  "device_id": "meter-001",
  "timestamp": 1732234567890,
  "readings": {
    "[sensor_1]": "[value_type]",
    "[sensor_2]": "[value_type]",
    "[sensor_3]": "[value_type]"
  }
}
```

**Device Authentication:**
- [ ] **API Key:** Device sends API key in header
- [ ] **Certificate:** mTLS certificate-based auth
- [ ] **OAuth:** Device uses OAuth 2.0 client credentials

**Firmware Requirements:**
- [ ] **WiFi Configuration:** SSID and password
- [ ] **API Endpoint:** Cloud backend URL
- [ ] **Error Handling:** Retry logic for failed transmissions
- [ ] **Local Storage:** Buffer data during network outages

---

### 14. THIRD-PARTY INTEGRATIONS

List all external services your application needs to integrate with:

#### **Integration 1:** `[e.g., OpenWeatherMap API]`
- **Purpose:** `[e.g., Get weather data for location-based features]`
- **API Key Required:** Yes
- **Documentation:** `[API docs URL]`
- **Endpoints Used:** `[List specific endpoints]`

#### **Integration 2:** `[e.g., Stripe Payment]`
- **Purpose:** `[e.g., Process payments for premium features]`
- **API Key Required:** Yes (Test + Production)
- **Webhooks:** `[e.g., Payment success, subscription cancelled]`

#### **Integration 3:** `[e.g., SendGrid Email]`
- **Purpose:** `[e.g., Send transactional emails]`
- **API Key Required:** Yes
- **Email Types:** `[Welcome email, Password reset, Notifications]`

[Add all integrations you need...]

---

### 15. TESTING REQUIREMENTS

#### **Unit Tests**
- [ ] **Backend Services:** Test business logic functions
- [ ] **Frontend Components:** Test UI components in isolation
- [ ] **API Endpoints:** Test request/response handling
- [ ] **Database Queries:** Test CRUD operations

#### **Integration Tests**
- [ ] **API Flow:** Test complete request flows
- [ ] **Authentication:** Test login/logout/token refresh
- [ ] **Database Transactions:** Test multi-step operations

#### **End-to-End Tests**
- [ ] **User Journeys:** Test complete user workflows
- [ ] **Critical Paths:** Registration → Login → Core Feature → Logout

#### **Manual Testing Checklist**
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS (iPhone, iPad)
- [ ] Test on Android (phone, tablet)
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Test keyboard-only navigation
- [ ] Test with slow 3G connection
- [ ] Test with adblocker enabled

---

### 16. DOCUMENTATION REQUIREMENTS

Create the following documentation files:

- [ ] **README.md** - Project overview, setup instructions, tech stack
- [ ] **SETUP.md** - Detailed local development setup guide
- [ ] **DEPLOYMENT.md** - Production deployment guide (Vercel + Render)
- [ ] **API.md** - Complete API endpoint documentation
- [ ] **ARCHITECTURE.md** - System architecture and design decisions
- [ ] **CONTRIBUTING.md** - Guidelines for contributors
- [ ] **CHANGELOG.md** - Version history and release notes
- [ ] **TROUBLESHOOTING.md** - Common issues and solutions
- [ ] **ENV_VARIABLES.md** - All environment variables explained

---

### 17. SAMPLE DATA AND SEEDING

Provide sample data for testing and demonstration:

**Sample Users:**
```
Admin User:
- Email: admin@example.com
- Password: Admin123!
- Role: admin

Test User:
- Email: user@example.com
- Password: User123!
- Role: operator
```

**Sample Records:**
```
[Provide 10-20 sample records for each main data model]
Example:
- 10 sample devices with realistic names and data
- 100 sample readings with varied values
- 5 sample reports
```

---

### 18. ERROR SCENARIOS TO HANDLE

List all error scenarios the application must handle gracefully:

#### **Authentication Errors**
- [ ] Invalid credentials
- [ ] Expired token
- [ ] Account locked
- [ ] Email already exists
- [ ] Weak password

#### **API Errors**
- [ ] Network timeout
- [ ] Server unavailable (5xx)
- [ ] Rate limit exceeded
- [ ] Invalid request format
- [ ] Unauthorized access
- [ ] Resource not found (404)

#### **Data Errors**
- [ ] Validation failed
- [ ] Duplicate entry
- [ ] Foreign key constraint
- [ ] Database connection lost
- [ ] Insufficient permissions

#### **UI Errors**
- [ ] Image failed to load
- [ ] Form submission failed
- [ ] File upload too large
- [ ] Invalid file type
- [ ] Session expired

---

### 19. BUDGET AND COST CONSTRAINTS

**Development Budget:** `[Free / $X per month / $X total]`  
**Hosting Budget:** `[Free tier only / Up to $X per month]`  
**Third-party Services:** `[Free tier only / Up to $X per month]`

**Preferred Free Services:**
- Frontend: Vercel (100GB bandwidth/month free)
- Backend: Render.com (750 hours/month free)
- Database: Supabase (500MB free) or SQLite (free)
- Storage: Cloudinary (25GB free)
- Email: SendGrid (100 emails/day free)
- Monitoring: Sentry (5k errors/month free)

---

### 20. TIMELINE AND MILESTONES

**Target Completion:** `[e.g., 2 weeks, 1 month, 3 months]`

**Phase 1: Foundation (Days 1-3)**
- [ ] Project structure and boilerplate
- [ ] Database schema and models
- [ ] Authentication system
- [ ] Basic API endpoints

**Phase 2: Core Features (Days 4-7)**
- [ ] Frontend routing and pages
- [ ] CRUD operations for main resources
- [ ] Real-time data streaming
- [ ] Data visualization

**Phase 3: Advanced Features (Days 8-10)**
- [ ] Analytics and reporting
- [ ] Data export functionality
- [ ] Admin dashboard
- [ ] Multi-language support

**Phase 4: Polish and Deploy (Days 11-14)**
- [ ] UI/UX refinements
- [ ] Testing and bug fixes
- [ ] Cloud deployment
- [ ] Documentation

---

## 🤖 AI INSTRUCTIONS

Now that I've provided complete specifications, please proceed with the following systematic approach:

### STEP 1: PROJECT PLANNING (First Response)
Before writing any code, provide me with:

1. **Architecture Diagram (Text-Based):**
   - Show the relationship between frontend, backend, database, and external services
   - Explain the data flow from user interaction to data persistence

2. **Technology Stack Confirmation:**
   - List all technologies you'll use with brief justification
   - Highlight any alternative suggestions if my choices have issues

3. **Project Structure:**
   - Show the complete folder structure for frontend and backend
   - Explain the purpose of each major folder

4. **Implementation Plan:**
   - Break down the work into 10-15 concrete tasks
   - Estimate complexity (simple/medium/complex) for each task
   - Suggest the order of implementation

5. **Potential Challenges:**
   - Identify any technical challenges or limitations
   - Suggest solutions or workarounds

**Wait for my approval before proceeding to Step 2.**

---

### STEP 2: ENVIRONMENT SETUP
Once I approve the plan, create:

1. **Frontend Project:**
   - Initialize project with chosen framework
   - Install all dependencies
   - Set up TypeScript configuration
   - Configure linting and formatting
   - Create `.env.example` file

2. **Backend Project:**
   - Initialize project with chosen framework
   - Install all dependencies
   - Set up TypeScript configuration (if applicable)
   - Configure environment variables
   - Create `.env.example` file

3. **Development Scripts:**
   - Create `package.json` scripts for dev, build, test, lint
   - Create start scripts (`.bat` for Windows, `.sh` for Mac/Linux)

4. **Git Repository:**
   - Initialize Git
   - Create `.gitignore` file
   - Create initial commit structure

**Provide commands I need to run for each step.**

---

### STEP 3: DATABASE SETUP
1. **Database Schema:**
   - Write SQL migration files or ORM schemas
   - Include all tables, columns, relationships, indexes
   - Add seed data for testing

2. **Database Connection:**
   - Create database connection module
   - Implement connection pooling
   - Add error handling

3. **Data Models:**
   - Create model files for each entity
   - Include validation rules
   - Add helper methods (if needed)

**Test database connection and confirm it works.**

---

### STEP 4: AUTHENTICATION SYSTEM
1. **User Model:**
   - Create user table/model
   - Implement password hashing

2. **Auth Endpoints:**
   - Register, Login, Logout, Token Refresh
   - Password reset flow

3. **Middleware:**
   - JWT verification middleware
   - Role-based access control
   - Rate limiting

4. **Frontend Auth:**
   - Login/Register pages
   - Auth context/store
   - Protected routes
   - Token management

**Test: Create user, login, access protected route, logout.**

---

### STEP 5: CORE API ENDPOINTS
For each major resource, implement:

1. **CRUD Endpoints:**
   - List (with pagination, filtering, sorting)
   - Create
   - Read (single item)
   - Update
   - Delete

2. **Validation:**
   - Input validation with Zod/Joi
   - Error responses

3. **Testing:**
   - Test each endpoint with sample data

**Implement one resource completely, then test before moving to next.**

---

### STEP 6: FRONTEND UI IMPLEMENTATION
1. **Layout Components:**
   - App shell (header, sidebar, main content)
   - Navigation menu
   - User dropdown
   - Theme toggle

2. **Page Components:**
   - Dashboard home
   - List pages (tables with search/filter)
   - Detail pages
   - Create/Edit forms
   - Settings page

3. **UI Components:**
   - Buttons, inputs, cards, modals, etc.
   - Loading states
   - Error states
   - Empty states

4. **Data Fetching:**
   - API client setup
   - Loading indicators
   - Error handling
   - Caching (if applicable)

**Build and test each page individually.**

---

### STEP 7: REAL-TIME FEATURES (If Applicable)
1. **Backend WebSocket/SSE Server:**
   - Set up Socket.io or SSE endpoint
   - Implement event broadcasting

2. **Frontend Client:**
   - Connect to WebSocket/SSE
   - Handle incoming events
   - Update UI in real-time

**Test: Send data from backend, verify it appears on frontend instantly.**

---

### STEP 8: ADVANCED FEATURES
1. **Analytics:**
   - Aggregate data queries
   - Chart components
   - Time range filtering

2. **Data Export:**
   - CSV export endpoint
   - Excel export endpoint
   - PDF export (if required)

3. **Notifications:**
   - In-app notification system
   - Email notification setup
   - Push notifications (if required)

4. **Admin Features:**
   - User management UI
   - System settings
   - Logs viewer

**Test each feature thoroughly.**

---

### STEP 9: INTERNATIONALIZATION (If Required)
1. **i18n Setup:**
   - Install i18n library (react-i18next, vue-i18n, etc.)
   - Create translation files for each language

2. **Translation Files:**
   - Extract all hardcoded strings
   - Create JSON files for each language
   - Translate all strings

3. **Language Switcher:**
   - Add language selector UI
   - Persist language preference

**Test: Switch languages and verify all text changes.**

---

### STEP 10: TESTING AND BUG FIXES
1. **Manual Testing:**
   - Go through every user flow
   - Test on different browsers
   - Test on mobile devices
   - Test error scenarios

2. **Automated Tests:**
   - Write unit tests for critical functions
   - Write integration tests for API endpoints
   - Write E2E tests for critical user journeys

3. **Performance Testing:**
   - Check page load times
   - Check API response times
   - Optimize slow queries/components

4. **Security Audit:**
   - Review authentication flow
   - Check for XSS vulnerabilities
   - Verify CORS settings
   - Test rate limiting

**Fix all critical bugs before deployment.**

---

### STEP 11: CLOUD DEPLOYMENT
1. **Frontend Deployment (Vercel/Netlify):**
   - Connect GitHub repository
   - Configure build settings
   - Add environment variables
   - Deploy and verify

2. **Backend Deployment (Render/Railway):**
   - Connect GitHub repository
   - Configure build/start commands
   - Add environment variables
   - Set up persistent storage (if needed)
   - Deploy and verify

3. **Database Deployment:**
   - Set up hosted database (if not using SQLite)
   - Run migrations
   - Seed initial data

4. **Domain Configuration:**
   - Configure custom domain (if applicable)
   - Set up SSL certificate

5. **Environment Variables:**
   - Update frontend with production backend URL
   - Update backend with production database URL
   - Update CORS settings with production frontend URL

**Test: Access production URLs and verify everything works.**

---

### STEP 12: DOCUMENTATION
Create comprehensive documentation:

1. **README.md:**
   - Project description
   - Features list
   - Tech stack
   - Screenshots
   - Quick start guide

2. **Setup Guide:**
   - Prerequisites
   - Installation steps
   - Configuration
   - Running locally

3. **Deployment Guide:**
   - Frontend deployment steps
   - Backend deployment steps
   - Environment variables
   - Troubleshooting

4. **API Documentation:**
   - All endpoints
   - Request/response examples
   - Authentication
   - Error codes

5. **User Guide:**
   - How to use each feature
   - Screenshots
   - FAQs

**Ensure documentation is clear for someone with no coding knowledge.**

---

### STEP 13: HANDOFF AND TRAINING
Provide:

1. **Project Walkthrough:**
   - Explain folder structure
   - Explain key files and their purposes
   - Explain how to make common changes

2. **Maintenance Guide:**
   - How to add a new page
   - How to add a new API endpoint
   - How to add a new database table
   - How to update dependencies
   - How to troubleshoot common issues

3. **Backup Strategy:**
   - How to backup database
   - How to backup uploaded files
   - How to rollback deployments

4. **Monitoring:**
   - Set up error tracking (Sentry/Rollbar)
   - Set up uptime monitoring (UptimeRobot)
   - Set up analytics (Google Analytics)

**Ensure I can maintain the application after you're done.**

---

## 📝 IMPORTANT GUIDELINES FOR AI

### Code Quality Standards
- **Comments:** Add comments for complex logic, explaining WHY not WHAT
- **Naming:** Use descriptive variable/function names
- **Formatting:** Follow language-specific conventions (camelCase for JS, snake_case for Python)
- **Error Handling:** Use try-catch blocks, return meaningful error messages
- **Security:** Never hardcode secrets, always validate inputs, use parameterized queries
- **Performance:** Optimize database queries, avoid N+1 problems, lazy load when possible

### File Organization
- **Keep files small:** Max 300 lines per file, split into multiple files if needed
- **Group related code:** All auth code in auth folder, all user code in user folder
- **Consistent structure:** Use same patterns across frontend and backend

### User Experience
- **Loading states:** Show skeleton screens or spinners during data fetching
- **Error messages:** User-friendly messages, not technical jargon
- **Success feedback:** Toast notifications for successful actions
- **Confirmation dialogs:** Ask before deleting or irreversible actions
- **Responsive design:** Must work on mobile, tablet, and desktop

### Communication Style
- **Explain everything:** Assume I have zero coding knowledge
- **Provide commands:** Give exact terminal commands to run
- **Show examples:** Include sample requests/responses for APIs
- **Offer alternatives:** If something doesn't work, suggest Plan B
- **Check understanding:** Ask if I understand before moving to next step

### Incremental Progress
- **Build in iterations:** Get one feature working before moving to next
- **Test frequently:** Test after each major change
- **Commit often:** Create Git commits after each working feature
- **Deploy early:** Deploy to cloud as soon as basic functionality works
- **Get feedback:** Ask me to test and provide feedback

---

## 🎯 SUCCESS CRITERIA

The project is complete when:

✅ **All features implemented:** Every feature in my specification works  
✅ **Deployed to cloud:** Both frontend and backend are accessible via HTTPS URLs  
✅ **Database populated:** Sample data exists for testing  
✅ **Authentication works:** I can register, login, logout successfully  
✅ **Responsive design:** Works on mobile and desktop  
✅ **Error handling:** Doesn't crash on invalid inputs  
✅ **Documentation complete:** I can understand and maintain the code  
✅ **Performance acceptable:** Pages load in < 3 seconds  
✅ **Security implemented:** Passwords hashed, JWT auth, CORS configured  
✅ **Testing passed:** Manual testing of all features successful  

---

## 🚨 FAILURE SCENARIOS TO AVOID

**DO NOT:**
- ❌ Skip error handling
- ❌ Hardcode secrets in code
- ❌ Use outdated or vulnerable dependencies
- ❌ Deploy without testing
- ❌ Ignore mobile responsiveness
- ❌ Create incomplete documentation
- ❌ Build without proper authentication
- ❌ Use inefficient database queries
- ❌ Ignore accessibility (WCAG compliance)
- ❌ Create UI with poor contrast or tiny fonts

---

## 🤝 COLLABORATION APPROACH

**I will:**
- ✅ Provide clear specifications
- ✅ Answer questions about requirements
- ✅ Test features as you build them
- ✅ Give feedback on design/UX
- ✅ Approve before moving to next phase

**You (AI) should:**
- ✅ Ask clarifying questions if specifications are unclear
- ✅ Suggest improvements to my requirements
- ✅ Warn me about potential issues
- ✅ Provide alternatives when something doesn't work
- ✅ Explain technical decisions in simple terms
- ✅ Break down complex tasks into smaller steps
- ✅ Test code before presenting it to me
- ✅ Provide exact commands and instructions
- ✅ Create clear, well-commented code

---

## ⚡ QUICK START CHECKLIST

Before you begin, confirm:

- [ ] I've filled in all `[PLACEHOLDER]` values above
- [ ] I've specified all features I need
- [ ] I've chosen my tech stack preferences
- [ ] I've defined all user roles and permissions
- [ ] I've listed all pages my application needs
- [ ] I've specified all API endpoints required
- [ ] I've described all data models and relationships
- [ ] I've set my budget constraints
- [ ] I've defined my timeline expectations
- [ ] I understand that I'll need to test and approve each phase

**If all boxes are checked, let's begin!**

---

# 🎬 START BUILDING NOW

I've provided complete specifications above. Please analyze everything carefully and then:

1. **Ask any clarifying questions** you have about my requirements
2. **Provide the Architecture Diagram and Implementation Plan** (Step 1)
3. **Wait for my approval** before starting to write code

Remember: I have no coding knowledge, so explain everything clearly and provide step-by-step instructions for every command I need to run.

Let's build an amazing application together! 🚀

---

# END OF PROMPT

---

## 📚 APPENDIX: EXAMPLE PROJECTS

Use this template for projects like:

- **IoT Dashboards:** Smart home, industrial monitoring, energy management
- **SaaS Applications:** CRM, project management, invoicing
- **E-commerce:** Online stores, marketplaces, inventory management
- **Social Platforms:** Forums, blogs, social networks
- **Analytics Tools:** Data visualization, reporting, metrics tracking
- **Booking Systems:** Appointments, reservations, scheduling
- **Content Management:** CMS, documentation, knowledge base
- **Educational Platforms:** LMS, course management, quizzes
- **Financial Tools:** Expense tracking, budgeting, invoicing
- **Healthcare Apps:** Patient management, appointment booking, telemedicine

---

## 🔄 VERSION HISTORY

**v2.0 (November 2025):**
- Complete restructure based on IoT Smart Meter Dashboard project
- Added comprehensive sections for all aspects of full-stack development
- Included detailed AI instructions and success criteria
- Added cloud deployment best practices
- Enhanced security and performance requirements

**v1.0 (Initial):**
- Basic prompt template

---

## 📄 LICENSE

This template is provided as-is for educational and commercial use. Feel free to modify and distribute.

---

**Created by:** Smart Meter Dashboard Project Team  
**Last Updated:** November 22, 2025  
**Feedback:** https://github.com/Agnibha-31/IoT-based-Smart-Meter-Dashboard

---

**🎉 Good luck building your application!**
