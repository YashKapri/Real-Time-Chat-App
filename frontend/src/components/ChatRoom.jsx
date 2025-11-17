// frontend/src/components/ChatRoom.jsx

import { useEffect, useRef, useState } from 'react';
import { createWebSocketConnection } from '../api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UploadButton from './UploadButton';

export default function ChatRoom({ userName }) {
  const [socketState, setSocketState] = useState('disconnected'); // connecting | connected | disconnected
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const ws = createWebSocketConnection(userName);
    if (!ws) {
      setSocketState('disconnected');
      return;
    }

    setSocketState('connecting');
    socketRef.current = ws;

    ws.onopen = () => {
      setSocketState('connected');
      pushSystemMessage('Connected to chat.');
    };

    ws.onclose = () => {
      setSocketState('disconnected');
      pushSystemMessage('Disconnected from chat.');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error', err);
      pushSystemMessage('WebSocket error occurred.');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_MESSAGE') {
          const m = payload.message;
          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              createdAt: m.createdAt,
              userId: m.userId,
              userName: m.userName,
              content: m.content
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to parse incoming message', err);
      }
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const pushSystemMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        userName: 'system',
        content: text
      }
    ]);
  };

  const handleSend = (text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      pushSystemMessage('Cannot send message: socket not connected.');
      return;
    }

    const payload = {
      action: 'sendMessage',
      content: text
    };

    socketRef.current.send(JSON.stringify(payload));
  };

  const statusLabel =
    socketState === 'connected'
      ? 'Live'
      : socketState === 'connecting'
      ? 'Connecting...'
      : 'Offline';

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-room-title">Global Room</div>
          <div className="chat-room-subtitle">Serverless WebSocket chat (DynamoDB-backed).</div>
        </div>
        <div className="chat-header-right">
          <span>
            Signed in as <strong>{userName}</strong>
          </span>
          <span className="badge-online">
            <span className="badge-dot" />
            {statusLabel}
          </span>
        </div>
      </div>

      <MessageList messages={messages} currentUserName={userName} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <UploadButton currentUserName={userName} userId={userName} />
      </div>

      <MessageInput onSend={handleSend} disabled={socketState !== 'connected'} />
    </div>
  );
}
