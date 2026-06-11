# Account Backend

The first working backend is implemented in the dependency-free Node server so account workflows can be tested immediately on the existing Railway deployment.

## Implemented

- Contractor, subcontractor, or dual-capability company signup
- Secure password hashing with Node `scrypt`
- HTTP-only authenticated sessions
- Role-aware company dashboards
- Nationwide-ready city/state/service-area fields
- Company directory
- Private company-to-company conversations
- Two-way authenticated messages and unread counts
- Authorization checks that limit conversations to participating companies

## Routes

- `/signup` and `/login`: account entry
- `/dashboard`: authenticated company workspace
- `/messages`: authenticated company workspace opened to messaging
- `/api/signup`, `/api/login`, `/api/logout`, `/api/me`
- `/api/dashboard`
- `/api/conversations`
- `/api/conversations/:id/messages`

## Persistence

The server stores data in `DATA_DIR/store.json`. For Railway testing, attach a persistent volume and set `DATA_DIR` to its mount path. Without a persistent volume, Railway may discard account data when a deployment is replaced.

This JSON store is appropriate for the private alpha only. Before public launch, migrate the same domain model to managed Postgres with database-enforced authorization, encrypted backups, rate limiting, email verification, password reset, audit history, and secure document storage.

## Nationwide scaling decisions

- Companies have capabilities rather than permanently separate account types.
- Locations use city and state rather than Texas-only market fields.
- Credentials should carry issuing state/jurisdiction and credential type.
- Service areas can later expand from radius-based coverage into postal-code and county coverage.
- State licensing rules should be configuration records, not hard-coded application logic.
