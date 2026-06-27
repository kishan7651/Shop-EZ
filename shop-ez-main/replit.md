# ShopEZ E-Commerce Platform

## Integration Notes
- The Stripe integration was dismissed by the user during initial setup. Payments will be implemented as a mockup or "Cash on Delivery" / generic success response until the user provides credentials or authorizes the Stripe connector later.

## Application Architecture
- React frontend (Vite + Tailwind + wouter)
- Express + Node.js backend
- PostgreSQL with Drizzle ORM
- Local authentication (Express sessions / Passport) per user requirement for username/password based auth.
