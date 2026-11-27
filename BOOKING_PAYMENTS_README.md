# Booking charges, quotes, cost revisions, Pay Later and Bank78 verification

Implements the booking/payment flow agreed from the Figma designs: a repair
booking is placed only once **one payment** has settled, and that payment can
be settled by the Bank78 webhook *or* by a verify call — never twice.

- [The model](#the-model)
- [New endpoints](#new-endpoints)
- [Repair Now, Pay Later (stopgap)](#repair-now-pay-later-stopgap)
- [Cost revisions after an accepted quote](#cost-revisions-after-an-accepted-quote)
- [Scheduled jobs](#scheduled-jobs)
- [Updated endpoints](#updated-endpoints)
- [Payment settlement and double-verify safety](#payment-settlement-and-double-verify-safety)
- [Schema changes](#schema-changes)
- [Fee configuration](#fee-configuration)
- [Deployment notes](#deployment-notes)
- [Bank78 notes](#bank78-notes)
- [What was removed](#what-was-removed)
- [Not implemented](#not-implemented)
- [Open decisions](#open-decisions)
- [How this was tested](#how-this-was-tested)

---

## The model

Two ways to pay for a repair, one gate to place the booking:

| | `pay_now` | `pay_after_quote` |
|---|---|---|
| Charged at booking | delivery + return + diagnostic + **repair amount** | delivery + return + diagnostic |
| Charged after the quote | only a delta, if the engineer's quote differs | the full repair cost |
| Booking placed when | the booking charge settles | the booking charge settles |

The delivery (logistics) fee is part of the booking charge in **both** cases,
so placement has a single precondition and there is only one code path for it.

```
POST /repairs/book
   └─> draft                          nothing charged, device NOT locked
         │  POST /repairs/:id/booking-payment
         ├─> awaiting_booking_payment  Payment(purpose: booking_charge) + Bank78 link
         │        ├─ webhook OR verify ──> booked   ← BOOKING PLACED
         │        │                        (device locked, engineer assigned, notifications)
         │        └─ payment failed ─────> draft    (R14 "Try again")
         └─> booked immediately when the charge is 0
```

Three deliberate properties:

- **A draft locks nothing.** The device stays `active` and no engineer is
  assigned until money has actually arrived, so an abandoned draft costs
  nothing and needs no cleanup job.
- **Engineer assignment happens at placement**, not at draft creation, so we
  never assign work for a booking that was never paid for.
- **Drafts are hidden from `GET /repairs`** and listed separately by
  `GET /repairs/drafts`, filtered by an explicit query (not a `pre(/^find/)`
  hook, to avoid a second default-exclusion pattern alongside
  `Device.isRemoved`).

`pay_now` cannot charge a price range, so it charges the catalogue price for
the device + issue and treats it as payment towards the final quote. The delta
is reconciled on acceptance (see `PATCH /repairs/:id/quote/accept`).

---

## New endpoints

### Booking charge

#### `POST /api/v1/repairs/booking-charges/preview`
Prices the fee panel on the handover/review steps. Persists nothing.

```jsonc
// request
{ "paymentOption": "pay_after_quote",   // or pay_now
  "handoverType": "pickup",             // or office_dropoff
  "returnMethod": "delivery",           // or collection
  "addressId": "...",                   // required for pickup or delivery
  "deviceId": "...", "issueCategory": "cracked_screen" }  // required for pay_now

// response
{ "serviceable": true, "zone": "lagos_mainland", "zoneLabel": "Lagos Mainland",
  "deliveryFee": 2500, "returnFee": 2500, "diagnosticFee": 5000,
  "repairUpfront": 0, "total": 10000, "currency": "NGN",
  "lines": [ { "key": "delivery_fee", "label": "Logistics fee (pickup)", "amount": 2500 }, … ],
  "deferred": null }
```

An address outside coverage returns `200` with
`{ "serviceable": false, "reason": "…", "alternatives": ["office_dropoff"] }`
rather than an error, so the UI can offer drop-off.

#### `POST /api/v1/repairs/:repairId/booking-payment`
Returns the Bank78 checkout link for a draft's booking charge and moves it to
`awaiting_booking_payment`.

**If a booking charge is already pending, the same link is returned** with
`resumed: true` instead of opening a second Bank78 order — two live orders for
one booking is how customers get charged twice. A new link is only issued once
the previous attempt has failed or expired.

`201` → `{ paymentLink, reference, amount, total, resumed: false }`
`400` → already paid, nothing to charge, or wrong status.

#### `GET /api/v1/repairs/:repairId/payment-status[?purpose=]`
Repair-scoped payment check for the "Confirming your payment" screen. Reads
our own records first and only calls Bank78 when the payment is still pending,
so it is safe to poll.

```jsonc
{ "reference": "txn_…", "purpose": "booking_charge", "amount": 10000,
  "paymentStatus": "completed", "outcome": "already_resolved",
  "settledByThisCall": false, "bank78OrderStatus": "PAID",
  "repairStatus": "engineer_assigned", "bookingPlaced": true,
  "canRetry": false }
```

#### `GET /api/v1/repairs/drafts`
Unpaid drafts the customer can resume. Drafts past
`FeeConfig.draftTtlHours` (default 24h) are hidden, not deleted.

#### `DELETE /api/v1/repairs/:repairId/draft`
Discards an unpaid draft (the wizard's Cancel). `400` if it has been paid for.

### Quote decision

#### `GET /api/v1/repairs/:repairId/quote`
The engineer's findings and photos, the payable breakdown, what was already
paid at booking, and the outstanding balance.

```jsonc
{ "findings": "…", "photos": [],
  "breakdown":   [ { "key": "parts", "amount": 80000 }, { "key": "labour", "amount": 20000 } ],
  "alreadyPaid": [ { "key": "diagnostic_fee", "amount": 5000 }, { "key": "delivery_fee", "amount": 2500 } ],
  "total": 100000, "balanceDue": 100000, "refundDue": 0,
  "paymentOption": "pay_after_quote",
  "payLater": { "available": true, "reason": null, "applicationStatus": "pending" } }
```

#### `PATCH /api/v1/repairs/:repairId/quote/accept`
- `pay_after_quote` → `status: quote_accepted`, `nextAction: "repair_payment"`.
- `pay_now` where the upfront covered it → `status: in_progress` immediately,
  `nextAction: "none"`.
- `pay_now` where the quote came in lower → `refundDue` is recorded on the
  repair for staff to settle. **Nothing is auto-refunded to Bank78.**

#### `PATCH /api/v1/repairs/:repairId/quote/decline`
Body `{ "reason": "It costs too much" }`. Sets `quote_rejected` and returns the
diagnostic-fee position plus `nextAction: "arrange_return"`.

#### `POST /api/v1/repairs/:repairId/payment`
Charges the outstanding repair balance (quote total minus anything already
paid towards the repair). Same resume-don't-duplicate behaviour as the
booking payment.

### Additional work found mid-repair

See [Cost revisions after an accepted quote](#cost-revisions-after-an-accepted-quote)
— these three endpoints grew into a full flow (breakdown, photos, email) and are
documented there.

### Feedback

#### `POST /api/v1/repairs/:repairId/rating`
`{ "rating": 1-5, "review": "…" }`. `Repair.rating`/`review` have existed on
the model all along with no route to write them.

### Engineer side (needed to drive the quote flow)

| Endpoint | What it does |
|---|---|
| `PATCH /api/v1/repairs/engineer/:repairId/quote` | `{ parts, labour, findings }` → issues the firm quote, sets `quote_provided`, notifies the customer. The return-delivery line is only added when that leg was **not** already charged at booking. |
| `POST /api/v1/repairs/engineer/:repairId/additional-work` | `{ note, amount }` → raises an extra fault and notifies the customer |

### Staff: fee configuration

| Endpoint | Permission | What it does |
|---|---|---|
| `GET /api/v1/admin/fees` | `fees:manage` | Effective config, which fields are DB overrides, and the code defaults |
| `PATCH /api/v1/admin/fees` | `fees:manage` | Upserts the config and clears the cache, so the next booking uses it |

### Customer: payment history

| Endpoint | What it returns |
|---|---|
| `GET /api/v1/payment/my-payments` | Every payment the signed-in customer has made, newest first |
| `GET /api/v1/payment/my-payments/:paymentId` | One payment, with its repair, booking charge and quote populated for a receipt |

Customers previously had no way to see their own payments at all — the
unscoped `getAllPayments`/`getPaymentDetails` are admin-only and
`/payment/engineer/payments` is the engineer view.

Mounted under `/payment/my-payments` rather than a bare `GET /payment/`
because that router already mixes customer and engineer routes, and an
unprefixed index would read like the admin `GET /admin/payments`.

Query params: `status`, `purpose`, `repairId`, plus the usual `sort`
(default `-dateInitiated`), `page`, `limit`, `fields`.

```jsonc
{ "results": 2, "totalCount": 2,
  "summary": { "totalPayments": 2, "totalPaid": 10000,
               "completed": 1, "pending": 1, "failed": 0, "refunded": 0 },
  "data": { "payments": [
    { "id": "…", "reference": "txn_…", "purpose": "repair_cost",
      "amount": 100000,
      "breakdown": [ { "key": "parts", "label": "Parts", "amount": 80000 }, … ],
      "status": "pending", "initiatedAt": "…", "repair": { … },
      "paymentLink": "https://…" } ] } }
```

Four deliberate choices:

- **`summary` covers the whole filtered set, not the current page.** (The
  engineer endpoint sums its page instead, so its totals shrink as you
  paginate — worth fixing when the wallet work lands.)
- **Provider internals are not exposed**: no `providerReference`,
  `checkoutSessionReference` or `metadata` (which holds the Bank78 channel and
  the pre-cap `trueAmount`).
- **`paymentLink` is returned only while a payment is `pending`**, so an
  abandoned checkout can be resumed from the history screen.
- **Read-only — neither endpoint calls Bank78.** To check or settle a pending
  payment use `GET /payment/verify/:transactionId` or
  `GET /repairs/:repairId/payment-status`.

Scoping is in the query itself (`findOne({ _id, userId })`), so another
customer's payment returns `404`, not `403` — it does not reveal that the
record exists.

### Notifications (previously orphaned controllers)

| Endpoint | Note |
|---|---|
| `PATCH /api/v1/notifications/:id/read` | `markOneNotificationAsRead` existed but was never mounted |
| `DELETE /api/v1/notifications/:id` | `deleteNotification` existed but was never mounted |

---

## Repair Now, Pay Later (stopgap)

**Implemented and live behind a flag, but deliberately incomplete.** No lender
is signed — the design's own note reads *"no lender or terms agreed (78MFB talks
cover collections and settlements only). All values are placeholders."* So the
funnel runs end to end and every application is declined.

Spec: `docs/superpowers/specs/2026-11-26-rnpl-stopgap-decline-design.md`.

```
customer accepts the quote, balance owing
        ↓   POST /repairs/:id/pay-later/eligibility
   pending  (decideAfter = now + payLaterDecisionDelayMinutes)
        ↓   the payLaterDecisions job, once the decision falls due
not_approved + email: "Repair Now, Pay Later isn't available yet"
```

| Endpoint | What it does |
|---|---|
| `POST /api/v1/repairs/:repairId/pay-later/eligibility` | Records an application. **No request body** — no identity data is collected. Requires the flag on, an accepted quote, a balance owing, and the balance to meet `payLaterMinimumAmount`. Idempotent: a second submit returns the open application with `resumed: true` |
| `GET /api/v1/repairs/:repairId/pay-later/application` | Current state, for the pending and outcome screens |

`GET /repairs/:repairId/quote` carries the availability block, computed rather
than hardcoded:

```jsonc
"payLater": { "available": true, "reason": null, "applicationStatus": "pending" }
```

`available` is true only when the flag is on, there is a balance, and it meets
the minimum. When false, `reason` is the text to show the customer (the flag is
off, the repair is already paid, nothing is left to finance, or the amount is
below the minimum). `applicationStatus` lets the UI route straight to the
pending or outcome screen.

Things that are deliberate, not oversights:

- **The wording is availability, never creditworthiness.** The single reason
  string lives in `src/Helpers/payLaterProvider.js` and nothing may imply a
  licensed lender assessed the customer, because none did.
- **No NIN, BVN or ID capture anywhere.** The designs ask for them; collecting
  financial identity data for a decision no lender makes would breach the data
  minimisation the platform's own privacy policy commits to.
- **Paying outright stays available throughout**, including while an
  application is pending — it is the existing
  `POST /repairs/:repairId/payment`.
- **The decision is a stored timestamp, not a timer**, so a restart, deploy or
  idle spin-down loses nothing; the email is late at worst.
- **The decision is swapped, not rewritten.** `getProvider()` in
  `src/Helpers/payLaterProvider.js` returns an adapter with one method,
  `poll(application, now)`. A real lender becomes a second adapter plus a
  config value; the statuses, endpoints, email and UI contract do not change.

Still missing, and all lender-shaped: offers, deposits, repayment schedules,
instalment payments, late-payment rules, and any working `approved` or
`more_info_needed` path. The statuses exist so the frontend integrates once.

## Cost revisions after an accepted quote

**Implemented.** An engineer who finds extra work after the customer has
accepted and paid sends a revised cost; the customer approves and pays the
difference, skips it, or stops.

Spec: `docs/superpowers/specs/2026-11-26-quote-addenda-design.md`.

The original quote is immutable — revisions are **addenda** on top of it, which
is the shape the `R9 Extra cost found` screen shows (*Original quote /
Additional part and labour / New total*).

| Endpoint | What it does |
|---|---|
| `POST /api/v1/repairs/engineer/:repairId/additional-work` | **`multipart/form-data`**: `parts`, `labour`, `note`, `photos[]` (up to 4, JPEG/PNG, 5MB each). Moves the repair to `awaiting_customer_approval`, notifies in-app and emails the customer |
| `GET /api/v1/repairs/:repairId/additional-work` | `originalQuote` plus each entry's `parts`, `labour`, `note`, `photos`, `amount`, `status` and `newTotal` |
| `PATCH /api/v1/repairs/:repairId/additional-work/:entryId` | `{ "decision": "approve" \| "skip" \| "stop" }` |
| `POST /api/v1/repairs/:repairId/additional-work/:entryId/payment` | Checkout link for an approved entry (`Payment.purpose: "additional_work"`) |

What each decision does:

- **approve** → `nextAction: "additional_work_payment"`; the repair stays at
  `awaiting_customer_approval` until that payment settles, at which point the
  existing fulfilment moves it to `in_progress`.
- **skip** → only the original fault is repaired, and the repair returns to
  `in_progress` immediately.
- **stop** → records the decision and hands off to support. It deliberately
  does **not** change the repair status, because cancellation, return and
  refund rules are still unconfirmed in the designs.

Guards worth knowing about, each of them load-bearing:

- **Only a revisable repair can be revised**: an accepted quote, and a status of
  `in_progress`, `awaiting_parts` or `awaiting_customer_approval`. Without this
  a *completed* or *cancelled* repair could be resurrected and made chargeable
  again, and a repair with no accepted quote would be emailed a "new total"
  built on an original quote of zero.
- **One pending addendum at a time**, enforced *in the write* (a conditional
  `updateOne`), not only by a prior read — two requests a millisecond apart
  would otherwise both create one and the customer would see two competing
  totals and could pay both.
- **An addendum only ever adds.** `amount` must equal `parts + labour` and be at
  least 1, validated on the model as well as the route. A repair that comes in
  cheaper is a refund (`Repair.refundDue`), not a negative line item.
- **Everything is validated before anything is written or uploaded**, and if the
  conditional write loses the race the already-uploaded photos are deleted from
  Cloudinary rather than orphaned.

`awaiting_customer_approval` is a real status, not a flag: it appears in both
status transition maps, in the engineer dashboard's `statusBreakdown` and
`activeRepairs`, in the engineer's active-load cap (a repair blocked on a
customer still occupies them), and in the customer's tracking timeline.

## Scheduled jobs

Recurring work lives in `src/Jobs/`, **not** in Render cron entries — a cron per
job bills per job and adds a dashboard step every time a feature needs a timer.

`src/Jobs/scheduler.js` holds one `setInterval` per registered job, started from
`server.js` once Mongo is connected. A new delayed job is one call:

```js
registerJob({ name: "payLaterDecisions", everyMinutes: 5, run: resolveDueApplications });
```

On boot you should see `:: Scheduler started with 2 job(s) ::`.

| Job | Every | What it does |
|---|---|---|
| `payLaterDecisions` | 5 min | Decides Pay Later applications whose `decideAfter` has passed, then emails the outcome |
| `addendumNotifications` | 5 min | Retries the cost-revision email for any pending addendum whose send failed |

Four properties the scheduler guarantees:

- **A job never overlaps itself** — a run still in flight when the next tick
  fires is skipped, not queued.
- **A throwing job is caught and logged**, never allowed to take the API process
  down, and is retried on the next tick.
- **Durability lives in Mongo, not the timer.** Each job's due-time is a stored
  field, so a restart, deploy or idle spin-down loses nothing; work is picked up
  on the next tick after the instance wakes. The trade-off is tick-granular
  timing: a 30-minute delay delivers in 30–35 minutes.
- **Multiple instances are safe.** Correctness comes from an atomic
  `findOneAndUpdate` claim on each unit of work; when `REDIS_URL` is set, a
  short Redis lock (`src/Jobs/lock.js`) additionally stops every instance
  sweeping the same tick. With it unset the lock is skipped and the claim still
  protects the work.

**Every email these jobs send is claimed before it is sent and stamped only
after it succeeds**, so a send can neither be duplicated by a concurrent tick
nor lost when it fails — a failed send releases its claim and the next tick
retries it, up to 10 attempts before it is abandoned with a loud log.

Also still present and deliberately kept:
`src/Scripts/reconcilePendingPayments.js` on a Render cron — the safety net for
missed Bank78 webhooks.

## Updated endpoints

### `POST /api/v1/repairs/book` — behaviour change

**Creates a draft and charges nothing.** It no longer assigns an engineer,
locks the device, sends notifications or returns a payment link.

New optional body fields: `paymentOption` (default `pay_after_quote`),
`partQuality`, `handoverType`, `returnMethod`, `timeWindow`, `contactName`,
`contactPhone`. `handoverType`/`returnMethod` are derived from the legacy
`serviceType` when omitted, so existing clients keep working.

New response shape:

```jsonc
{ "data": { "repairId": "…", "status": "draft", "paymentOption": "pay_after_quote",
            "bookingCharge": { …, "total": 10000, "lines": [ … ] },
            "draftExpiresAt": "…", "nextAction": "booking_payment" } }
```

**Clients must be updated**: the old response returned `paymentLink` +
`transactionId` directly. Follow `nextAction` and call
`POST /repairs/:repairId/booking-payment`.

### `GET /api/v1/payment/verify/:transactionId` — hardened

Was already present; now it:

- fulfils **by purpose** (places a booking for a `booking_charge`, starts the
  repair for a `repair_cost`, marks additional work paid),
- is race-safe against the webhook (see below),
- reports a normalised `outcome`: `completed`, `already_resolved`,
  `still_pending`, `failed`, `provider_unreachable`, `no_provider_reference`,
- returns `502` (not a 500 HTML page) when Bank78 is unreachable,
- marks terminal Bank78 statuses as `failed` and returns the draft to `draft`
  so the customer can retry.

### `POST /api/v1/users/loginUser`
Accepts `identifier` (email **or** phone number) as the sign-in screen's
"E-mail or Phone Number" field specifies. `email` still works.

### `POST /api/v1/users/signupPartner`
Now also creates the `Company` and its `PartnerGadget` records from optional
`company` and `gadgets` body fields — steps 4–6 of the partner wizard, which
were previously discarded. One `PartnerGadget` per selected gadget type. If
company creation fails the half-made user is removed.

```jsonc
{ "fname": "…", "lname": "…", "email": "…", "phoneNumber": "…",
  "gender": "male", "dateOfBirth": "05-05", "designation": "Operations Lead",
  "password": "…", "passwordConfirm": "…",
  "company": { "companyName": "…", "industry": "…",
               "businessAddress": { "fullAddress": "…", "lga": "…", "state": "…" } },
  "gadgets": [ { "gadgetType": "Phone", "gadgetQuantity": 20,
                 "gadgetServicePlan": "Annual", "comments": "…" } ] }
```

### `GET /api/v1/notifications`
New `?category=all|repairs|payments|protection|support` filter for the
dashboard tabs. `totalCount` now respects the filter, so "Showing 1 to 10 of
N" is right per tab.

### `GET /api/v1/repairs`
Excludes `draft` and `abandoned`.

---

## Payment settlement and double-verify safety

**The requirement: whichever of the webhook and the verify endpoint works is
fine, but a payment must never be fulfilled twice.**

Everything funnels into one function, `handlePaymentSuccess` in
`src/Features/PaymentLinks/controller.js`, whose first act is an atomic claim:

```js
const payment = await Payment.findOneAndUpdate(
  { transactionId: merchantOrderReference, status: "pending" },
  { $set: { status: "completed", … }, $unset: { expireAt: "" } },
  { new: true }
);

if (!payment) {
  // Someone else already settled it — the webhook, a concurrent verify, or a
  // Bank78 webhook retry. Report it and do nothing.
  return { payment: existing, alreadyProcessed: true };
}
```

A single `findOneAndUpdate` filtered on `status: "pending"` is atomic in
MongoDB, so exactly one caller can ever move a payment out of `pending`. That
caller owns fulfilment — locking the device, assigning the engineer, sending
notifications, incrementing `amountPaid`. Everyone else gets
`alreadyProcessed: true` and changes nothing.

Placement itself (`placeBooking` in `src/Helpers/bookingHelper.js`) repeats the
trick on the repair, so it is idempotent even if called directly:

```js
Repair.findOneAndUpdate(
  { _id: repairId, status: { $in: ["draft", "awaiting_booking_payment"] } },
  { $set: { status: "booked", … } }, { new: true }
);  // -> null means it was already placed
```

Two further guards:

- `reconcilePayment` returns `already_resolved` **without calling Bank78** when
  the payment is no longer pending, so repeated verify calls are cheap.
- Unrecognised Bank78 statuses are treated as *still pending*. We never fulfil
  on a status we do not understand; the next verify call or cron sweep looks
  again.

### Three ways a payment gets settled

1. **Webhook** — `POST /api/v1/payment/bank78Webhook` (unchanged, still
   mounted above `express.json()` with HMAC + 5-minute replay window).
2. **Verify on demand** — `GET /api/v1/payment/verify/:transactionId`, or
   `GET /api/v1/repairs/:repairId/payment-status`. Call these when the customer
   returns from checkout.
3. **Reconciliation sweep** — `src/Scripts/reconcilePendingPayments.js`, the
   existing Render cron. It walks every pending `Payment` and settles any that
   Bank78 reports as paid, with no webhook and no frontend involved. This is
   the real safety net for a missed webhook; the verify endpoint just makes it
   immediate for a waiting customer.

### A latent bug this fixed

`Payment.expireAt` had a **15-minute** TTL on pending payments. A customer
paying by bank transfer 20 minutes after checkout had no `Payment` record left
for the webhook *or* verify to settle against — the money arrived and the
booking could never be placed. It is now **24 hours** (aligned with the draft
window), and because `findOneAndUpdate` bypasses the `pre("save")` hook that
normally clears `expireAt`, the atomic claim unsets it explicitly. Without
that, a settled payment would still have been TTL-deleted.

---

## Schema changes

### `Repair` (`src/Features/Repairs/Models/Repairs.js`)
- `status` enum **+** `draft`, `awaiting_booking_payment`, `booked`, `abandoned`
- `paymentOption`, `partQuality`, `handoverType`, `returnMethod`, `timeWindow`,
  `contactName`, `contactPhone`
- `bookingCharge{ deliveryFee, returnFee, diagnosticFee, repairUpfront, total,
  currency, zone, status, payment, paidAt }`
- `draftExpiresAt`
- `quote{ parts, labour, returnDelivery, total, findings, photos[], issuedAt,
  issuedBy, decision, decidedAt, declineReason }`
- `additionalWork[{ note, parts, labour, amount, photos[], status, raisedAt,
  raisedBy, decidedAt, payment, emailSentAt, emailClaimedAt, emailAttempts }]`
  — `amount` is validated to equal `parts + labour` and to be at least 1, so a
  stored charge can never contradict the breakdown the customer approved, and a
  reduction cannot be smuggled in as a negative addendum
- `amountPaid`, `refundDue`
- `status` enum **+** `awaiting_customer_approval` (a cost revision is waiting
  on the customer)
- index on `{ user, status, createdAt }` and on
  `{ additionalWork.status, additionalWork.emailSentAt }` (the addendum email
  sweep)

### `Payment` (`src/Features/Payments/Models/Payments.js`)
- `purpose` — `booking_charge | repair_cost | additional_work`, plus reserved
  `insurance_premium | pay_later_deposit | pay_later_instalment`.
  **Defaults to `repair_cost`** so pre-existing documents stay valid.
- `breakdown[{ key, label, amount }]` for receipt lines
- `expireAt` TTL 15 minutes → 24 hours
- index on `{ repairId, purpose, status }`

### `PayLaterApplication` (new, `src/Features/PayLater/Models/PayLaterApplications.js`)
`user`, `repair`, `status` (`pending | more_info_needed | approved |
not_approved`), `amount`, `submittedAt`, `decideAfter`, `decidedAt`,
`decisionReason`, `provider`, `providerReference`, `emailSentAt`,
`emailClaimedAt`, `emailAttempts`. Holds **no identity data** — no NIN, no BVN,
no documents. Indexes: `{ status, decideAfter }` (the sweep),
`{ repair, status }` (the resume lookup), and a partial unique index on
`{ repair }` where `status: "pending"` so a double-tapped button cannot create
two applications.

### `Notification`
New types: `booking_fees_received`, `repair_payment_received`,
`quote_declined`, `additional_work_requested`, `pay_later_decision` (with
message templates). All five are in the `payments` category of
`GET /notifications?category=`.

### `FeeConfig` (new, `src/Features/Fees/Models/FeeConfig.js`)
Single document (`key: "global"`) holding the live fee configuration.

---

## Fee configuration

Defaults are in `src/Config/fees.js`; the DB document overrides them; read
both through `getFeeConfig()` in `src/Helpers/feeHelper.js` (cached 60s in
process, invalidated on write). Never query `FeeConfig` from a controller.

| Key | Default | Meaning |
|---|---|---|
| `diagnosticFee` | `5000` | Charged on every booking |
| `dropoffFee` | `0` | Logistics fee when the customer brings it in |
| `deliveryZones[]` | Lagos Mainland `2500`/`2500`, Lagos Island `3500`/`3500` | Per-zone pickup/return fees, matched by state + city |
| `chargeReturnLegAtBooking` | `true` | `false` bills the return leg on the engineer's quote instead |
| `chargeDiagnosticFeeOnPayNow` | `true` | `false` means paying upfront absorbs the diagnostic fee |
| `draftTtlHours` | `24` | How long a draft stays resumable |
| `payLaterEnabled` | `false` | Gates Repair Now, Pay Later entirely |
| `payLaterDecisionDelayMinutes` | `30` | Minutes from submitting an eligibility check to the decision |
| `payLaterMinimumAmount` | `0` | Smallest balance that may be financed; `0` means no minimum |

Zone matching: the address's `state` must match a zone, then its `city` against
that zone's `cities`, falling back to the zone marked `isStateDefault`. No
match ⇒ outside coverage ⇒ pickup refused, drop-off offered.

---

## Deployment notes

1. **Seed the new permission** before staff use the fee screens:
   ```bash
   npm run seed:permissions   # adds fees:manage to the catalog, refreshes super admins
   ```
   This is **not enough on its own for non-super-admins.** The seed never
   edits an existing role (so an intentional revoke isn't undone) and only
   backfills staff that have no `permissions` field at all, so a new key
   reaches super admins and nobody else. To give it to a role and the staff
   already holding that role:
   ```bash
   node src/Scripts/grantPermission.js fees:manage --role admin            # dry run
   node src/Scripts/grantPermission.js fees:manage --role admin --staff --apply
   ```
   For one person, use the API instead: `PATCH /api/v1/staff/:id/permissions`
   (super admin only).
2. **No migration is required.** New `Repair`/`Payment` fields are optional and
   `Payment.purpose` defaults to `repair_cost`, so historical payments keep
   settling through the legacy path.
3. **Frontend change required** for `POST /repairs/book` (see above). Until the
   client is updated, bookings will be created as drafts and never paid for —
   harmless (no device lock, no engineer assigned, hidden from `GET /repairs`)
   but nothing will be placed.
4. The TTL change takes effect for newly created payments. Existing pending
   documents keep their original 15-minute `expireAt`.
5. **Pay Later and cost revisions need no new permission, env var or
   infrastructure.** Both are off or inert until used: `payLaterEnabled`
   defaults to `false`, and a cost revision only exists once an engineer raises
   one.
6. **Turn Pay Later on deliberately**, per environment:
   ```bash
   curl -X PATCH "$API/admin/fees" -H "Authorization: Bearer $STAFF_TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{"payLaterEnabled": true, "payLaterDecisionDelayMinutes": 30}'
   ```
   Note `FeeConfig` is a **single global document**: if an environment shares
   `MONGO_URI` with production, changing it there changes it for production too.
7. **Check the scheduler started** after deploying: the boot log must read
   `:: Scheduler started with 2 job(s) ::`. No Render cron entry is needed for
   either job. If the service spins down when idle, no ticks run while it
   sleeps — nothing is lost, but outcomes and emails land late.
8. **New `Repair.status` values** are `draft`, `awaiting_booking_payment`,
   `booked`, `abandoned` and `awaiting_customer_approval`. Any client that
   switches on status needs them, and `awaiting_customer_approval` is also a
   useful staff filter (`GET /admin/repairs?status=`).

---

## Bank78 notes

- **The published docs were unreachable while this was written.**
  `docs.bank78.co` and `developer.bank78.co` returned `503`; `api.bank78.co`
  and `sandbox.bank78.co` returned `403`. Nothing here was changed on the basis
  of documentation I could not read, and the existing integration's endpoints
  (`{identity}/connect/token`, `POST {checkout}/api/merchant/orders/checkout`,
  `GET {checkout}/api/merchant/orders/{reference}/status`) are untouched.
- Because the status vocabulary is unverified, it is handled as **permissive
  supersets** of the one value the integration is known to return:
  - success: `PAID`, `SUCCESS`, `SUCCESSFUL`, `COMPLETED`
  - failure: `FAILED`, `CANCELLED`, `CANCELED`, `EXPIRED`, `ABANDONED`,
    `REVERSED`, `DECLINED`
  - anything else ⇒ still pending (never fulfilled).
  If Bank78 confirms the real list, narrow these two sets in
  `src/Features/PaymentLinks/controller.js`.
- **Bank78 enforces IP whitelisting.** Order creation from an un-whitelisted
  host fails with `403 "IP whitelisting is required…"`. This is now surfaced as
  a clean `502` carrying Bank78's own message instead of an unserialisable
  axios error (which the dev error handler turned into an HTML 500).
- Outside production the charged amount is still capped at ₦100 for test cards;
  the true amount is kept in `Payment.metadata.trueAmount` and on the repair.

---

## What was removed

`src/Jobs/cronJobs.js` (`cleanupUnpaidRepairs`), as requested before the prod
push. It was dead code — never `require`d anywhere — and could not have run as
written: it had no imports and referenced a `status: "pending_payment"` and a
`cancellationReason` field that do not exist on the model. The new flow does
not need it: drafts hold no device lock, so there is nothing to clean up.

`src/Scripts/reconcilePendingPayments.js` is a **different** cron and is
deliberately kept — it is the safety net for missed webhooks.

`src/Jobs/` has since come back for exactly the purpose that one failed at —
see [Scheduled jobs](#scheduled-jobs).

---

## Not implemented

From the Figma gap report, deliberately out of this change:

- **Pay Later offers, deposits and repayment plans.** The funnel itself is
  built — see [Repair Now, Pay Later (stopgap)](#repair-now-pay-later-stopgap)
  — but everything lender-shaped is missing because no lender is signed:
  offers, deposits, repayment schedules, instalment payments, late-payment
  rules, and any working `approved` or `more_info_needed` path. Identity
  capture (NIN, BVN, documents) waits on the lender telling us what they
  require and on a data-protection review of the consent wording.
- **Insurance** (plans, matching quiz, policies, claims) — blocked on written
  insurer confirmation of plans, premiums, exclusions, claim types and evidence
  rules.
- **Cancellation, reschedule, missed pickup, arrange return** (`B1`–`B6`) —
  all depend on refund and cut-off rules the design still marks as pending.
  This is also why a cost revision's `stop` decision records the customer's
  choice but does not change the repair's status.
- **Device verification states, IMEI/source fields, handover codes, public
  tracking numbers, the estimate flow's part-quality tiers** — separate
  branches in the build order.

## Open decisions

Still worth confirming; current behaviour in brackets:

1. **Diagnostic fee under `pay_now`** — [charged; `chargeDiagnosticFeeOnPayNow:
   true`]. Set it `false` to have paying upfront absorb it.
2. **Return leg timing** — [charged at booking;
   `chargeReturnLegAtBooking: true`]. The Figma quote panel lists "Return
   delivery (if applicable)" as a quote line, which `false` reproduces.
3. **`pay_now` upfront amount** — [the catalogue price for device + issue].
   Revisit once part-quality tiers add price ranges.

---

## How this was tested

`npm run dev` against the shared dev database, exercised with curl through the
public API (fixtures created and cleaned up afterwards). Verified:

| Check | Result |
|---|---|
| Preview, `pay_after_quote`, Ikeja pickup + delivery | `total: 10000` = 2500 + 2500 + 5000 |
| Preview, `pay_now`, same address | `total: 110000` (adds the ₦100,000 catalogue price) |
| Preview, Kano address | `serviceable: false` + `alternatives: ["office_dropoff"]` |
| Preview, drop-off + self-collection | `total: 5000` (diagnostic only) |
| `POST /repairs/book` | `status: draft`, `nextAction: booking_payment` |
| Device status while a draft exists | `active` — not locked |
| `GET /repairs` / `GET /repairs/drafts` | `0` / `1` |
| Bank78 unreachable (IP not whitelisted) | clean JSON `502`, draft left at `draft` |
| Guards | quote `404`; accept `404`; repair payment `400`; rating `400` |
| `DELETE /:id/draft`, then repeat | `success`; then `404` |
| Login by phone / by email / wrong password / neither | found account; found account; `401`; `400` |
| `?category=payments` / `bogus` / `all` | filtered; `400` with the valid list; filtered |
| `PATCH /notifications/:id/read`, `DELETE /notifications/:id` | mounted and reachable |
| `GET /admin/fees` without a staff token | `401` |
| `GET /payment/my-payments`, empty account | `results: 0`, zeroed summary |
| …with two seeded payments | newest first; `totalPaid: 10000` (completed only) |
| …`?status=`, `?purpose=`, `?sort=amount` | each filtered/ordered correctly |
| …`?limit=1&page=2` | page of 1, `totalCount: 2`, summary unchanged |
| …response fields | no `providerReference`/`metadata`; `paymentLink` only on the pending row |
| `GET /payment/my-payments/:id` as a **different** customer | `404` "Payment not found" |
| **Pay Later** submit, then submit again | `201` then `200` with the same `applicationId` |
| …two **concurrent** submits | both succeed, one application (partial unique index + duplicate-key catch) |
| …flag off / quote not accepted / below minimum / already paid | `400` each, with the customer-facing reason |
| …the decision sweep, end to end on a 1-minute delay | submitted 14:21:31, due 14:22:31, decided by the tick at 14:26:12, emailed 14:26:18 |
| …sweep run twice | `decided 0, emailed 0` — no re-decide, no second email |
| …a decided application whose email failed | retried on the next pass and stamped (`decided 0, emailed 1`) |
| …repair paid, or cancelled, before the decision | email skipped, stamped so it is not retried |
| **Cost revision** raise with breakdown and photos | `201`, `amount 25000`, `newTotal 125000`, repair at `awaiting_customer_approval` |
| …second revision while one is pending, incl. two **concurrent** raises | `400`; one addendum on the repair |
| …on a completed / cancelled / unquoted repair | `400` "You can only revise the cost of a repair that is in progress on an accepted quote" |
| …zero, sub-naira, missing note, bad photo type | `400` each; nothing written and no photo orphaned |
| …a sweep tick while the raise's email is in flight | `emailed 0`; once the claim goes stale, `emailed 1` |
| …tracking timeline while awaiting approval | 5 of 6 steps complete (was 1 of 6) |
| …engineer dashboard and active-load cap | `statusBreakdown.awaiting_customer_approval: 1`, `activeRepairs: 1` |
| …both status endpoints from `awaiting_customer_approval` | both move it to `in_progress` |
| …`skip` / `approve` | `in_progress` / stays blocked with `nextAction: additional_work_payment` |
| …malformed id / no auth | `400` / `401` |

**Not exercised locally**, because Bank78 rejects un-whitelisted IPs: the
actual settlement path (webhook, verify-settles-payment, placement,
notifications) and the resume-the-same-link behaviour. Run these from the
Render host, whose IP is whitelisted:

```bash
# 1. create a draft, then get a checkout link
curl -X POST "$API/repairs/$REPAIR/booking-payment" -H "Authorization: Bearer $TOKEN"

# 2. call it again — expect the SAME link with resumed: true
curl -X POST "$API/repairs/$REPAIR/booking-payment" -H "Authorization: Bearer $TOKEN"

# 3. pay the link, then verify. First call settles, the rest are no-ops:
curl "$API/payment/verify/$REFERENCE" -H "Authorization: Bearer $TOKEN"   # outcome: completed
curl "$API/payment/verify/$REFERENCE" -H "Authorization: Bearer $TOKEN"   # outcome: already_resolved
curl "$API/repairs/$REPAIR/payment-status" -H "Authorization: Bearer $TOKEN"

# 4. confirm fulfilment ran exactly once:
#    repair.status = booked/engineer_assigned, device = pending_repair,
#    amountPaid = the charge (once), and one booking_fees_received notification.
```
