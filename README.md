# Trades

Trades is a nationwide-ready B2B marketplace that helps general contractors and subcontractors find work, build trusted trade networks, and grow their reputation. The first active market is Dallas-Fort Worth, with the product and data model designed to expand state by state.

## Working account backend

The deployed application includes:

- Contractor, subcontractor, and dual-capability company signup
- Secure password hashing and authenticated sessions
- Role-aware company dashboards
- Private company-to-company conversations and messages
- Mutual trusted-network connection requests
- Shareable signup invitations for off-platform trade partners
- Automatic network connection when an invited partner joins
- Job referrals between accepted trusted connections
- Referral interest and pass tracking

Open `/signup`, `/login`, `/dashboard`, or `/network` on the deployed application to use the account and network flows.

## Owner console

The protected owner console at `/admin` provides platform-wide user, company, marketplace, location, trade, job, bid, review, messaging, and activity metrics. Configure `TRADES_ADMIN_EMAILS` as a comma-separated list of trusted owner account email addresses. Those users sign in through the normal Trades login page before opening `/admin`.

## Launch scope

- Initial operating market: Dallas-Fort Worth
- Expansion model: nationwide, state by state
- Customers: general contractors, builders, remodelers, and subcontracting companies
- Core workflow: connect -> refer or post job -> receive bids -> award subcontractor -> complete work -> review
- Payments and escrow: planned after the core marketplace workflow

## Product docs

- [Product blueprint](docs/PRODUCT_BLUEPRINT.md)
- [Initial data model](docs/DATA_MODEL.md)
- [Account backend](docs/BACKEND.md)
- [Trusted trade networks](docs/TRADE_NETWORKS.md)
- [MVP build backlog](https://github.com/brettmay11-ai/Trades/issues)

## Current application stack

- Dependency-free Node.js application server
- Responsive HTML, CSS, and JavaScript interface
- File-backed private-alpha persistence
- Railway deployment

Before public launch, persistence and authorization will move to managed Postgres with secure object storage, email delivery, rate limiting, backups, and database-enforced access policies.
