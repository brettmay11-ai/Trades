# Subcontractor Trust Profiles

Trust profiles help contractors perform due diligence before hiring a subcontractor.

## Implemented alpha workflow

Subcontractor-capable companies can publish:

- Recent completed projects with title, trade, location, completion date, description, and photo link
- License information with issuer, number, issuing state, expiration, classification, and notes
- Insurance information with carrier, policy number, expiration, coverage, and notes
- Certifications and bond information

Signed-in contractors can open a subcontractor profile from marketplace hiring surfaces, including bid review and company discovery.

## Visibility and trust rules

- Only subcontractor-capable companies can publish portfolio and credential information.
- Signed-in users can inspect subcontractor trust profiles.
- Credential facts are labeled `self-reported` until independently verified.
- Trades does not imply that a license, policy, certification, bond, photo, or project claim is valid merely because it was posted.
- Contractors should independently confirm credential status, coverage, expiration, named insured, jurisdiction, and applicability before hiring.
- Sensitive private documents must not be exposed through public URLs.

## Alpha limitation

Portfolio photos currently use image links. Production will use secure object storage, image processing, upload limits, malware scanning, moderation, and access controls. Credential documents will use private storage and controlled sharing rather than public links.

## Production follow-up

- Secure photo and credential-document uploads
- Credential verification queue and source links
- Expiration reminders and stale-document warnings
- Contractor requests for updated insurance certificates
- Profile completeness scoring
- Portfolio and credential moderation
- Audit history for edits and verification changes
