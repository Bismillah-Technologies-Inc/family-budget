import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import MonthSelector from './components/MonthSelector';
import CategoryGroup from './components/CategoryGroup';
import BudgetSummary from './components/BudgetSummary';
import './App.css';

const GROUP_ORDER = [
  'Immediate Obligations',
  'Daily Living',
  'True Expenses',
  'Debt Payments',
  'Business-Paid-Personally',
  'Buffer / Catch-up',
];

function App() {
  const [session, setSession] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch months
  const fetchMonths = useCallback(async () => {
    const { data, error } = await supabase
      .from('budget_months')
      .select('*')
      .order('month_label', { ascending: false });
    if (!error && data) {
      setMonths(data);
      if (data.length > 0 && !selectedMonth) {
        setSelectedMonth(data[0]);
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (session) fetchMonths();
  }, [session, fetchMonths]);

  // Fetch categories for selected month
  const fetchCategories = useCallback(async () => {
    if (!selectedMonth) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('month_id', selectedMonth.id)
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    if (session && selectedMonth) fetchCategories();
  }, [session, selectedMonth, fetchCategories]);

  // Update income
  const handleIncomeChange = async (newIncome) => {
    if (!selectedMonth) return;
    const { error } = await supabase
      .from('budget_months')
      .update({ income: newIncome })
      .eq('id', selectedMonth.id);
    if (!error) {
      setSelectedMonth({ ...selectedMonth, income: newIncome });
    }
  };

  // Update category amount
  const handleAmountChange = async (categoryId, newAmount) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;

    const { error } = await supabase
      .from('budget_categories')
      .update({ amount: newAmount })
      .eq('id', categoryId);
    if (!error) {
      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, amount: newAmount } : c
      ));
      // Log to history
      await supabase.from('budget_history').insert({
        category_id: categoryId,
        month_id: selectedMonth.id,
        changed_by: session.user.id,
        field_changed: 'amount',
        old_value: String(cat.amount),
        new_value: String(newAmount),
      });
    }
  };

  // Add category
  const handleAddCategory = async (groupName) => {
    const name = prompt('Category name:');
    if (!name || !name.trim()) return;
    const maxOrder = categories
      .filter(c => c.group_name === groupName)
      .reduce((max, c) => Math.max(max, c.sort_order), 0);
    const { data, error } = await supabase
      .from('budget_categories')
      .insert({
        month_id: selectedMonth.id,
        group_name: groupName,
        category_name: name.trim(),
        amount: 0,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (!error && data) {
      setCategories([...categories, data]);
    }
  };

  // Remove category
  const handleRemoveCategory = async (categoryId) => {
    if (!confirm('Remove this category?')) return;
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId);
    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  // Add new month
  const handleAddMonth = async () => {
    const label = prompt('Month label (e.g. "May 2026"):');
    if (!label || !label.trim()) return;
    const { data, error } = await supabase
      .from('budget_months')
      .insert({ month_label: label.trim(), income: 0 })
      .select()
      .single();
    if (!error && data) {
      setMonths([data, ...months]);
      setSelectedMonth(data);
    }
  };

  // Group categories
  const groupedCategories = {};
  for (const group of GROUP_ORDER) {
    groupedCategories[group] = categories.filter(c => c.group_name === group);
  }
  // Add any other groups not in the order
  for (const cat of categories) {
    if (!groupedCategories[cat.group_name]) {
      groupedCategories[cat.group_name] = [cat];
    }
  }

  const totalExpenses = categories.reduce((sum, c) => sum + Number(c.amount), 0);

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Family Budget</h1>
        <div className="header-right">
          <span className="user-email">{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} className="btn-logout">Sign Out</button>
        </div>
      </header>

      <div className="app-body">
        <div className="controls">
          <MonthSelector
            months={months}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
            onAddMonth={handleAddMonth}
          />
        </div>

        {selectedMonth && (
          <BudgetSummary
            income={selectedMonth.income}
            totalExpenses={totalExpenses}
            onIncomeChange={handleIncomeChange}
          />
        )}

        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : (
          <div className="category-groups">
            {Object.entries(groupedCategories).map(([groupName, items]) => (
              <CategoryGroup
                key={groupName}
                name={groupName}
                categories={items}
                onAmountChange={handleAmountChange}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
