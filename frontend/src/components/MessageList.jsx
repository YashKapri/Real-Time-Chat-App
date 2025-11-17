// frontend/src/components/MessageList.jsx

export default function MessageList({ messages, currentUserName }) {
  if (!messages.length) {
    return (
      <div className="message-list">
        <div className="message-list-empty">
          No messages yet. Say hello to start the conversation 🚀
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((m) => {
        const isSelf = m.userName === currentUserName;
        if (m.type === 'SYSTEM') {
          return (
            <div className="message-system" key={m.id}>
              {m.content}
            </div>
          );
        }

        return (
          <div className="message-row" key={m.id}>
            <div className="message-meta">
              <span className="message-meta-name">
                {m.userName}
                {isSelf ? ' (you)' : ''}
              </span>
              <span className="message-meta-time">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className={`message-bubble ${isSelf ? 'message-bubble-self' : ''}`}>
              {m.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
