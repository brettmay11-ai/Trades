# Trades

Trades is a nationwide-ready B2B marketplace that helps general contractors find, evaluate, and hire subcontractors. The first active market is Dallas-Fort Worth, with the product and data model designed to expand state by state.

Contractors post jobs, receive private bids, compare qualified subcontractors, award work, and leave reviews after completion. Subcontractors build trade profiles, discover relevant work, submit bids, and grow their reputation through completed jobs.

## Working account backend

The deployed application now includes the first real account and communication workflow:

- Contractor, subcontractor, and dual-capability company signup
- Secure password hashing and authenticated sessions
- Role-aware company dashboards
- Company network discovery
- Private company-to-company conversations and messages
- Unread message counts and participant authorization

Open `/signup`, `/login`, or `/dashboard` on the deployed application to use the account flow. See [Account backend](docs/BACKEND.md) for implementation and production-migration details.

## Launch scope

- Initial operating market: Dallas-Fort Worth
- Expansion model: nationwide, state by state
- Customers: general contractors, builders, remodelers, and subcontracting companies
- Core workflow: post job -> receive bids -> award subcontractor -> complete work -> review
- Payments and escrow: planned after the core marketplace workflow

## Product docs

- [Product blueprint](docs/PRODUCT_BLUEPRINT.md)
- [Initial data model](docs/DATA_MODEL.md)
- [Account backend](docs/BACKEND.md)
- [MVP build backlog](https://github.com/brettmay11-ai/Trades/issues)

## Current application stack

- Dependency-free Node.js application server
- Responsive HTML, CSS, and JavaScript interface
- File-backed private-alpha persistence
- Railway deployment

Before public launch, persistence and authorization will move to managed Postgres with secure object storage, email verification, backups, and database-enforced access policies.
