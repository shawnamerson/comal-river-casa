# Comal River Casa — Tech Stack

## Core Framework
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2 | React framework (App Router) |
| React | 18.2 | UI library |
| TypeScript | 5.3 | Type safety |

## Backend / API
| Technology | Version | Purpose |
|---|---|---|
| tRPC | 10.45 | End-to-end typesafe API |
| TanStack React Query | 4.42 | Server state management (via tRPC) |
| Zod | 4.3 | Schema validation |
| SuperJSON | 2.2 | Serialization for tRPC |

## Database
| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | — | Primary database |
| Prisma | 5.22 | ORM and migrations |

## Authentication
| Technology | Version | Purpose |
|---|---|---|
| NextAuth.js | 5.0 (beta) | Authentication |
| @auth/prisma-adapter | 2.11 | Prisma session/account storage |
| bcryptjs | 3.0 | Password hashing |

## Payments
| Technology | Version | Purpose |
|---|---|---|
| Stripe (server) | 20.1 | Payment processing |
| @stripe/react-stripe-js | 5.4 | Stripe React components |
| @stripe/stripe-js | 8.6 | Stripe browser SDK |

## Email
| Technology | Version | Purpose |
|---|---|---|
| Resend | 6.7 | Transactional email delivery |
| React Email | 1.0 / 2.0 | Email templates as React components |

## Images & Media
| Technology | Version | Purpose |
|---|---|---|
| Cloudinary | 2.8 | Image hosting and transforms |
| next-cloudinary | 6.17 | Next.js Cloudinary integration |

## Calendar Sync
| Technology | Version | Purpose |
|---|---|---|
| node-ical | 0.23 | iCal import/export (Airbnb/VRBO sync) |

## Rate Limiting
| Technology | Version | Purpose |
|---|---|---|
| @upstash/ratelimit | 2.0 | Rate limiting |
| @upstash/redis | 1.36 | Redis client (Upstash serverless) |

## Styling & UI
| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4 | Utility-first CSS |
| Lucide React | 0.562 | Icon library |
| class-variance-authority | 0.7 | Component variant management |
| clsx / tailwind-merge | 2.1 / 3.4 | Class name utilities |
| react-day-picker | 9.13 | Date picker component |

## Forms
| Technology | Version | Purpose |
|---|---|---|
| React Hook Form | 7.71 | Form state management |
| @hookform/resolvers | 5.2 | Zod integration for form validation |

## Testing
| Technology | Version | Purpose |
|---|---|---|
| Vitest | 4.0 | Unit testing |
| Playwright | 1.57 | End-to-end testing |

## Developer Tooling
| Technology | Version | Purpose |
|---|---|---|
| ESLint | 8.56 | Linting |
| Prettier | 3.7 | Code formatting |
| prettier-plugin-tailwindcss | 0.7 | Tailwind class sorting |
| tsx | 4.21 | TypeScript script runner (seeds, etc.) |

## Infrastructure
| Technology | Purpose |
|---|---|
| Vercel | Hosting and deployment |
| Vercel Analytics | Usage analytics |
| Vercel Cron Jobs | Scheduled tasks (calendar sync, booking expiry) |
