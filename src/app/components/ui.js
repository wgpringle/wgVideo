'use client';

import clsx from 'clsx';

export function Card({ title, actions, children, compact }) {
  return (
    <div className={clsx('card', compact && 'card--compact')}>
      {(title || actions) && (
        <div className="card__header">
          <span className="card__title">{title}</span>
          <div className="card__actions">{actions}</div>
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button className={clsx('btn', `btn--${variant}`, `btn--${size}`)} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      <input className="input" {...props} />
    </label>
  );
}

export function Textarea({ label, rows = 3, ...props }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      <textarea className="textarea" rows={rows} {...props} />
    </label>
  );
}

export function Select({ label, options = [], ...props }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      <select className="select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__slider" />
      {label && <span className="toggle__label">{label}</span>}
    </label>
  );
}

export function RadioItem({ label, checked, onChange }) {
  return (
    <label className="radio">
      <input
        type="radio"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="radio__custom" />
      <span className="radio__label">{label}</span>
    </label>
  );
}

export function EmptyState({ message }) {
  return <div className="empty">{message}</div>;
}
