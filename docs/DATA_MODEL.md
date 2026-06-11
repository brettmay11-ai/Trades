# Initial Data Model

This is the proposed MVP domain model. It is intentionally payment-free and supports companies that both post and bid on jobs.

## Core entities

### users

- id
- email
- full_name
- phone
- avatar_url
- created_at
- last_active_at

### companies

- id
- legal_name
- display_name
- slug
- description
- website
- phone
- headquarters_city
- headquarters_state
- years_in_business
- employee_count_range
- contractor_capability
- subcontractor_capability
- status
- created_at

### company_members

- company_id
- user_id
- role: owner, admin, estimator, project_manager, or member
- status

### trades

- id
- name
- slug
- parent_trade_id
- launch_priority
- license_rule: none, texas_electrical, texas_hvac, texas_plumbing, or custom

### company_trades

- company_id
- trade_id
- years_experience
- residential
- commercial

### service_areas

- id
- company_id
- metro
- county
- postal_code
- radius_miles

### credentials

- id
- company_id
- type: license, insurance, workers_comp_status, certification, bond, or tax_document
- issuing_authority
- credential_number
- holder_name
- issued_at
- expires_at
- document_path
- visibility
- verification_status
- verified_at
- verification_notes

### portfolio_projects

- id
- company_id
- trade_id
- title
- description
- city
- state
- completed_at
- media_paths

### jobs

- id
- posting_company_id
- title
- description
- project_type
- city
- state
- postal_code
- exact_address_visibility
- desired_start_date
- estimated_duration
- bid_due_at
- budget_type
- budget_min
- budget_max
- labor_material_responsibility
- permit_responsibility
- required_crew_size
- required_insurance
- status: draft, published, paused, awarded, in_progress, completed, closed, or cancelled
- awarded_bid_id
- created_at
- published_at

### job_trades

- job_id
- trade_id
- required

### job_attachments

- id
- job_id
- uploaded_by_user_id
- file_path
- file_name
- visibility
- created_at

### invitations

- id
- job_id
- invited_company_id
- invited_by_user_id
- status
- created_at
- responded_at

### bids

- id
- job_id
- bidding_company_id
- submitted_by_user_id
- amount
- pricing_type: fixed, estimate, hourly, unit_price, or request_site_visit
- proposed_start_date
- estimated_duration
- scope_notes
- exclusions
- warranty_notes
- status: draft, submitted, revised, withdrawn, declined, or awarded
- submitted_at
- updated_at

### bid_attachments

- id
- bid_id
- uploaded_by_user_id
- file_path
- file_name
- created_at

### conversations

- id
- job_id
- contractor_company_id
- subcontractor_company_id
- created_at

### messages

- id
- conversation_id
- sender_user_id
- body
- attachment_paths
- created_at
- read_at

### reviews

- id
- job_id
- reviewer_company_id
- reviewed_company_id
- quality_rating
- schedule_rating
- communication_rating
- scope_management_rating
- professionalism_rating
- overall_rating
- recommends
- body
- status
- created_at

### reports

- id
- reporter_user_id
- target_type
- target_id
- reason
- details
- status
- created_at

### audit_events

- id
- actor_user_id
- company_id
- entity_type
- entity_id
- action
- metadata
- created_at

## Essential rules

- A company can both post jobs and bid on jobs.
- A company cannot bid on its own job.
- Only one active bid per bidding company per job; revisions are retained in audit history.
- Only members of the posting company can view all bids for its job.
- Bidding companies can view only their own bids.
- A job can award only a submitted bid belonging to that job.
- Reviews require a completed job and a company that participated in that awarded job.
- Each company can review the other company once per job.
- Private credentials and attachments must use storage access rules, not merely hidden URLs.
- Authorization must be enforced in the database with row-level security.

## Suggested first migration order

1. users, companies, and company_members
2. trades, company_trades, and service_areas
3. credentials and portfolio_projects
4. jobs, job_trades, and job_attachments
5. invitations, bids, and bid_attachments
6. conversations and messages
7. reviews, reports, and audit_events
