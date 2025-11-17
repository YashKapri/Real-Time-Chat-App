// frontend/src/components/LoginForm.jsx

import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    onLogin(name.trim());
    setTimeout(() => setIsSubmitting(false), 200); // tiny UX delay
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Identity</div>
          <div className="card-subtitle">Pick a display name for this session.</div>
        </div>
        <div className="badge-online">
          <span className="badge-dot" />
          Ready
        </div>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-row">
          <label className="login-label">Display name</label>
          <input
            className="input"
            placeholder="E.g. rajesh.dev"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
        </div>

        <div className="login-actions">
          <button className="button" type="submit" disabled={!name.trim() || isSubmitting}>
            Join global room
          </button>
        </div>
      </form>
    </div>
  );
}
