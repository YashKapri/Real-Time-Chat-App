// frontend/src/components/MessageInput.jsx

import { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-row">
      <input
        className="input"
        placeholder={disabled ? 'Connecting...' : 'Type a message and press Enter'}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="button"
        type="button"
        disabled={disabled || !value.trim()}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
