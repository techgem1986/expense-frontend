# LedgerFlow - Expense Management System

A premium enterprise admin dashboard for managing expenses, built with React and Tailwind CSS.

## Features

- **Dashboard & Analytics** - Financial insights with interactive charts (Recharts)
- **Transaction Management** - Create, edit, delete, and filter transactions
- **Account Management** - Track multiple accounts with balance monitoring
- **Category Management** - Organize transactions with custom income/expense categories
- **Budget Tracking** - Set spending limits with progress visualization
- **Recurring Transactions** - Automate regular income and expense entries
- **Alerts & Notifications** - Stay informed about important financial events
- **Dark Mode** - Full dark theme support with system preference detection
- **Multi-Currency Support** - Handle transactions in different currencies

## Tech Stack

- **React 19** - UI framework with TypeScript
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Recharts** - Data visualization (charts)
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **Playwright** - End-to-end testing

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   └── index.ts
│   ├── accounts/     # Account management
│   ├── alerts/       # Alerts & notifications
│   ├── analytics/    # Dashboard & analytics
│   ├── auth/         # Login & registration
│   ├── budgets/      # Budget tracking
│   ├── categories/   # Category management
│   ├── recurring/    # Recurring transactions
│   └── transactions/ # Transaction management
├── layouts/          # Layout components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── contexts/         # React contexts
│   ├── AuthContext.tsx
│   ├── CurrencyContext.tsx
│   └── ThemeContext.tsx
├── hooks/            # Custom hooks
├── services/         # API services
├── types/            # TypeScript types
└── App.tsx
```

## Getting Started

### Prerequisites

- Node.js 26+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/techgem1986/expense-frontend.git
cd expense-frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Running Tests

```bash
# Run unit tests
npm test

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Design System

### Colors

| Name | Usage |
|------|-------|
| `primary` | Primary actions, links, accents (blue) |
| `success` | Positive values, income (green) |
| `warning` | Warnings, alerts (amber) |
| `danger` | Negative values, expenses, errors (red) |
| `neutral` | Secondary information (gray) |

### Components

The project includes a set of reusable UI components in `src/components/ui/`:

- **Card** - Container with header, content, and footer sections
- **Button** - Primary, secondary, and danger variants with loading states
- **Input** - Text inputs with labels, icons, and validation
- **Select** - Dropdown selects with options
- **Table** - Data tables with sorting, pagination, and row actions
- **Badge** - Status indicators with contextual colors
- **Modal** - Dialog overlays for forms and confirmations

### Dark Mode

The application supports dark mode with a toggle in the top navigation bar. Theme preference is persisted in localStorage and respects system preferences.

## API Integration

The application communicates with a REST API. Configure the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_BASE_URL` | Backend API base URL |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Design inspired by Adminty dashboard UI
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)