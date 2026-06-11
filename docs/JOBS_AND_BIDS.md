# Jobs and Private Bids

## Implemented alpha workflow

### Contractors

- Companies with contractor capability can publish persistent jobs.
- Jobs include trade, city, state, project type, budget, desired start date, and scope summary.
- Contractors can see their posted jobs and the number of private bids received.
- Only the posting company can open the complete bid-review list.
- Contractors can message bidding companies.

### Subcontractors

- Companies with subcontractor capability can browse all published contractor jobs.
- Jobs are prioritized using matching state, city, and company trades.
- Subcontractors can filter jobs by trade, city, and state.
- Subcontractors can message the posting contractor in a job-linked conversation.
- A subcontractor company can submit one private bid per job and revise it later.
- Each subcontractor sees only its own bid, never competing bids.

## Authorization rules

- A company cannot bid on its own job.
- Contractor capability is required to post a job.
- Subcontractor capability is required to submit a bid.
- Only the posting company can review all bids for its job.
- Bids are not exposed in the general job listing response.
- Job-linked conversations remain accessible only to the participating companies.

## Production follow-up

Before public launch, move jobs and bids to managed Postgres with database-enforced access policies, bid revision history, job status transitions, attachments, bid deadlines, invitations, notifications, moderation, and audit events.
