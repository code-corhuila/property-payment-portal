# Changelog of `property-payment-portal`

Every release of this repository, newest first. One release per course cut, tagged on `main`
(`git-conventions.md`, "Tags and versioning"; SemVer). Each entry lists the user stories it
brought, with the pull requests of `develop` that built them.

## [3.0.0] - 2026-11-15

### Added

- **HU-PAY-001 (code-corhuila/property-docs#162) — Charge a Reserva**
  - chore(payment-portal): scaffold the angular portal (#1)
  - feat(payment-portal): choose the card and hand on its token (#2)

### Removed

- The test cards of the fake Stripe (`gateway.develop.ts` and the configuration `develop`), which live only in `develop` (norm 5.5.2).
