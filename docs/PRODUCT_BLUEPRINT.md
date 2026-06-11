# Trades Product Blueprint

## Product promise

Trades helps Texas contractors hire dependable subcontractors with less phone-tag, guesswork, and risk. It gives subcontractors a credible place to find work and build a portable reputation.

## Primary users

### Contractor

A general contractor, home builder, remodeler, property operator, or project manager who needs a subcontractor for a defined scope of work.

### Subcontractor

A trade company or independent crew that wants to find jobs, submit bids, and demonstrate qualifications and past performance.

A company may act as both a contractor and subcontractor on different jobs. Roles should be capabilities, not permanently separate account types.

## Texas launch catalog

Keep the customer-facing list understandable while allowing detailed specialties beneath each trade.

### Launch priority trades

1. Framing and rough carpentry
2. Electrical
3. HVAC and refrigeration
4. Concrete, formwork, and rebar
5. Plumbing
6. Drywall and finishing
7. Painting and coatings
8. Masonry, brick, and stone
9. Roofing
10. Excavation, grading, and sitework
11. Demolition
12. Insulation
13. Flooring and tile
14. Finish carpentry, cabinets, and millwork
15. Siding, stucco, and exterior finishes
16. Windows, doors, glass, and glazing
17. Landscaping and irrigation
18. Fencing and gates
19. Low-voltage, data, security, and access control
20. Welding, structural steel, and miscellaneous metals
21. Waterproofing, gutters, and drainage
22. Cleaning, hauling, and final jobsite cleanup

### Later expansion trades

- Fire protection and sprinklers
- Solar and energy storage
- Pools and spas
- Elevators and lifts
- Paving and striping
- Septic systems and water wells
- Equipment rental and operators
- Restoration and remediation

## Job classifications

Every job should include:

- Trade and specialties
- Project type: residential new construction, remodel, multifamily, light commercial, service/repair, or storm/restoration
- Location and travel expectations
- Scope of work and exclusions
- Plans, photos, and supporting documents
- Desired start date, estimated duration, and bid deadline
- Budget visibility: fixed range, open to bids, or hidden
- Labor/material responsibility
- Permit responsibility
- Required licenses, insurance, crew size, and experience

## Core workflow

1. A contractor creates a company profile and posts a job.
2. Matching subcontractors discover the job or receive an invitation.
3. Subcontractors ask questions and submit private bids.
4. The contractor compares price, scope, qualifications, availability, and reviews.
5. The contractor awards one bid and the parties confirm the scope.
6. The job moves through awarded, in progress, completed, and closed states.
7. After completion, the contractor and subcontractor may review one another.

## MVP capabilities

### Accounts and companies

- Email and password or magic-link sign-in
- Company profile with multiple team members
- Contractor and subcontractor capabilities on the same company
- Texas service areas by metro, county, and travel radius

### Subcontractor profiles

- Trades and specialties
- Service area and travel radius
- Crew size and availability
- Residential and commercial experience
- Portfolio photos and project descriptions
- License, insurance, and tax-document fields
- Ratings and reviews from completed Trades jobs

### Jobs and bids

- Create, edit, publish, pause, award, and close jobs
- Browse and filter open jobs
- Invite subcontractors to bid
- Private bid amount, proposed schedule, scope notes, exclusions, and attachments
- Bid comparison view for the posting contractor

### Communication and trust

- Job-specific messaging
- Notifications for invitations, questions, bids, awards, and status changes
- Reviews only after an awarded job is completed
- Report user, job, message, bid, or review
- Admin moderation and verification queue

## Texas trust and verification

Verification must communicate facts, not imply that Trades guarantees the company or its work.

### State-license verification

- Electrical: capture business and relevant individual license information and verify against the Texas Department of Licensing and Regulation.
- HVAC/refrigeration: capture contractor license information and verify against the Texas Department of Licensing and Regulation.
- Plumbing: capture Responsible Master Plumber/company affiliation and relevant licenses and verify against the Texas State Board of Plumbing Examiners.
- Other trades: allow licenses, certifications, and local registrations, but label them accurately because many are not licensed statewide.

### Insurance and business documents

- General liability certificate with expiration date
- Workers' compensation status: covered, non-subscriber, exempt/unknown, with supporting document when available
- W-9 collection status; do not expose tax documents publicly
- Optional auto, umbrella, bonding, and professional liability coverage
- Expiration reminders and visible stale-document warnings

### Verification badges

Use specific badges such as `Identity checked`, `Texas license current`, `Insurance document current`, and `Completed 10 Trades jobs`. Avoid a vague universal `Verified` badge.

## Reputation design

Reviews are tied to completed awarded jobs. Public review categories:

- Quality of work
- Schedule reliability
- Communication
- Scope and change-order management
- Jobsite professionalism

Show the written review, overall rating, project trade, completion month, and whether the reviewer recommends the company. Never allow paid profile reviews or reviews from jobs that were not awarded through Trades.

## Marketplace safeguards

- Bids are private to the posting contractor and bidding subcontractor.
- Contact details can be limited until a bid or invitation creates a relationship.
- Rate-limit unsolicited invitations and messages.
- Preserve job scope and bid revisions in an audit history.
- Provide report, block, moderation, and review-dispute workflows.
- Do not rank solely by lowest price; include qualifications, responsiveness, availability, and reputation.

## Launch strategy

Start with one dense Texas metro rather than the entire state operationally. Support all Texas locations in the product, but recruit contractors and subcontractors in one metro until jobs consistently receive several qualified bids. Dallas-Fort Worth or Houston are strong initial candidates.

## Out of scope for the first release

- Holding or transmitting payments
- Escrow and milestone payouts
- Automated contract generation or legal advice
- Payroll, time tracking, and employee classification
- Material purchasing
- Nationwide licensing rules
- Native mobile applications

## Success measures

- Published jobs that receive at least three qualified bids
- Median time to first qualified bid
- Bid-to-award conversion rate
- Completed awarded jobs
- Repeat posting contractors
- Active subcontractors receiving invitations or submitting bids
- Review completion and dispute rates

## Regulatory source links

- Texas electricians: https://www.tdlr.texas.gov/electricians/
- Texas HVAC/refrigeration contractors: https://www.tdlr.texas.gov/acr/
- Texas plumbing license types and public search: https://tsbpe.texas.gov/license-types/
- Texas workers' compensation employer information: https://www.tdi.texas.gov/wc/employer/index.html
