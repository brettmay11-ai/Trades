# Trusted Trade Networks

Trade networks let companies preserve and grow the real-world relationships that already drive construction referrals.

## Implemented workflow

- A company sends another on-platform company a connection request.
- The receiving company accepts or declines it.
- Accepted connections appear in both companies' trusted networks.
- A company can create a private signup link for an off-platform trade partner.
- When that partner signs up through the link, both companies are connected automatically.
- Companies can send job referrals only to accepted trusted connections.
- Referral recipients can mark an opportunity as interested or passed.

## Trust rules

- Connections are mutual and require consent, except when an invited company explicitly signs up through its private invite link.
- Messaging alone does not imply endorsement or create a trusted connection.
- Job referrals preserve the referring company, recipient, note, and status.
- Referrals are not public reviews and do not affect ratings.
- Invite links should expire and become single-use when this moves to the production database.
- Production invitations should be delivered by an email provider with abuse prevention, unsubscribe handling, and rate limits.

## Production data entities

### network_connections

- id
- requester_company_id
- target_company_id
- status: pending, accepted, declined, blocked
- note
- source_invite_id
- created_at
- responded_at

### network_invites

- id
- inviter_company_id
- email
- name
- company_name
- trade
- note
- token_hash
- status: pending, accepted, expired, revoked
- expires_at
- accepted_company_id
- created_at
- accepted_at

### referrals

- id
- from_company_id
- to_company_id
- job_id: optional until linked to a posted job
- title
- note
- status: sent, interested, passed, converted
- created_at
- responded_at
