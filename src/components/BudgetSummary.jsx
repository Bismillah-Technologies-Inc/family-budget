import { useState, useRef, useEffect } from 'react';

export default function BudgetSummary({ income, totalExpenses, onIncomeChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(income));
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(String(income));
  }, [income]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const remaining = Number(income) - totalExpenses;

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onIncomeChange(num);
    } else {
      setValue(String(income));
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(String(income));
      setEditing(false);
    }
  };

  return (
    <div className="budget-summary">
      <div className="summary-card income-card">
        <span className="summary-label">Monthly Income</span>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            className="summary-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="summary-value income-value" onClick={() => setEditing(true)} title="Click to edit">
            ${Number(income).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <div className="summary-card expense-card">
        <span className="summary-label">Total Expenses</span>
        <span className="summary-value expense-value">
          ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className={`summary-card balance-card ${remaining < 0 ? 'negative' : 'positive'}`}>
        <span className="summary-label">Remaining</span>
        <span className="summary-value balance-value">
          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
