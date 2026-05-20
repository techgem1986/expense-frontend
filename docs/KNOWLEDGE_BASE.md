# Expense Frontend - Knowledge Base

> **Last Updated:** 2024-05-20
>
> Frontend-specific knowledge for the Expense Management System.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI Framework |
| TypeScript | 4.9.5 | Type Safety |
| React Router | 7.13.2 | Client-side Routing |
| Material-UI | 7.3.9 | UI Components |
| Axios | 1.14.0 | HTTP Client |
| React Hook Form | 7.72.0 | Form Management |
| Yup | 1.7.1 | Form Validation |
| Chart.js | 4.5.1 | Data Visualization |
| date-fns | 4.1.0 | Date Utilities |
| Tailwind CSS | — | Utility-first CSS |
| React Query | — | Data fetching & caching |
| Playwright | 1.59.1 | E2E Testing |
| Prettier | — | Code formatting |
| ESLint | — | Code linting |

---

## Project Structure

```
expense-frontend/
├── public/                       # Static assets
│   ├── index.html               # HTML entry point
│   ├── _redirects               # Render.com SPA routing fix
│   ├── manifest.json            # PWA manifest
│   └── robots.txt               # SEO
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx       # With Button.test.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── Input.tsx        # With Input.test.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   ├── accounts/            # Account management UI
│   │   │   └── AccountList.tsx
│   │   ├── alerts/              # Alert management UI
│   │   │   └── AlertList.tsx
│   │   ├── analytics/           # Dashboard and charts
│   │   │   └── Dashboard.tsx
│   │   ├── auth/                # Login/Register components
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── budgets/             # Budget management UI
│   │   │   ├── BudgetForm.tsx
│   │   │   └── BudgetList.tsx
│   │   ├── categories/          # Category management UI
│   │   │   ├── CategoryForm.tsx
│   │   │   └── CategoryList.tsx
│   │   ├── recurring/           # Recurring transaction UI
│   │   │   ├── RecurringTransactionForm.tsx
│   │   │   └── RecurringTransactionList.tsx
│   │   ├── transactions/        # Transaction management UI
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── CurrencySelector.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state (+ AuthContext.test.tsx)
│   │   ├── CurrencyContext.tsx  # Currency preferences
│   │   └── ThemeContext.tsx     # Theme preferences
│   ├── hooks/                   # Custom React hooks
│   ├── layouts/                 # Layout components
│   │   ├── Layout.tsx           # Main layout with navigation
│   │   ├── Sidebar.tsx          # Side navigation
│   │   └── Topbar.tsx           # Top navigation bar
│   ├── services/                # API service layer
│   │   ├── api.ts              # Axios config and API endpoints
│   │   └── errorUtils.ts       # Error handling utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts            # Main type definitions
│   │   ├── account.ts          # Account types
│   │   └── currency.ts         # Currency types
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Entry point
│   ├── index.css                # Global styles
│   └── react-app-env.d.ts      # React type declarations
├── tests/                       # Playwright E2E tests
├── Dockerfile                   # Docker build with nginx
├── nginx.conf                   # nginx config for SPA routing
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
├── lint-staged.config.json
└── README.md
```

---

## Key Features

### 1. Authentication
- User registration and login
- JWT token-based authentication
- Protected routes with redirect to login
- Session persistence in localStorage
- Context: `AuthContext.tsx`

### 2. Dashboard/Analytics
- Spending trends visualization (Chart.js)
- Category breakdown doughnut chart
- Monthly income vs expense bar chart
- Summary cards: Total Income, Total Expenses, Net Balance, Save Rate
- Date range filtering
- **Component**: `Dashboard.tsx`

### 3. Transaction Management
- Create, read, update, delete transactions
- Categorize transactions (Income/Expense)
- Filter and sort transactions
- Pagination support
- **Components**: `TransactionList.tsx`, `TransactionForm.tsx`

### 4. Recurring Transactions
- Set up automated recurring transactions
- Monthly frequency support
- Active/inactive status management
- Next execution date tracking
- **Components**: `RecurringTransactionList.tsx`, `RecurringTransactionForm.tsx`

### 5. Budget Management
- Create budgets with spending limits
- Set alert thresholds (default 80%)
- Track current spending vs budget
- Visual indicators: green (< 80%), yellow (80-100%), red (> 100%)
- **Components**: `BudgetList.tsx`, `BudgetForm.tsx`

### 6. Category Management
- Create custom categories
- Categorize as Income or Expense
- Edit and delete categories
- **Components**: `CategoryList.tsx`, `CategoryForm.tsx`

### 7. Alert System
- Budget threshold alerts
- Unread alert count
- Mark alerts as read
- **Component**: `AlertList.tsx`

### 8. Theme Support
- Dark/Light theme toggle (`ThemeToggle.tsx`)
- Persistent theme preference (`ThemeContext.tsx`)

### 9. Currency Support
- Multi-currency display and conversion (`CurrencySelector.tsx`)
- Currency preference context (`CurrencyContext.tsx`)

---

## API Integration

**Base URL**: `process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'` (configured in `src/services/api.ts`)

### API Endpoints

**Authentication:**
- `POST /auth/register`
- `POST /auth/login`

**Users:**
- `GET /users/profile`
- `GET /users/:userId`

**Categories:**
- `GET /categories`
- `GET /categories/type/:type`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

**Transactions:**
- `GET /transactions?page=&size=&sort=`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

**Recurring Transactions:**
- `GET /recurring-transactions`
- `POST /recurring-transactions`
- `PUT /recurring-transactions/:id`
- `DELETE /recurring-transactions/:id`

**Budgets:**
- `GET /budgets?page=&size=&sort=`
- `POST /budgets`
- `PUT /budgets/:id`
- `DELETE /budgets/:id`
- `GET /budgets/check-threshold/:categoryId`

**Alerts:**
- `GET /alerts?page=&size=&sort=`
- `GET /alerts/unread`
- `GET /alerts/unread/count`
- `PUT /alerts/:id/read`
- `PUT /alerts/read-all`
- `DELETE /alerts/:id`

**Analytics:**
- `GET /analytics`
- `GET /analytics/spending-by-category`
- `GET /analytics/current-month`
- `GET /analytics/year-to-date`
- `GET /analytics/export/{yearMonth}` — Excel download

---

## State Management

Three React Context providers manage global state:

### AuthContext
```typescript
{
  user,           // Current user object
  token,          // JWT token
  isLoading,      // Loading state
  login(),        // Login function
  register(),     // Registration function
  logout(),       // Logout function
  refreshUser()   // Refresh user data
}
```

### ThemeContext
```typescript
{
  theme,          // 'light' | 'dark'
  toggleTheme()   // Toggle theme function
}
```

### CurrencyContext
```typescript
{
  currency,       // Selected currency
  setCurrency()   // Set currency function
}
```

---

## UI Component Library

All reusable components in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| **Card** | Container with header, content, footer sections |
| **Button** | Primary/secondary/danger variants with loading states |
| **Input** | Text inputs with labels, icons, and validation |
| **Select** | Dropdown selects (noted for optional improvement) |
| **Table** | Data tables with sorting, pagination, row actions |
| **Badge** | Status indicators with contextual colors |
| **Modal** | Dialog overlays for forms and confirmations |
| **Pagination** | Page navigation controls |
| **DateRangeFilter** | Date range selection filter |

### Design System Colors
| Name | Usage |
|------|-------|
| `primary` | Primary actions, links, accents (blue) |
| `success` | Positive values, income (green) |
| `warning` | Warnings, alerts (amber) |
| `danger` | Negative values, expenses, errors (red) |
| `neutral` | Secondary information (gray) |

---

## Bugs & Fixes History

### 1. Transaction 400 Bad Request
- **Root Cause**: Frontend sends `amount` as `Double` numeric value; backend expects `BigDecimal`
- **Fix**: Convert `amount.toString()` before sending in API request
- **Affected File**: `src/services/api.ts`

### 2. Transaction Form Fixes
- **Accessibility**: Fixed `htmlFor`/`id` associations on form labels and inputs
- **Button Functionality**: Fixed submit button logic and validation
- **State Management**: Improved form state handling in `TransactionForm.tsx`

### 3. Render SPA Routing
- Static site hosting doesn't support React Router's client-side routing
- **Fix Options**:
  - Use HashRouter (no server changes needed)
  - Docker Web Service with nginx `try_files` directive
  - `_redirects` file in public directory (already present)

---

## Development Commands

```bash
# Start development server
npm start            # localhost:3000

# Build for production
npm run build

# Run unit tests
npm test

# Run Playwright E2E tests
npx playwright test
npx playwright test --ui

# Linting and formatting
npm run lint
npm run format
```

### Docker Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## SPA Routing Configuration

For production deployment (Render.com, etc.), the `public/_redirects` file and `nginx.conf` handle client-side routing:

**nginx.conf** (for Docker deployment):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Alternative**: Use `HashRouter` instead of `BrowserRouter` in `App.tsx`.

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)