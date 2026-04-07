export default function MonthSelector({ months, selectedMonth, onSelect, onAddMonth }) {
  return (
    <div className="month-selector">
      <label htmlFor="month-select">Budget Month</label>
      <select
        id="month-select"
        value={selectedMonth?.id || ''}
        onChange={(e) => {
          const m = months.find(m => m.id === e.target.value);
          if (m) onSelect(m);
        }}
      >
        {months.map(m => (
          <option key={m.id} value={m.id}>{m.month_label}</option>
        ))}
      </select>
      <button onClick={onAddMonth} className="btn-add-month">+ New Month</button>
    </div>
  );
}
