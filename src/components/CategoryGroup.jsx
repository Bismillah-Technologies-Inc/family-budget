import { useState } from 'react';
import CategoryRow from './CategoryRow';

export default function CategoryGroup({ name, categories, onAmountChange, onAddCategory, onRemoveCategory }) {
  const [collapsed, setCollapsed] = useState(false);
  const total = categories.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="category-group">
      <div className="group-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="group-toggle">{collapsed ? '▶' : '▼'}</span>
        <span className="group-name">{name}</span>
        <span className="group-total">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      {!collapsed && (
        <div className="group-body">
          {categories.map(cat => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onAmountChange={onAmountChange}
              onRemove={onRemoveCategory}
            />
          ))}
          <button className="btn-add-category" onClick={() => onAddCategory(name)}>
            + Add Category
          </button>
        </div>
      )}
    </div>
  );
}
