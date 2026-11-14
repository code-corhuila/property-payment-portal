# property-payment-portal

> payment bounded context: web UI (remote)

Part of the **Property** distributed system — Grupo 2 · Angular 21 (zoneless) · Native Federation 21 · Node 22 or 24.
Documentation: [`property-docs`](https://github.com/code-corhuila/property-docs), `12-ux-ui/navigation-map.md`
and `design-system.md`.

## How the container mounts it

| Federation name | Local address | Exposed module | Exports |
|---|---|---|---|
| `payment` | `http://localhost:4203` | `./routes` → `src/app/payment/payment.routes.ts` | `PAYMENT_ROUTES` (`/reservas/checkout/pago`) |

"Método de pago" is the step between the booking form and the checkout summary of
`property-booking-portal`. **The card never reaches the platform**: it goes to the payment
gateway's library, which returns a token, and only that `tokenPago` travels on
(`navigation-map.md`, screen map; `security-policy.md`). This portal calls no API of the
platform and never calls `provideHttpClient()`.

`package.json` and `package-lock.json` hold the same versions as `property-front`: the
shared libraries are strict singletons, so a different Angular does not load.

## Install, build, test and run

```bash
npm ci          # installs exactly what package-lock.json records
npm run build   # dist/payment; also rewrites tsconfig.federation.json
npm test        # unit tests, one run (Vitest)
npm start       # http://localhost:4203/remoteEntry.json
```

**Builds.** `npm run build` is the build of qa and main: `src/app/payment/gateway.ts`, with
no test card; the library of the gateway's test account is pending, so the screen says that
payment by card is not available yet. `--configuration develop` (the image of develop, through
`PAYMENT_PORTAL_BUILD=develop` of `property-infra-postgres`) and `npm start` replace it with
`gateway.develop.ts`, the public test cards of the fake Stripe. The CI checks that the
production build carries no test token.

`deploy/` builds the image (`npm ci`, then nginx) as the service `payment-portal` on
`platform`; `property-infra-postgres` publishes it on 4203.

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `property-docs`.
