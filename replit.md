# IPEORG MLBB Discord Automation

## Overview

This project is a Discord bot and web dashboard for the IPEORG (India Premier Esports Organization) MLBB community. It provides automated user verification with OTP-based security, admin approval workflows, role management, welcome automation, and audit logging. The system consists of a Discord bot for handling verification flows and a React-based admin dashboard for server management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration
- **Styling**: Tailwind CSS with custom theme configuration supporting dark mode
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for complex animations
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Pages**: Home, Documentation, Login (Discord OAuth), Dashboard

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx/esbuild
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Session Management**: Express session with memory store (development) or connect-pg-simple (production)
- **Build Process**: Custom build script using esbuild for server and Vite for client

### Discord Bot
- **Library**: discord.js v14
- **Features**: Slash commands (`/verify`), modal inputs, OTP generation, button interactions
- **Storage**: In-memory OTP cache with expiration
- **Configuration**: Hardcoded guild/role IDs for IPEORG server

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Zod schema validation
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

### Authentication
- **OAuth Provider**: Discord OAuth2
- **Flow**: Authorization code grant for admin dashboard access
- **Scopes**: `identify`, `guilds` for user and server information

## External Dependencies

### Third-Party Services
- **Discord API**: Bot functionality and OAuth authentication
- **Neon Database**: Serverless PostgreSQL hosting
- **Discord Developer Portal**: Bot token and OAuth credentials

### Key NPM Packages
- `discord.js`: Discord bot framework
- `drizzle-orm` + `@neondatabase/serverless`: Database access
- `express` + `express-session`: HTTP server and sessions
- `@tanstack/react-query`: Data fetching and caching
- `axios`: HTTP client for Discord API calls
- `zod`: Runtime type validation

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `DISCORD_CLIENT_ID`: Discord application client ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth client secret
- `DISCORD_REDIRECT_URI`: OAuth callback URL

### Development Tools
- Replit-specific Vite plugins for development (`@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`)