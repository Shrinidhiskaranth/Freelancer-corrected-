# Lumina Freelancer Marketplace V2

Lumina is a full-stack freelancer marketplace with an intelligent freelancer-project matching system and protected project assignment workflow.

## V2 highlights

- Intelligent multi-factor freelancer-project matching
- Skill, semantic relevance, experience, budget, availability and category scoring
- Explainable match breakdown and recommendation reasons
- Protected one-freelancer-per-project bid acceptance workflow
- JWT authentication and role-based access
- MongoDB/Mongoose persistence
- Payment integrations for Stripe and Razorpay

## Project structure

- `backend/` - Express/Mongoose API
- `freelancing/` - React frontend
- `vercel.json` - Vercel deployment configuration

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and add your MongoDB URI and JWT secret.
2. Copy `freelancing/.env.example` to `freelancing/.env.local` if needed.
3. Install dependencies:

```bash
npm run install-all
```

4. Start both applications:

```bash
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

## Vercel deployment

This repository includes a Vercel configuration for the React frontend and Express API.

Add these environment variables in Vercel:

- `MONGO_URI`
- `MONGO_DB_NAME` (optional; defaults to `freelancer_marketplace`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` if Stripe is used
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` if Razorpay is used

Do **not** commit `.env` files or real credentials.

The frontend calls `/api` in production, so no hard-coded production backend URL is required in the React code.
