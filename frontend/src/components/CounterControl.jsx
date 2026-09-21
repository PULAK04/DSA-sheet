import { Minus, Plus } from 'lucide-react';

export default function CounterControl({ label, value, onChange, disabled }) {
  const bump = (delta) => onChange(Math.max(0, (value || 0) + delta));
  return (
    <div className="counter-control">
      <span className="counter-label">{label}</span>
      <div className="counter-buttons">
        <button type="button" onClick={() => bump(-1)} disabled={disabled || !value}><Minus size={13} /></button>
        <span className="counter-num">{value || 0}</span>
        <button type="button" onClick={() => bump(1)} disabled={disabled}><Plus size={13} /></button>
      </div>
    </div>
  );
}
