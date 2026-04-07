-- Budget App Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. budget_months table
-- ============================================
CREATE TABLE IF NOT EXISTS budget_months (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_label TEXT NOT NULL UNIQUE,  -- e.g. "2026-04" or "April 2026"
  income NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. budget_categories table
-- ============================================
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_id UUID NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month_id, group_name, category_name)
);

CREATE INDEX idx_categories_month ON budget_categories(month_id);
CREATE INDEX idx_categories_group ON budget_categories(group_name);

-- ============================================
-- 3. budget_history table (change tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS budget_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  month_id UUID REFERENCES budget_months(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES auth.users(id),
  field_changed TEXT NOT NULL,       -- 'amount', 'category_name', 'group_name', 'added', 'removed'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_history_month ON budget_history(month_id);
CREATE INDEX idx_history_category ON budget_history(category_id);

-- ============================================
-- 4. Updated-at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_budget_months_updated
  BEFORE UPDATE ON budget_months
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_budget_categories_updated
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. Row Level Security (RLS)
-- ============================================
ALTER TABLE budget_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all budget data
CREATE POLICY "Allow read for authenticated users" ON budget_months
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON budget_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON budget_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow write for authenticated users" ON budget_months
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow write for authenticated users" ON budget_categories
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow write for authenticated users" ON budget_history
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 6. Seed data — April 2026
-- ============================================
INSERT INTO budget_months (month_label, income) VALUES ('April 2026', 0)
ON CONFLICT (month_label) DO NOTHING;

-- Seed categories from Draft Budget V1 structure
DO $$
DECLARE
  v_month_id UUID;
BEGIN
  SELECT id INTO v_month_id FROM budget_months WHERE month_label = 'April 2026';

  -- Immediate Obligations
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'Immediate Obligations', 'Housing', 0, 1),
    (v_month_id, 'Immediate Obligations', 'Utilities', 0, 2),
    (v_month_id, 'Immediate Obligations', 'Internet', 0, 3),
    (v_month_id, 'Immediate Obligations', 'Phones', 0, 4),
    (v_month_id, 'Immediate Obligations', 'Insurance', 0, 5),
    (v_month_id, 'Immediate Obligations', 'Car Payment', 0, 6),
    (v_month_id, 'Immediate Obligations', 'Fuel', 0, 7),
    (v_month_id, 'Immediate Obligations', 'Minimum Debt Payments', 0, 8),
    (v_month_id, 'Immediate Obligations', 'Legal / Required Payments', 0, 9),
    (v_month_id, 'Immediate Obligations', 'Child / Family Obligations', 0, 10)
  ON CONFLICT DO NOTHING;

  -- Daily Living
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'Daily Living', 'Groceries', 0, 1),
    (v_month_id, 'Daily Living', 'Restaurants', 0, 2),
    (v_month_id, 'Daily Living', 'Household', 0, 3),
    (v_month_id, 'Daily Living', 'Medical', 0, 4),
    (v_month_id, 'Daily Living', 'Family / Kids', 0, 5),
    (v_month_id, 'Daily Living', 'Personal Spending', 0, 6)
  ON CONFLICT DO NOTHING;

  -- True Expenses
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'True Expenses', 'Car Maintenance', 0, 1),
    (v_month_id, 'True Expenses', 'Home Maintenance', 0, 2),
    (v_month_id, 'True Expenses', 'Documents / Admin', 0, 3),
    (v_month_id, 'True Expenses', 'Annual Fees / Subscriptions', 0, 4),
    (v_month_id, 'True Expenses', 'Gifts', 0, 5),
    (v_month_id, 'True Expenses', 'Travel', 0, 6),
    (v_month_id, 'True Expenses', 'Taxes Reserve', 0, 7)
  ON CONFLICT DO NOTHING;

  -- Debt Payments
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'Debt Payments', 'Credit Card Paydown', 0, 1),
    (v_month_id, 'Debt Payments', 'Loan Paydown', 0, 2),
    (v_month_id, 'Debt Payments', 'Payment Plans', 0, 3)
  ON CONFLICT DO NOTHING;

  -- Business-Paid-Personally Cleanup
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'Business-Paid-Personally', 'Reimbursable Business Expenses', 0, 1),
    (v_month_id, 'Business-Paid-Personally', 'Owner Draw / Mixed Expense Cleanup', 0, 2)
  ON CONFLICT DO NOTHING;

  -- Buffer / Catch-up
  INSERT INTO budget_categories (month_id, group_name, category_name, amount, sort_order) VALUES
    (v_month_id, 'Buffer / Catch-up', 'Unknown Upcoming', 0, 1),
    (v_month_id, 'Buffer / Catch-up', 'Cash Flow Buffer', 0, 2),
    (v_month_id, 'Buffer / Catch-up', 'Cleanup / One-off Obligations', 0, 3)
  ON CONFLICT DO NOTHING;

END $$;
