# Family Budget App

A simple, interactive budget tracker built with React + Vite + Supabase. Designed for Farzana to view and edit budget categories and amounts month by month.

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting:** AWS Amplify

## Features

- 📅 Month-by-month budget tracking
- 👤 Email + Google authentication via Supabase
- ✏️ Click-to-edit amounts (inline editing)
- ➕ Add/remove categories within groups
- 📊 Auto-calculated totals (income, expenses, remaining balance)
- 📝 Change history tracking
- 📱 Mobile-responsive design

---

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization, give it a name (e.g. "Family Budget"), set a database password
4. Select a region close to you
5. Click **"Create new project"** and wait ~2 minutes for it to provision

### Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repo
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or Ctrl+Enter)
6. You should see "Success. No rows returned" — the schema + seed data is now loaded

This creates:
- `budget_months` — stores monthly budget periods with income
- `budget_categories` — all your budget line items grouped by category
- `budget_history` — tracks who changed what and when
- Row Level Security policies so only logged-in users can access data
- A seed month ("April 2026") with all default categories from the budget structure

### Step 3: Get Your Supabase Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public** key (a long JWT string)

### Step 4: Configure the App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and paste your real values:
   ```
   VITE_SUPABASE_URL=https://your-actual-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

### Step 5: Test Locally

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`). You should see the login page.

### Step 6: Enable Google Auth (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Toggle **Google** on
3. You'll need to create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create an OAuth 2.0 Client ID (Web application)
   - Add your Amplify domain to Authorized redirect URIs: `https://your-domain.amplifyapp.com`
   - Copy the Client ID and Client Secret into Supabase
4. After deploying, update the redirect URI in both Google Cloud and Supabase with your production URL

---

## Deploy to AWS Amplify

### Step 7: Push to GitHub

```bash
cd budget-app
git init
git add .
git commit -m "Initial budget app"
git remote add origin https://github.com/your-username/family-budget.git
git push -u origin main
```

### Step 8: Deploy on Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New App"** → **"Host web app"**
3. Select **GitHub** as the source
4. Authorize AWS Amplify to access your GitHub account
5. Select your repo and branch (`main`)
6. Build settings — the defaults work fine (Vite is auto-detected):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
7. Click **"Save and deploy"**

### Step 9: Add Environment Variables in Amplify

1. In your Amplify app, go to **Environment variables** (under Hosting)
2. Add the two variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Click **"Save"** and trigger a new build (or redeploy)

### Step 10: Set Up Supabase Auth Redirect

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Amplify domain: `https://your-domain.amplifyapp.com`
3. If using Google OAuth, update the redirect URI in Google Cloud Console too

---

## Project Structure

```
budget-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Auth (email + Google)
│   │   ├── MonthSelector.jsx  # Pick/switch budget months
│   │   ├── CategoryGroup.jsx  # Collapsible category groups
│   │   ├── CategoryRow.jsx    # Individual category with inline editing
│   │   └── BudgetSummary.jsx  # Income, expenses, remaining totals
│   ├── lib/
│   │   └── supabase.js        # Supabase client config
│   ├── App.jsx                # Main app logic
│   ├── App.css                # All styles
│   └── main.jsx               # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # DB schema + seed data
├── .env.example               # Placeholder env vars
├── index.html
├── package.json
└── README.md
```

## Budget Category Groups

The app comes pre-seeded with these groups (from the family budget structure):

1. **Immediate Obligations** — Housing, Utilities, Internet, Phones, Insurance, Car, Fuel, Minimum Debt, Legal, Child/Family
2. **Daily Living** — Groceries, Restaurants, Household, Medical, Family/Kids, Personal
3. **True Expenses** — Car Maintenance, Home Maintenance, Documents, Annual Fees, Gifts, Travel, Taxes Reserve
4. **Debt Payments** — Credit Card Paydown, Loan Paydown, Payment Plans
5. **Business-Paid-Personally** — Reimbursable Expenses, Owner Draw
6. **Buffer / Catch-up** — Unknown Upcoming, Cash Flow Buffer, Cleanup

## How to Use

1. **Sign in** with email/password or Google
2. **Set your monthly income** — click the income amount to edit
3. **Fill in category amounts** — click any dollar amount to edit, press Enter to save
4. **Add categories** — click "+ Add Category" at the bottom of any group
5. **Remove categories** — hover over a row and click the ✕ button
6. **Switch months** — use the dropdown, or create a new month with "+ New Month"
7. **Collapse groups** — click the group header to toggle visibility

## Notes

- All amounts are stored as numbers with 2 decimal places
- Changes are logged to `budget_history` for audit trail
- The app uses Supabase Row Level Security — only authenticated users can read/write data
- Category sort order is preserved within each group
- The app is mobile-responsive and works on phones/tablets
