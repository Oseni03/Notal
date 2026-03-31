# Notal

A multi-tenant SaaS notes application built with Next.js, demonstrating enterprise-grade multi-tenancy, authentication, and subscription management patterns.

## Overview

Notal is a production-ready multi-tenant application where multiple organizations (tenants) can securely manage their users and notes with complete data isolation. Built as a Next.js SaaS boilerplate with role-based access control and subscription feature gating.

---

## 🚀 Features

### Core Functionality

- **Multi-Tenancy** - Strict tenant isolation using shared schema with `organizationId` filtering
- **Notes Management** - Full CRUD operations with tenant-aware access control
- **Team Collaboration** - User invitations, role management, and permissions
- **JWT Authentication** - Secure token-based authentication with role-based authorization

### SaaS Features

- **Subscription Tiers**
    - **Free Plan**: 3 users, 50 notes limit
    - **Pro Plan**: Unlimited users and notes
- **Admin Controls** - Invite users and upgrade subscriptions
- **Usage Tracking** - Monitor notes and user limits per organization
- **API Access** - RESTful API with tenant isolation

### Advanced Enterprise Features (Upcoming)

- **Soft Deletes & Trash** - Move notes to Trash for 30 days before permanent auto-purge
- **Activity Logs / Audit Trails** - Detailed history of who edited what and when for every note
- **Version History** - Full version snapshots with the ability to revert to any point in time

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: BetterAuth (JWT-based with OAuth support)
- **Payments**: Polar.sh for subscription management
- **Email**: Resend
- **UI**: React + shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd notal
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Polar.sh Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
NEXT_PUBLIC_FREE_PLAN_ID=your_free_plan_id_here
NEXT_PUBLIC_PRO_PLAN_ID=your_pro_plan_id_here

# Email
RESEND_API_KEY=your_resend_api_key_here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

4. Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 📂 Project Structure

```
notal/
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── src/
│   ├── app/
│   │   ├── api/              # API routes (thin wrappers)
│   │   │   ├── accept-invitation/
│   │   │   ├── notes/        # Notes CRUD endpoints
│   │   │   ├── organizations/
│   │   │   └── users/
│   │   ├── dashboard/        # Protected dashboard routes
│   │   │   ├── settings/
│   │   │   └── users/
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── emails/           # Email templates
│   │   ├── forms/            # Form components
│   │   ├── settings/         # Settings components
│   │   ├── theme/            # Theme components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── app-sidebar.tsx
│   │   ├── nav-main.tsx
│   │   ├── nav-projects.tsx
│   │   ├── nav-user.tsx
│   │   └── team-switcher.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── auth.ts           # BetterAuth configuration
│   │   └── utils.ts          # Helper functions
│   ├── server/               # Business logic (single source of truth)
│   │   ├── notes.ts          # Notes operations
│   │   ├── organizations.ts  # Organization operations
│   │   └── users.ts          # User operations
│   ├── types/                # TypeScript types
│   └── zustand/              # State management
│       └── providers/
├── .env.example              # Environment variables template
├── components.json           # shadcn/ui config
├── eslint.config.mjs
├── middleware.ts             # Next.js middleware
├── next.config.ts
├── next-env.d.ts
├── package.json
└── tsconfig.json
```

---

## 🔍 Key Implementation Details

### 1. Multi-Tenancy Architecture

**Approach**: Shared database, shared schema with tenant isolation via `organizationId`

All database queries are scoped to the authenticated user's organization:

```typescript
// Example: Tenant-isolated query
const notes = await prisma.note.findMany({
	where: {
		organizationId: activeOrganization.id,
		userId: user.id,
	},
});
```

**Schema Example:**

```prisma
model Note {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  title          String
  content        String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
}
```

### 2. Authentication Flow

1. User logs in via `/api/auth/login`
2. JWT token generated and returned
3. Token validated by middleware on protected routes
4. User's organization context loaded for all requests

### 3. Subscription Feature Gating

**Free Plan Limits:**

- 3 users per organization
- 50 notes per organization

**Pro Plan:**

- Unlimited users and notes
- Only accessible to **Admin** users for subscription management

### 4. Notes API Endpoints

All endpoints enforce tenant isolation:

- `POST /api/notes` - Create note
- `GET /api/notes` - List all notes (tenant-scoped)
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

---

## 🎯 Development Guidelines

### Code Organization Pattern

1. **Business Logic**: Write all operations in `src/server/` functions
2. **API Routes**: Keep routes thin - just call server functions
3. **State Updates**: Update Zustand stores after successful mutations
4. **Type Safety**: Define interfaces in `src/types/`

### Example Workflow

```typescript
// 1. Define server function (src/server/notes.ts)
export async function createNote(data: CreateNoteInput) {
	// Business logic here
}

// 2. Call from API route (src/app/api/notes/route.ts)
export async function POST(request: Request) {
	const result = await createNote(data);
	return NextResponse.json(result);
}

// 3. Update state in component
const addNote = async (data) => {
	const note = await fetch("/api/notes", {
		method: "POST",
		body: JSON.stringify(data),
	});
	notesStore.addNote(note); // Update Zustand
};
```

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Run ESLint
npm run build            # Production build

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes
npx prisma studio        # Open database GUI
```

---

## 🌐 API Reference

### Health Check

```http
GET /api/health
Response: { "status": "ok" }
```

### Authentication

```http
POST /api/auth/login
Body: { "email": "admin@acme.test", "password": "password" }
Response: { "token": "jwt-token", "user": {...} }
```

### Notes Operations

```http
# Create Note
POST /api/notes
Headers: { "Authorization": "Bearer <token>" }
Body: { "title": "My Note", "content": "Note content" }

# List Notes
GET /api/notes
Headers: { "Authorization": "Bearer <token>" }

# Update Note
PUT /api/notes/:id
Headers: { "Authorization": "Bearer <token>" }
Body: { "title": "Updated Title", "content": "Updated content" }

# Delete Note
DELETE /api/notes/:id
Headers: { "Authorization": "Bearer <token>" }
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```env
BETTER_AUTH_SECRET=your_production_secret_here
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL="postgresql://..."

POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
NEXT_PUBLIC_FREE_PLAN_ID=your_free_plan_id
NEXT_PUBLIC_PRO_PLAN_ID=your_pro_plan_id

RESEND_API_KEY=your_resend_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Setup

Ensure your production database is set up:

```bash
npx prisma db push
```

---

## 🧪 Testing

The application includes comprehensive validation coverage:

**Automated Test Coverage:**

- ✅ Health endpoint availability
- ✅ Authentication flow
- ✅ Tenant isolation enforcement
- ✅ Role-based access restrictions
- ✅ Subscription limits and upgrades
- ✅ CRUD operations
- ✅ Frontend accessibility

---

## 📋 Features Checklist

- [x] Multi-tenant architecture with data isolation
- [x] JWT-based authentication
- [x] Role-based authorization (Admin/Member)
- [x] Free and Pro subscription tiers
- [x] Notes CRUD with tenant scoping
- [x] User invitation system
- [x] Subscription upgrade endpoint
- [x] Usage limits enforcement
- [x] Responsive frontend UI
- [x] API health monitoring
- [x] Production deployment on Vercel

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code organization patterns in `src/server/` for business logic
4. Ensure all database queries include `organizationId` filtering
5. Update Zustand stores after mutations
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check the implementation details above
- Review the code examples in `src/server/`

---

**Built with Next.js as a SaaS boilerplate demonstrating multi-tenant architecture patterns**
