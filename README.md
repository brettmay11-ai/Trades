# Trades

Trades is a Texas-first B2B marketplace that helps general contractors find, evaluate, and hire subcontractors.

Contractors post jobs, receive private bids, compare qualified subcontractors, award work, and leave reviews after completion. Subcontractors build verified trade profiles, discover relevant work, submit bids, and grow their reputation through completed jobs.

## Interactive prototype

The first interactive product slice lives in [`prototype/index.html`](prototype/index.html). It is a dependency-free responsive prototype that can be opened directly in a browser.

Current prototype interactions:

- Switch between contractor and subcontractor perspectives
- Browse and filter sample Texas jobs by trade, market, and project type
- Open job scopes and start a sample private bid
- Browse all 22 launch trades
- Post a sample job that immediately appears in the marketplace
- Open sign-in and early-access flows

The prototype uses sample data only. Authentication, persistent data, private file storage, and marketplace authorization will be implemented in the application build.

## Launch scope

- Market: Texas
- Customers: general contractors, builders, remodelers, and subcontracting companies
- Core workflow: post job -> receive bids -> award subcontractor -> complete work -> review
- Payments and escrow: planned after the core marketplace workflow

## Product docs

- [Product blueprint](docs/PRODUCT_BLUEPRINT.md)
- [Initial data model](docs/DATA_MODEL.md)
- [MVP build backlog](https://github.com/brettmay11-ai/Trades/issues)

## Proposed application stack

- Next.js and TypeScript
- Supabase Auth, Postgres, Realtime, and Storage
- Vercel hosting
- Stripe Connect in a later payment phase
