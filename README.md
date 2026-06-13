# YTS Youth Portal PWA

The YTS Youth Portal is the youth-facing Progressive Web App for the Youth
Tracking System. It connects to the existing YTS Laravel API and is separate
from the core YTS admin system.

This Phase 1 scaffold includes the Next.js foundation only. Real API calls,
profile management, opportunities, applications, and permission-aware business
logic will be added in later phases.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PWA support from day one
- Environment-based API configuration
- Central API client structure
- Protected portal layout skeleton

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with the YTS Laravel API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-yts-api.example.com
NEXT_PUBLIC_APP_NAME="YTS Youth Portal"
NEXT_PUBLIC_PWA_ENABLED=true
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

The root route redirects to `/dashboard`. The protected portal layout currently
uses a placeholder authenticated session until real Sanctum authentication is
implemented.

## Available Routes

- `/login` - login placeholder
- `/dashboard` - youth dashboard placeholder
- `/profile` - profile placeholder
- `/opportunities` - opportunities placeholder
- `/applications` - applications placeholder
- `/offline` - offline fallback placeholder

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Project Structure

```txt
src/
  app/
    (auth)/
    (portal)/
    offline/
  components/
    layout/
    ui/
  lib/
    api/
    auth/
    pwa/
  styles/
```

## PWA Notes

The app includes a web app manifest and install icons. Service worker generation
is configured for production builds and disabled during development.

Run a production build to verify PWA output:

```bash
npm run build
npm run start
```

## API Notes

The API client structure is present in `src/lib/api`, but no feature code calls
the backend yet. Future phases should connect this client to the existing YTS
Laravel Sanctum endpoints and mirror the permissions exposed by the core youth
module.
