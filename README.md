# Mini Personal CRM

A full-featured CRM web application built as a portfolio project to showcase modern Angular development practices. Manage contacts, deals, tasks, and users — all with a clean UI, dark mode, and role-based access control.

## Tech Stack

- **Angular 20** — Zoneless, standalone components, Signals, `OnPush` change detection
- **TailwindCSS v3** — Utility-first styling with full dark mode support (`darkMode: 'class'`)
- **Angular CDK** — Drag & drop for the Kanban deal board
- **Chart.js** — Dashboard charts (bar + doughnut)
- **RxJS** — Reactive data flows and HTTP interactions
- **json-server** — REST API mock backend

## Features

- **Authentication** — Login with JWT-based auth, route guards and HTTP interceptors
- **Contacts** — List, create, edit, delete contacts with status filtering and search
- **Deals** — Kanban board with drag & drop between pipeline stages
- **Tasks** — Task list with priority/status filters and due date tracking
- **Dashboard** — Summary cards and charts with deal pipeline and task breakdown
- **Admin** — User management with role-based access (admin / user)
- **Dark Mode** — System-aware toggle persisted to localStorage
- **Global Search** — Cross-entity search from the navbar
- **Unit Tests** — Component and service tests with Jasmine/Karma

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start both the API server and Angular dev server
npm run dev
```

The app will be available at `http://localhost:4200` and the API at `http://localhost:3000`.

### Individual commands

```bash
npm start          # Angular dev server only
npm run server     # json-server API only
npm test           # Run unit tests
npm run build      # Production build
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth & role guards
│   │   ├── interceptors/    # JWT & error interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Business logic & API calls
│   └── features/
│       ├── auth/            # Login page
│       ├── contacts/        # Contact list, detail, form
│       ├── deals/           # Kanban board & deal form
│       ├── tasks/           # Task list & form
│       ├── dashboard/       # Charts & summary cards
│       └── admin/           # User management
└── styles.scss
```

## Angular Patterns Used

- `input()` / `output()` signal-based component API
- `computed()` for derived state
- `inject()` function for dependency injection
- Native control flow (`@if`, `@for`, `@switch`)
- Lazy-loaded feature routes
- `ChangeDetectionStrategy.OnPush` on all components
