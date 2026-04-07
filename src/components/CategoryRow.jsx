import { useState, useRef, useEffect } from 'react';

export default function CategoryRow({ category, onAmountChange, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(category.amount));
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onAmountChange(category.id, num);
    } else {
      setValue(String(category.amount));
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(String(category.amount));
      setEditing(false);
    }
  };

  return (
    <div className="category-row">
      <span className="category-name">{category.category_name}</span>
      <div className="category-amount-wrap">
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            className="amount-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className="category-amount"
            onClick={() => setEditing(true)}
            title="Click to edit"
          >
            ${Number(category.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <button
        className="btn-remove"
        onClick={() => onRemove(category.id)}
        title="Remove category"
      >
        ✕
      </button>
    </div>
  );
}
