# 🏏 Cricbook - Cricket Social Media Platform

Cricbook is a social media platform built specifically for cricket enthusiasts. Share your cricket thoughts, follow live matches, discuss with fans worldwide, and stay updated with everything cricket.

## Features

- 📱 **Social Feed** - Share posts, photos, and polls about cricket
- ⚡ **Live Match Updates** - Real-time scores and match information
- 💬 **Fan Discussions** - Engage with cricket fans through comments and replies
- 📊 **Stats & Predictions** - Player statistics and match predictions
- 🔔 **Notifications** - Stay updated with likes, comments, follows, and match updates
- 🔖 **Bookmarks** - Save posts for later
- 👤 **User Profiles** - Customize your profile with favorite teams and players
- #️⃣ **Hashtags** - Discover trending cricket topics
- 🏆 **All Formats** - Coverage for Tests, ODIs, T20s, IPL, and World Cup

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: 
  - SQLite (local development)
  - PostgreSQL (production)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure

```
cricbook/
├── prisma/
│   ├── schema.prisma          # SQLite schema (development)
│   └── schema.production.prisma # PostgreSQL schema (production)
├── src/
│   ├── actions/               # Server actions
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (main)/           # Main app pages
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── cricket/          # Cricket-specific components
│   │   ├── feed/             # Feed components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configs
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (For production) PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cricbook
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

6. (Optional) Seed the database with sample data:
```bash
npx prisma db seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Using PostgreSQL

1. Update your database schema for PostgreSQL:
```bash
# Copy the production schema
cp prisma/schema.production.prisma prisma/schema.prisma
```

2. Update your `.env` file with PostgreSQL connection:
```env
DATABASE_URL="postgresql://user:password@host:5432/cricbook?schema=public"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A secure random string
   - `NEXTAUTH_URL` - Your production URL

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name <migration-name>

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js authentication |
| `/api/posts` | GET | Fetch posts with pagination |
| `/api/users` | GET | Search/list users |
| `/api/matches` | GET | Fetch cricket matches |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | No |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for cricket fans worldwide 🏏
