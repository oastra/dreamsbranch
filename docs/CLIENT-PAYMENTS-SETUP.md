# Setting up donations on dreamsbranch.org — what we need from you

To accept donations on the website we need to connect two payment providers: **Stripe** (handles credit/debit cards) and **PayPal** (handles PayPal accounts + their own cards). You'll register on both, then send the developer the keys listed at the bottom of this document.

You will need:
- Your charity's bank card (you already have this ✅)
- Your charity's bank account details (BSB + account number for AU)
- Your charity's ABN and business address
- About 1 hour total

---

## Part 1 — Stripe

### Step 1. Register

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with the charity's email (use one with shared access — `dreamsbrunch@gmail.com` is fine).
3. When asked **"What country is your business based in?"** → choose **Australia**.
4. Confirm the email link Stripe sends.

### Step 2. Activate the account

In the Stripe dashboard you will see a yellow banner **"Activate your account"** or **"Complete your business profile"**. Click it and fill in:

- Business type → **Non-profit organisation** (or "Company" if Non-profit isn't offered)
- ABN
- Business name and registered address
- Website → `https://dreamsbranch.org`
- A short description of what you do
- Your name, date of birth, address (Stripe asks for one director / representative)
- Bank account → BSB + account number (this is where the donations will arrive, usually 2–7 days after the donation)

Save and submit. Stripe usually approves within minutes to a few hours.

### Step 3. Get the keys we need

Once activated, in the Stripe dashboard:

1. Top right → make sure the toggle says **"Live mode"** (not "Test mode").
2. Left menu → **Developers** → **API keys**.
3. You'll see two values. Copy them:
   - **Publishable key** — starts with `pk_live_...` → this is your `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** — click "Reveal live key", starts with `sk_live_...` → this is your `STRIPE_SECRET_KEY`
   - ⚠ The secret key is shown only once. Copy it immediately into a password manager or a secure note.

> The third Stripe value (`STRIPE_WEBHOOK_SECRET`) the developer will generate themselves after deploying — you don't need to send it.

---

## Part 2 — PayPal

### Step 1. Register a Business account

1. Go to **https://www.paypal.com/au/business**
2. Click **Sign Up** → choose **Business Account** (not Personal).
3. Use the charity's email.
4. Country → **Australia**, currency → **AUD**.
5. Fill in business details:
   - Legal business name (as registered)
   - ABN
   - Business address
   - Phone
   - Website → `https://dreamsbranch.org`
   - Business category → **Charity / Non-profit**
6. Add a director's personal details when asked (PayPal requires one named representative).
7. Link the charity bank account (BSB + account number) and confirm the small deposits PayPal sends — this is how donated money will reach you.

### Step 2. Apply for the non-profit fee discount (optional but recommended)

Charities in Australia can ask PayPal for reduced transaction fees:
- https://www.paypal.com/au/webapps/mpp/non-profit
- Click **Apply now**, attach the ATO charity / DGR endorsement letter.
- This step can run in parallel with the rest — it doesn't block donations.

### Step 3. Get the keys we need

Once the business account is active:

1. Go to **https://developer.paypal.com/dashboard/applications/live**
   *(Make sure the toggle at the top says "Live", not "Sandbox".)*
2. Click **Create App**.
   - App name: `DreamsBranch Donations`
   - Type: **Merchant**
   - Click **Create**.
3. On the app's page you will now see:
   - **Client ID** → this is your `PAYPAL_CLIENT_ID`
   - **Secret** — click "Show", then copy → this is your `PAYPAL_CLIENT_SECRET`
4. Scroll down to **Webhooks** → click **Add Webhook**.
   - Webhook URL: ask the developer for it (it will look like `https://dreamsbranch.org/api/paypal/webhook`)
   - Events: tick **"Checkout - order completed"** and **"Payment capture completed"**, then save.
   - After saving, copy the **Webhook ID** that appears → this is your `PAYPAL_WEBHOOK_ID`

---

## Part 3 — What to send the developer

Please paste these into a password-protected message (1Password, Bitwarden share link, or signal/encrypted email — **not plain email**):

```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
```

Also let me know:
- Whether the Stripe account is fully **activated** (green tick in the dashboard), or still pending — Stripe sometimes asks for additional documents.
- The PayPal business email — needed for testing the first donation.

Once I have all of that, I'll wire up the live donation flow on the campaigns pages, run a $1 test donation through both providers, and refund it. After that you're live.

---

## Important notes

- ⚠ **Never share the Secret keys via plain email or chat.** If they're ever exposed publicly, log into the provider and rotate (regenerate) them immediately.
- The same keys will be used on both live and staging — we don't need a separate set unless you specifically want a sandbox/test environment.
- Donation receipts: by default Stripe sends an automatic receipt to the donor's email. PayPal does the same. If you want a custom receipt with your charity branding, mention it and we'll set that up separately.
- Refunds: you can issue refunds directly from each provider's dashboard at any time — no developer needed.
