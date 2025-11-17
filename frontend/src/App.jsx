// frontend/src/App.jsx

import { useState } from 'react';
import LoginForm from './components/LoginForm';
import ChatRoom from './components/ChatRoom';
import './styles.css';

export default function App() {
  const [userName, setUserName] = useState(null);

  return (
    <div className="app-root">
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="app-title">
            <span>⚡ Realtime Chat</span>
            <span className="app-title-pill">Serverless</span>
          </div>
          <div className="app-title-sub">
            AWS Lambda + API Gateway WebSocket + DynamoDB + S3 (India-ready).
          </div>
          <LoginForm onLogin={setUserName} />
        </aside>
        <main className="app-main">
          {userName ? (
            <ChatRoom userName={userName} />
          ) : (
            <div className="card">
              <div className="card-title">Welcome</div>
              <div className="card-subtitle">
                Enter a display name on the left to join the global room.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
